import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SessionModel } from '@/app/lib/models/Session';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';
import { SettingsModel } from '@/app/lib/models/Settings';
import { updateSM2, SM2Fields } from '@/app/lib/engine/sm2';
import { escalateGap } from '@/app/lib/engine/gapEngine';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const { result, sessionDate } = await request.json();

  if (!['done', 'struggled', 'skipped'].includes(result)) {
    return NextResponse.json({ error: 'Invalid result type.' }, { status: 400 });
  }

  try {
    const session = await SessionModel.findOne({ date: sessionDate });
    if (!session) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    // 1. Update Session Trace
    if (session.status === 'planned') {
      session.status = 'in_progress';
      session.startedAt = new Date();
    }

    const sessionResult = {
      itemId: id as any,
      syllabusSlug: '', // Will populate from item
      result,
      timestamp: new Date()
    };

    // 2. Update Source Item
    const item = await SyllabusItemModel.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    sessionResult.syllabusSlug = item.syllabusSlug;
    session.results.push(sessionResult);

    item.lastTouchedAt = new Date();
    
    if (result === 'done') {
      item.completedCount += 1;
      item.status = 'done';
    } else if (result === 'skipped') {
      item.skippedCount += 1;
      item.status = 'skipped';
    } else if (result === 'struggled') {
      item.status = 'in_progress';
    }

    // SM2 and Gap Engine
    const settings = await SettingsModel.getSingleton();
    
    if (result === 'done' || result === 'struggled') {
      const prevStruggled = item.sm2?.timesStruggled || 0;
      const currentSM2: SM2Fields = item.sm2 ? {
        easeFactor: item.sm2.easeFactor,
        interval: item.sm2.interval,
        repetition: item.sm2.repetition,
        nextReviewDate: item.sm2.nextReviewDate,
        timesStruggled: item.sm2.timesStruggled
      } : {
        easeFactor: 2.5,
        interval: 0,
        repetition: 0,
        nextReviewDate: new Date(),
        timesStruggled: prevStruggled
      };
      
      const nextSM2 = updateSM2(currentSM2, result);
      item.sm2 = nextSM2;
    }

    const gapUpdates = escalateGap(item, result, settings);
    if (gapUpdates.gap) {
        item.gap = gapUpdates.gap;
    }

    await Promise.all([session.save(), item.save()]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update session item error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
