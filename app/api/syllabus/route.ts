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
    // - Critical Gaps
    // - Most overdue spine topics
    // - Active projects
    const highlights = {
      spine: await SyllabusItemModel.find({ syllabusSlug: 'tech-spine', status: 'in_progress' }).limit(3),
      projects: await SyllabusItemModel.find({ syllabusSlug: 'projects', status: 'in_progress' }).limit(2),
      gaps: await SyllabusItemModel.find({ 'gap.severity': 'critical', 'gap.isFlagged': true }).limit(3)
    };

    const stats = {
      spine: countMap['tech-spine'] || 0,
      questions: countMap['questions'] || 0,
      openGaps: await SyllabusItemModel.countDocuments({ 'gap.isFlagged': true }),
      softSkills: countMap['soft-skills'] || 0,
      payableSkills: countMap['payable-skills'] || 0
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
