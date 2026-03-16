import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { DayRecord } from '@/lib/models/DayRecord'
import { IntelNode } from '@/lib/models/IntelNode'
import { getDayN, buildDayPayload } from '@/lib/dayEngine'
import { getCarriedTasksForDay } from '@/lib/carryEngine'
import { enrichTask } from '@/lib/shadowEngine'

// Helper: enrich top PROJECT tasks for the day
async function enrichTasksWithContext(userId: string, dayN: number, payload: any, completedTaskIds: string[]) {
    const projectTasks = (payload.tasks || []).filter((t: any) => t.type === 'build').slice(0, 2)
    if (projectTasks.length === 0) return []

    const enriched: { taskId: string; enrichedText: string }[] = []

    for (const task of projectTasks) {
        if (completedTaskIds.includes(task.id)) continue

        // Get last intel for this topic
        const lastIntel = await IntelNode.findOne({ userId, tags: payload.topicKeyToday })
            .sort({ createdAt: -1 })
            .lean()

        const enrichedText = await enrichTask(
            task.text,
            payload.topicKeyToday,
            lastIntel,
            ''
        )

        enriched.push({ taskId: task.id, enrichedText })
    }

    // Cache in DayRecord
    if (enriched.length > 0) {
        await DayRecord.updateOne(
            { userId, dayN },
            { $set: { enrichedTasks: enriched } }
        )
    }

    return enriched
}

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || 'default'

        // 1. Get user
        let user = await User.findOne({ userId }).lean() as any
        if (!user) {
            user = await User.create({ userId, startDate: new Date() })
        }

        // 2. Determine dayN
        const queryDay = searchParams.get('dayN')
        const dayN = queryDay ? parseInt(queryDay, 10) : getDayN(user.startDate)

        // 3. Get completed days
        const completedDaysCount = await DayRecord.countDocuments({ userId, isComplete: true })

        // 4. Get carried tasks
        const carriedTasks = await getCarriedTasksForDay(userId, dayN)

        // 5. Get current day record
        const dayRecord = await DayRecord.findOne({ userId, dayN }).lean() as any

        // 6 & 7. Determine status
        const completedTaskIds = dayRecord?.completedTaskIds ?? []
        const dayComplete = dayRecord?.isComplete ?? false

        // 8. Build payload combining static JSON and dynamic state
        const payload = buildDayPayload(
            dayN,
            completedDaysCount,
            user.preferences?.questionsPerDay ?? 8,
            carriedTasks,
            completedTaskIds,
            dayComplete
        )

        // 9. Check for enriched tasks or generate them
        let enrichedTasks = dayRecord?.enrichedTasks || []
        if (enrichedTasks.length === 0 && !dayComplete) {
            // Fire-and-forget enrich for next request
            enrichTasksWithContext(userId, dayN, payload, completedTaskIds).catch(console.error)
        }

        // Attach enriched tasks to payload
        const payloadWithEnriched = {
            ...payload,
            enrichedTasks
        }

        return NextResponse.json(payloadWithEnriched)
    } catch (error) {
        console.error('API /day GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch day payload' }, { status: 500 })
    }
}
