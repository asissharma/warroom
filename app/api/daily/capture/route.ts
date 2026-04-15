import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Capture from '@/app/lib/models/Capture';
import { generateAiTags } from '@/app/lib/ai/tagger';

export async function POST(request: Request) {
    await connectDB();
    
    try {
        const { type, note, topicId, sessionDay, blockType, refId, refName } = await request.json();

        if (!note || note.trim().length === 0) {
            return NextResponse.json({ error: 'Note content required' }, { status: 400 });
        }

        // 1. Manually Extract Hashtags
        const manualTags = note.match(/#\w+/g)?.map((t: string) => t.substring(1).toLowerCase()) || [];
        
        // 2. Clear hashtags from the clean note if desired, 
        // but often better to keep them in context.
        const cleanNote = note.replace(/#\w+/g, '').trim();

        // 3. Generate AI Tags
        const aiTags = await generateAiTags(cleanNote);

        // 4. Combine all tags
        // unique set of manual + AI tags + session day tag + blockType tag
        const combinedTags = Array.from(new Set([
            ...manualTags,
            ...aiTags,
            `day-${sessionDay}`,
            ...(blockType ? [blockType] : []),
        ]));

        const newCapture = await Capture.create({
            type: type || 'note',
            note: cleanNote,
            tags: combinedTags,
            blockType: blockType || null,
            refId: refId || null,
            refName: refName || null,
            topicId: topicId || refId || null,  // backward compat
            sessionDay: sessionDay
        });

        return NextResponse.json({ 
            success: true, 
            capture: newCapture,
            manualTags: manualTags,
            aiTags: aiTags,
            aiSummary: `Node Compiled. Tags: ${[...manualTags, ...aiTags].join(', ')}` 
        });

    } catch (error: any) {
        console.error('CAPTURE_API_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
