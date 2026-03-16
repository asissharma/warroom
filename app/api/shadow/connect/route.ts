import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { IntelNode } from '@/lib/models/IntelNode'
import { ShadowInsight } from '@/lib/models/ShadowInsight'
import { mapTopicConnections } from '@/lib/shadowEngine'
import { SpineEntryModel } from '@/lib/models/SpineEntry'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { topicKey } = await request.json()
        const userId = 'default'

        if (!topicKey) {
            return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
        }

        const allIntelForTopic = await IntelNode.find({ userId, tags: topicKey }).lean()
        if (allIntelForTopic.length < 2) {
            return NextResponse.json({ skipped: true, reason: 'Not enough intel to map connections' })
        }

        // Get all possible topic keys from DB to feed the AI context
        const allSpines = await SpineEntryModel.find({}).select('topicKeys').lean() as any[]
        const allTopicKeys = Array.from(new Set(
            allSpines.flatMap(s => s.topicKeys || [])
        ))

        // Ask OpenRouter (Claude-3 Haiku)
        const result = await mapTopicConnections(topicKey, topicKey, allIntelForTopic, allTopicKeys)

        if (result && result.connections) {
            // Update the ShadowInsight with these connections
            const insight = await ShadowInsight.findOneAndUpdate(
                { userId, topicKey },
                { $set: { relatedTopics: result.connections.map((c: any) => c.topicKey) } },
                { upsert: true, new: true }
            )
            return NextResponse.json(insight)
        }

        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
