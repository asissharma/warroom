import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { PageNote } from '@/lib/models/PageNote'

export async function GET(
    req: NextRequest,
    { params }: { params: { collection: string; id: string } }
) {
    try {
        await connectDB()
        const pageId = `${params.collection}:${params.id}`
        let note = await PageNote.findOne({ pageId, userId: 'default_user' }).lean() as any

        if (!note) {
            // Return empty blocks if no note exists yet
            return NextResponse.json({ blocks: [] })
        }

        return NextResponse.json({ blocks: note.blocks })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { collection: string; id: string } }
) {
    try {
        await connectDB()
        const body = await req.json()
        const blocks = body.blocks

        if (!Array.isArray(blocks)) {
            return NextResponse.json({ error: 'Invalid blocks format' }, { status: 400 })
        }

        const pageId = `${params.collection}:${params.id}`

        const note = await PageNote.findOneAndUpdate(
            { pageId, userId: 'default_user' },
            {
                $set: {
                    collectionKey: params.collection,
                    rowId: params.id,
                    blocks
                }
            },
            { new: true, upsert: true }
        )

        return NextResponse.json({ success: true, blocks: note.blocks })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
