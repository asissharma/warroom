import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Project } from '../../../lib/models';

export async function GET() {
    try {
        await connectDB();
        const data = await Project.find({}).sort({ dayAssigned: 1 });
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
