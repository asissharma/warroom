import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Question } from '../../../lib/models';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 50;
        const skip = (page - 1) * limit;

        // Prioritize: High difficulty, High struggle counts, and Recent/Overdue status
        const data = await Question.find({})
            .sort({ difficulty: -1, timesStruggled: -1, nextReviewDate: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Question.countDocuments();

        return NextResponse.json({ 
            success: true, 
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
