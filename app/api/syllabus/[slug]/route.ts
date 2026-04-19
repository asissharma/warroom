import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await connectDB();

  try {
    const items = await SyllabusItemModel.find({ syllabusSlug: slug }).sort({ orderIndex: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: items
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
