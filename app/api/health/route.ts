import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SyllabusModel } from '@/app/lib/models/Syllabus';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';
import { SessionModel } from '@/app/lib/models/Session';

export async function GET() {
  await connectDB();
  
  try {
    const [syllabuses, items, sessions] = await Promise.all([
      SyllabusModel.countDocuments(),
      SyllabusItemModel.countDocuments(),
      SessionModel.countDocuments()
    ]);

    return NextResponse.json({
      db: 'ok',
      counts: {
        syllabuses,
        items,
        sessions
      }
    });
  } catch (error: any) {
    return NextResponse.json({ db: 'error', message: error.message }, { status: 500 });
  }
}
