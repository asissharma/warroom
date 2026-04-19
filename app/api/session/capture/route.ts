import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SessionModel } from '@/app/lib/models/Session';
import { Capture } from '@/app/lib/models'; // Assuming it's in index or I can use the specific file

// Actually let's import directly to be safe
import CaptureModel from '@/app/lib/models/Capture';

export async function POST(request: Request) {
  await connectDB();
  
  try {
    const { type, note, blockType, refId, refName, sessionDay } = await request.json();

    if (!note) {
      return NextResponse.json({ error: 'Note is required.' }, { status: 400 });
    }

    // Create the capture
    const capture = await CaptureModel.create({
      type,
      note,
      blockType,
      refId,
      refName,
      dayNumber: sessionDay,
      tags: [], // Could add AI tagging here later
      createdAt: new Date()
    });

    // Link to session if it exists for today
    const todayStr = new Date().toISOString().slice(0, 10);
    await SessionModel.updateOne(
        { date: todayStr },
        { $push: { captures: capture._id } }
    );

    return NextResponse.json({ 
        success: true, 
        capture,
        aiSummary: "Capture logged." // Placeholder for Phase 7
    });
  } catch (error: any) {
    console.error('Capture error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
