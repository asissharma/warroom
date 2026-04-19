import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';

export async function GET() {
  await connectDB();

  try {
    // A "gap" is an item that is flagged
    const gaps = await SyllabusItemModel.find({ 'gap.isFlagged': true }).sort({ 'gap.severity': -1, updatedAt: -1 });

    // Map to a format the GapTrackerTab understands
    const formatted = gaps.map(g => ({
        _id: g._id,
        concept: g.title,
        severity: g.gap?.severity || 'low',
        sourceType: g.syllabusSlug,
        flagCount: g.gap?.flagCount || 0,
        lastAddressed: g.gap?.lastAddressedAt ? new Date(g.gap.lastAddressedAt).toLocaleDateString() : '—',
        depthReached: g.completedCount > 0 ? 3 : (g.status === 'in_progress' ? 1 : 0) // Naive mapping
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
