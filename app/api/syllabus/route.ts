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

        const [activeSpine, activeProjects, openGapsRef] = await Promise.all([
            TechSpine.find({}).sort({ lastAddressed: -1 }).limit(3).exec(),
            Project.find({ status: 'active' }).limit(3).exec(),
            GapTracker.find({ status: 'open' }).sort({ severity: 1 }).limit(3).exec() // critical severity first
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                spine: spineCount,
                questions: questionCount,
                projects: projectCount,
                skills: skillCount,
                openGaps: gapCount
            },
            highlights: {
                spine: activeSpine,
                projects: activeProjects,
                gaps: openGapsRef
            }
        });
    } catch (error: any) {
        console.error('Failed to fetch syllabus stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
