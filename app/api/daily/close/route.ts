import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import GapTracker from '@/app/lib/models/GapTracker';

export async function POST(request: Request) {
  await connectDB();
  
  try {
    const { sessionId, honestNote, driftEventsCount = 0 } = await request.json();

    if (!sessionId || !honestNote) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (honestNote.length < 20) {
      return NextResponse.json({ error: 'Honest note must be at least 20 characters.' }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    if (session.isClosed) {
        return NextResponse.json({ error: 'Session is already closed' }, { status: 400 });
    }

    // Calculate momentum score
    let momentum = 0;
    const blocks = session.blocks;

    // Project: Done=5, Partial=2, Skipped=0
    if (blocks.project?.status === 'Done') momentum += 5;
    else if (blocks.project?.status === 'Partial') momentum += 2;

    // Questions: correctTotal x 3
    if (blocks.questions?.correct) {
      momentum += (blocks.questions.correct * 3);
    }

    // Skills: soft+payable done = +2
    if (blocks.softSkill?.isDone && blocks.payableSkill?.isDone) {
      momentum += 2;
    }

    // Drift Penalty: -0.5 per event
    momentum -= (driftEventsCount * 0.5);

    session.momentumScore = momentum;
    session.honestNote = honestNote;
    session.isClosed = true;

    // Tomorrow Focus
    session.tomorrowFocus = "Auto-generated: Focus on next spine module based on pace.";

    await session.save();

    // Side effects logic (Gap updates, etc. can go here based on flags)
    if (blocks.questions?.struggled && blocks.questions.struggled > 0) {
        // Find or create Gap for struggled questions
        const gap = await GapTracker.findOne({ sourceType: 'question', sourceId: 'daily-session', status: 'open' });
        if (gap) {
            gap.flagCount += blocks.questions.struggled;
            // escalate severity based on logic
            if (gap.flagCount >= 4) gap.severity = 'critical';
            else if (gap.flagCount >= 3) gap.severity = 'medium';
            await gap.save();
        } else {
            await GapTracker.create({
                concept: 'Struggled on daily questions',
                sourceType: 'question',
                sourceId: 'daily-session',
                flagCount: blocks.questions.struggled,
                severity: 'low',
                status: 'open'
            });
        }
    }

    return NextResponse.json({ success: true, momentumScore: momentum, tomorrowFocus: session.tomorrowFocus });
  } catch (error: any) {
    console.error('Close Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
