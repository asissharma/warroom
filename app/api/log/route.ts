import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { LogRecord } from '@/lib/models/LogRecord';
import { emitToIntel } from '@/lib/intelEmitter';
import { DayRecord } from '@/lib/models/DayRecord';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 50;
        const userId = 'default';

        const logs = await LogRecord.find({ userId }).sort({ createdAt: -1 }).limit(limit);
        return NextResponse.json(logs);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const { text, type } = await request.json();
        const userId = 'default';
        
        // Find current day
        const latestDay = await DayRecord.findOne({ userId }).sort({ dayN: -1 }).lean() as any;
        const dayN = latestDay ? latestDay.dayN : 1;

        const record = await LogRecord.create({
            userId,
            dayN,
            text,
            type
        });

        // Fire and continue Intel emission
        emitToIntel({
            userId,
            type: 'log',
            source: 'log',
            title: `Journal Log — Day ${dayN}`,
            body: text,
            dayN,
            domain: 'personal',
            status: 'completed',
            sourceRefId: record._id.toString()
        }).catch(err => console.error('Silent Intel emit error for log:', err));

        return NextResponse.json(record);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
