import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import SurvivalArea from '@/app/lib/models/SurvivalArea';

export async function GET() {
    try {
        await connectDB();
        const data = await SurvivalArea.find({}).sort({ areaId: 1 });
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
