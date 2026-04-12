import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { GapTracker } from '../../../lib/models';

export async function GET() {
    try {
        await connectDB();
        // Only return open gaps for the main feed
        const data = await GapTracker.find({ status: 'open' }).sort({ severity: 1, flagCount: -1 });
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
