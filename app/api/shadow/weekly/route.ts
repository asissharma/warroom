import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { DayRecord } from '@/lib/models/DayRecord'
import { IntelNode } from '@/lib/models/IntelNode'
import { WeeklyDigest } from '@/lib/models/WeeklyDigest'
import { generateWeeklyDigest } from '@/lib/shadowEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { weekN, store = false } = await request.json()
        const userId = 'default'

        // This is a simplified fetch - normally we'd filter to just the days in weekN
        // For prototype, just grabbing the last 7 days of records
        const dayRecords = await DayRecord.find({ userId }).sort({ dayN: -1 }).limit(7).lean()
        const intelRecords = await IntelNode.find({ userId }).sort({ createdAt: -1 }).limit(20).lean()

        // Call Gemini
        const digest = await generateWeeklyDigest(weekN || 1, dayRecords, intelRecords)

        if (!digest) {
            return NextResponse.json({ error: 'Weekly digest generation failed' }, { status: 500 })
        }

        // Store in DB if requested
        if (store) {
            await WeeklyDigest.findOneAndUpdate(
                { weekNumber: weekN },
                {
                    weekNumber: weekN,
                    dayN: weekN * 7,
                    generatedAt: new Date(),
                    mastered: digest.mastered || [],
                    fragile: digest.fragile || [],
                    skipRisk: digest.skipRisk || [],
                    nextWeekFocus: digest.nextWeekFocus || '',
                    honestAssessment: digest.honestAssessment || '',
                    rawText: JSON.stringify(digest)
                },
                { upsert: true, new: true }
            )
        }

        return NextResponse.json(digest)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
