import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ProjectStatus } from '@/models/ProjectStatus';

export async function GET() {
    try {
        await dbConnect();

        const projects = await ProjectStatus.find({}).sort({ projectId: 1 });

        return NextResponse.json({ success: true, count: projects.length, data: projects });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
