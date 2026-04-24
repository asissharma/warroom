import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SyllabusModel } from '@/app/lib/models/Syllabus';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';

export async function GET() {
  await connectDB();
  
  try {
    // 1. Get the registry of all syllabuses
    const syllabuses = await SyllabusModel.find({}).sort({ name: 1 });

    // 2. Fetch stats for the overview
    // Note: In a production app with huge data, we might aggregate this 
    // or cache it. For now, we'll do quick counts.
    const counts = await SyllabusItemModel.aggregate([
      { $group: { _id: '$syllabusSlug', count: { $sum: 1 } } }
    ]);
    
    const countMap: Record<string, number> = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    // 3. Get Highlights for Overview
    const now = new Date(); now.setHours(0,0,0,0);
    const highlights = {
      spine: await SyllabusItemModel.find({ syllabusSlug: 'tech-spine', status: 'in_progress' }).limit(3),
      projects: await SyllabusItemModel.find({ syllabusSlug: 'projects', status: 'in_progress' }).limit(2),
      gaps: await SyllabusItemModel.find({ 'gap.severity': 'critical', 'gap.isFlagged': true }).limit(5),
      overdue: await SyllabusItemModel.find({ 'sm2.nextReviewDate': { $lte: now } }).sort({ 'sm2.nextReviewDate': 1 }).limit(5)
    };

    // 4. Aggregate per-slug status breakdown
    const statusBreakdown = await SyllabusItemModel.aggregate([
      { $group: {
        _id: { slug: '$syllabusSlug', status: '$status' },
        count: { $sum: 1 }
      }}
    ]);

    const overdueBySlug = await SyllabusItemModel.aggregate([
      { $match: { 'sm2.nextReviewDate': { $lte: now } } },
      { $group: { _id: '$syllabusSlug', count: { $sum: 1 } } }
    ]);
    const overdueMap: Record<string, number> = {};
    overdueBySlug.forEach(o => { overdueMap[o._id] = o.count; });

    // Build a rich per-slug stats map
    const domainStats: Record<string, any> = {};
    for (const s of syllabuses) {
      domainStats[s.slug] = {
        total: countMap[s.slug] || 0,
        mastered: 0, in_progress: 0, not_started: 0, other: 0,
        overdue: overdueMap[s.slug] || 0
      };
    }
    statusBreakdown.forEach(row => {
      const slug = row._id.slug;
      const status = row._id.status;
      if (!domainStats[slug]) return;
      if (status === 'done' || status === 'mastered' || status === 'completed') domainStats[slug].mastered += row.count;
      else if (status === 'in_progress' || status === 'surface' || status === 'solid') domainStats[slug].in_progress += row.count;
      else if (status === 'not_started') domainStats[slug].not_started += row.count;
      else domainStats[slug].other += row.count;
    });

    const stats = {
      totalItems: Object.values(countMap).reduce((a: number, b: number) => a + b, 0),
      openGaps: await SyllabusItemModel.countDocuments({ 'gap.isFlagged': true }),
      totalOverdue: Object.values(overdueMap).reduce((a, b) => a + b, 0),
      domains: domainStats
    };

    return NextResponse.json({
      success: true,
      registry: syllabuses,
      stats,
      highlights
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
