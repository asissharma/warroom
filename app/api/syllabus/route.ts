import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/db';
import { TechSpine, Question, Project, Skill, GapTracker } from '../../lib/models';

export async function GET() {
    try {
        await connectDB();

        const [spineCount, questionCount, projectCount, skillCount, gapCount] = await Promise.all([
            TechSpine.countDocuments(),
            Question.countDocuments(),
            Project.countDocuments(),
            Skill.countDocuments(),
            GapTracker.countDocuments({ status: 'open' })
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                spine: spineCount,
                questions: questionCount,
                projects: projectCount,
                skills: skillCount,
                openGaps: gapCount
            }
        });
    } catch (error: any) {
        console.error('Failed to fetch syllabus stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
