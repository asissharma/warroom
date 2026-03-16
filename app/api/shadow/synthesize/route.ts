import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ShadowInsight } from '@/lib/models/ShadowInsight'
import { IntelNode } from '@/lib/models/IntelNode'
import { synthesizeIntel } from '@/lib/shadowEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { topicKey, intelRecord } = await request.json()
        const userId = 'default'

        if (!topicKey || !intelRecord) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        // Get last 3 records (excluding the current one)
        const last3IntelRecords = await IntelNode.find({ userId, tags: topicKey })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean()

        // 1. Ask Groq (Mixtral) to synthesize
        const analysis = await synthesizeIntel(topicKey, intelRecord, last3IntelRecords)

        if (!analysis) {
            return NextResponse.json({ error: 'AI Synthesis failed' }, { status: 500 })
        }

        // 2. Save result to ShadowInsight
        const insight = await ShadowInsight.findOneAndUpdate(
            { userId, topicKey },
            { $set: analysis },
            { upsert: true, new: true }
        )

        return NextResponse.json(insight)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
