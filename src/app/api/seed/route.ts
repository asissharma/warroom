import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import { ProjectStatus } from '@/models/ProjectStatus';

export async function POST() {
    try {
        await dbConnect();

        // We'll focus on seeding the Projects first as an example of dynamic execution ground
        const projectsPath = path.join(process.cwd(), 'files to be analysed', '_extracted', 'project_tracker.txt');

        if (!fs.existsSync(projectsPath)) {
            return NextResponse.json({ error: 'Project tracker file not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(projectsPath, 'utf8');

        // Using simple split since the provided extracted files are just text blocks
        // In a real scenario, this would parse the specific format of the extracted text
        // For now, let's create a few mock projects to verify the DB and UI connection

        const mockProjects = [
            { projectId: 'P001', title: 'Basic CLI Tool', category: 'CLI & Automation', status: 'To Do' },
            { projectId: 'P002', title: 'Simple TCP Server', category: 'Backend Basics', status: 'To Do' },
            { projectId: 'P003', title: 'Rate Limiter Middleware', category: 'Distributed Systems', status: 'To Do' },
            { projectId: 'P004', title: 'JWT Authentication API', category: 'Security', status: 'To Do' },
            { projectId: 'P005', title: 'Mini Load Balancer', category: 'Distributed Systems', status: 'To Do' }
        ];

        // Clear existing to prevent duplicates during testing
        await ProjectStatus.deleteMany({});

        // Insert new
        await ProjectStatus.insertMany(mockProjects);

        return NextResponse.json({ success: true, message: 'Database seeded successfully with mock projects' });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
