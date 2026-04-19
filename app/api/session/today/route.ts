import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SettingsModel } from '@/app/lib/models/Settings';
import { SessionModel } from '@/app/lib/models/Session';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';
import { buildQueue, PriorityBuckets } from '@/app/lib/engine/priority';

export async function GET() {
  await connectDB();
  
  const settings = await SettingsModel.getSingleton();
  const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  // Check if session for today already exists
  let session = await SessionModel.findOne({ date: todayDate });
  
  if (session && session.status !== 'planned') {
    return NextResponse.json({ session });
  }

  // If session exists as planned, or doesn't exist, we might want to (re)build it.
  // The master plan says "If no session: run the priority query pipeline".
  // If it's already 'planned', returning it is safer unless we want to rebuild on every GET.
  // Rebuilding on GET is usually bad for performance. We'll return it if it exists.
  if (session) {
      return NextResponse.json({ session });
  }

  // --- Priority Query Pipeline ---
  const enabledSlugs = settings.syllabusConfig.filter(s => s.enabled).map(s => s.slug);
  const now = new Date();
  const todayStart = new Date(now.setHours(0,0,0,0));

  // Carry Forward Logic
  const yesterday = new Date(todayStart);
  yesterday.setDate(todayStart.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  
  const prevSession = await SessionModel.findOne({ date: { $lt: todayDate }, status: { $ne: 'completed' } }).sort({ date: -1 });
  let carryForwardIds: any[] = [];
  if (prevSession) {
    const workedItemIds = prevSession.results.map(r => r.itemId.toString());
    carryForwardIds = prevSession.plannedItems.filter(id => !workedItemIds.includes(id.toString()));
  }

  const buckets: PriorityBuckets = {
    carryForward: carryForwardIds.length 
        ? await SyllabusItemModel.find({ _id: { $in: carryForwardIds } }).limit(5)
        : [],
    overdueItems: await SyllabusItemModel
        .find({ syllabusSlug: { $in: enabledSlugs }, 'sm2.nextReviewDate': { $lte: todayStart } })
        .sort({ 'sm2.nextReviewDate': 1 })
        .limit(20),
    criticalGaps: await SyllabusItemModel
        .find({ syllabusSlug: { $in: enabledSlugs }, 'gap.severity': 'critical' })
        .limit(10),
    mediumGaps: await SyllabusItemModel
        .find({ syllabusSlug: { $in: enabledSlugs }, 'gap.severity': 'medium' })
        .limit(10),
    inProgress: await SyllabusItemModel
        .find({ syllabusSlug: { $in: enabledSlugs }, status: 'in_progress' })
        .limit(10),
    newItems: (await Promise.all(
      enabledSlugs.map(slug => 
        SyllabusItemModel.find({ syllabusSlug: slug, status: 'not_started' })
          .sort({ orderIndex: 1 })
          .limit(10)
      )
    )).flat()
  };

  const queueIds = buildQueue(buckets, settings, settings.defaultSessionMinutes);
  const populatedItems = await SyllabusItemModel.find({ _id: { $in: queueIds } });

  // Missed Day Alert
  const lastAnySession = await SessionModel.findOne({}, {}, { sort: { date: -1 } });
  let gapAlert = null;
  if (lastAnySession) {
    const lastDate = new Date(lastAnySession.date);
    const diffTime = Math.abs(todayStart.getTime() - lastDate.getTime());
    const gapDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (gapDays > 1) {
      gapAlert = { days: gapDays, severity: gapDays > 3 ? 'critical' : 'low' };
    }
  }

  const dayNumber = Math.floor((todayStart.getTime() - new Date(settings.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  session = await SessionModel.create({
    date: todayDate,
    plannedItems: queueIds as any[],
    populatedItems: populatedItems,
    status: 'planned',
    dayNumber: dayNumber > 0 ? dayNumber : 1,
    gapAlert,
    carryForward: carryForwardIds,
    plannedMinutes: settings.defaultSessionMinutes,
    results: []
  });

  return NextResponse.json({ session });
}

export async function PATCH(request: Request) {
    await connectDB();
    const { plannedMinutes } = await request.json();
    const todayDate = new Date().toISOString().slice(0, 10);
    
    let session = await SessionModel.findOne({ date: todayDate });
    if (!session || session.status !== 'planned') {
        return NextResponse.json({ error: 'Cannot re-plan an active or completed session.' }, { status: 400 });
    }

    const settings = await SettingsModel.getSingleton();
    const enabledSlugs = settings.syllabusConfig.filter(s => s.enabled).map(s => s.slug);
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    // Re-run the same bucket logic but with new plannedMinutes for the budget
    const carryForwardIds = session.carryForward || [];
    const buckets: PriorityBuckets = {
        carryForward: carryForwardIds.length 
            ? await SyllabusItemModel.find({ _id: { $in: carryForwardIds } }).limit(5)
            : [],
        overdueItems: await SyllabusItemModel
            .find({ syllabusSlug: { $in: enabledSlugs }, 'sm2.nextReviewDate': { $lte: todayStart } })
            .sort({ 'sm2.nextReviewDate': 1 })
            .limit(20),
        criticalGaps: await SyllabusItemModel
            .find({ syllabusSlug: { $in: enabledSlugs }, 'gap.severity': 'critical' })
            .limit(10),
        mediumGaps: await SyllabusItemModel
            .find({ syllabusSlug: { $in: enabledSlugs }, 'gap.severity': 'medium' })
            .limit(10),
        inProgress: await SyllabusItemModel
            .find({ syllabusSlug: { $in: enabledSlugs }, status: 'in_progress' })
            .limit(10),
        newItems: (await Promise.all(
          enabledSlugs.map(slug => 
            SyllabusItemModel.find({ syllabusSlug: slug, status: 'not_started' })
              .sort({ orderIndex: 1 })
              .limit(10)
          )
        )).flat()
    };

    const queueIds = buildQueue(buckets, settings, plannedMinutes as any);
    const populatedItems = await SyllabusItemModel.find({ _id: { $in: queueIds } });

    session.plannedItems = queueIds as any[];
    session.populatedItems = populatedItems;
    session.plannedMinutes = plannedMinutes;
    await session.save();

    return NextResponse.json({ session });
}
