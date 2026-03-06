import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { DayRecord } from '@/lib/models/DayRecord'
import { IntelRecord } from '@/lib/models/IntelRecord'
import { generateWeeklyDigest } from '@/lib/shadowEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { weekN } = await request.json()
        const userId = 'default'

        // This is a simplified fetch - normally we'd filter to just the days in weekN
        // For prototype, just grabbing the last 7 days of records
        const dayRecords = await DayRecord.find({ userId }).sort({ dayN: -1 }).limit(7).lean()
        const intelRecords = await IntelRecord.find({ userId }).sort({ createdAt: -1 }).limit(20).lean()

        // Call Gemini
        const digest = await generateWeeklyDigest(weekN || 1, dayRecords, intelRecords)

        if (!digest) {
            return NextResponse.json({ error: 'Weekly digest generation failed' }, { status: 500 })
        }

        // Ideally we would save this to a WeeklyDigest model. 
        // For now, return it directly to the UI component requesting it.
        return NextResponse.json(digest)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
