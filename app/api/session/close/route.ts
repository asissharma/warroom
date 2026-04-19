import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SessionModel } from '@/app/lib/models/Session';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';
import { calcScore } from '@/app/lib/engine/score';
import { calcTomorrowFocus } from '@/app/lib/engine/tomorrowFocus';

export async function POST(request: Request) {
  await connectDB();
  
  try {
    const { sessionId, honestNote } = await request.json();

    if (!sessionId || !honestNote) {
      return NextResponse.json({ error: 'Missing sessionId or honestNote.' }, { status: 400 });
    }

    if (honestNote.length < 20) {
      return NextResponse.json({ error: 'Honest note must be at least 20 characters.' }, { status: 400 });
    }

    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    if (session.status === 'completed') {
       return NextResponse.json({ error: 'Session already completed.' }, { status: 400 });
    }

    // Tally results
    session.itemsDone = session.results.filter(r => r.result === 'done').length;
    session.itemsStruggled = session.results.filter(r => r.result === 'struggled').length;
    session.itemsSkipped = session.results.filter(r => r.result === 'skipped').length;

    // Calculate score
    session.score = calcScore(session.results);

    // Calculate Tomorrow Focus
    // We need last 10 sessions and all items (for gap/overdue counting)
    const [lastSessions, allItems] = await Promise.all([
        SessionModel.find().sort({ date: -1 }).limit(10),
        SyllabusItemModel.find()
    ]);

    session.tomorrowFocus = calcTomorrowFocus(lastSessions, allItems);
    
    session.honestNote = honestNote;
    session.status = 'completed';
    session.completedAt = new Date();

    await session.save();

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Close session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
