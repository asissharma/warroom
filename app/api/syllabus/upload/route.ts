import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';
import { SyllabusModel } from '@/app/lib/models/Syllabus';

export async function POST(request: Request) {
    await connectDB();
    
    try {
        const body = await request.json();
        const { syllabusSlug, items } = body;

        if (!syllabusSlug || !items || !Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Missing syllabusSlug or items array.' }, 
                { status: 400 }
            );
        }

        // Validate that the slug actually exists in DB
        const syllabusExists = await SyllabusModel.findOne({ slug: syllabusSlug });
        if (!syllabusExists) {
             return NextResponse.json(
                { error: `Syllabus registry with slug '${syllabusSlug}' does not exist.` }, 
                { status: 404 }
            );
        }

        // Map through raw items and conform them to the unified SyllabusItem schema
        const processedItems = items.map((raw: any, idx: number) => {
            // Attempt to extract title and description across our legacy formats
            const title = raw.title || raw.name || raw.text || raw.concept || `Uploaded Item ${idx + 1}`;
            const description = raw.description || raw.notes || raw.prompt || raw.microtask || '';

            // Cleanly bundle the rest of the unknown fields into the `meta` object
            const { title: _t, name: _n, text: _tx, concept: _c, description: _d, notes: _no, prompt: _pr, microtask: _m, ...metaContext } = raw;

            // Optional difficulty mapping
            const difficulty = parseInt(raw.difficulty) || parseInt(raw.depthReached) || 1;

            return {
                syllabusSlug,
                source: syllabusSlug, 
                title,
                description,
                status: 'not_started',
                orderIndex: parseInt(raw.orderIndex) || idx,
                difficulty,
                meta: metaContext, 
                // Default SM-2 initialization handled by Mongoose schema defaults, 
                // but let's explicitly flag interval to 0
                sm2: {
                    interval: 0,
                    repetition: 0,
                    efactor: 2.5,
                    nextReviewDate: new Date()
                }
            };
        });

        // Insert heavily validated chunks
        const result = await SyllabusItemModel.insertMany(processedItems);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully uploaded ${result.length} items to ${syllabusSlug}.`,
            insertedCount: result.length
        });
        
    } catch (error: any) {
        console.error('SYLLABUS_UPLOAD_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
