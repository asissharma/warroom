import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ShadowInsight } from '@/lib/models/ShadowInsight'
import { IntelRecord } from '@/lib/models/IntelRecord'
import { enrichTask } from '@/lib/shadowEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { microtaskToday, topicToday } = await request.json()
        const userId = 'default'

        if (!topicToday) {
            return NextResponse.json({ enrichedTask: microtaskToday })
        }

        // Gather context
        const lastIntel = await IntelRecord.findOne({ userId, topicKey: topicToday }).sort({ createdAt: -1 }).lean() as any
        const shadow = await ShadowInsight.findOne({ userId, topicKey: topicToday }).lean() as any

        let blockers = ''
        if (lastIntel && lastIntel.blockers) blockers += `Recent blocker: ${lastIntel.blockers}. `
        if (shadow && shadow.weakSpots && shadow.weakSpots.length > 0) blockers += `Weak spots: ${shadow.weakSpots.join(', ')}`

        // Call Groq Llama3 
        const enriched = await enrichTask(microtaskToday, topicToday, lastIntel, blockers)

        return NextResponse.json({ enrichedTask: enriched })
    } catch (e: any) {
        return NextResponse.json({ enrichedTask: 'Error enriching task' })
    }
}
