import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { DayRecord } from '@/lib/models/DayRecord'
import { User } from '@/lib/models/User'
import { LogRecord } from '@/lib/models/LogRecord'
import { createCarryForwardsFromDay, getCarriedTasksForDay } from '@/lib/carryEngine'
import { buildDayPayload } from '@/lib/dayEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { userId = 'default', dayN } = await request.json()

        if (!dayN) return NextResponse.json({ error: 'Missing dayN' }, { status: 400 })

        // 1. Mark day complete
        const now = new Date()
        const currentDayBefore = await DayRecord.findOne({ userId, dayN }).lean() as any
        const wasAlreadyComplete = currentDayBefore?.isComplete ?? false

        const currentDay = await DayRecord.findOneAndUpdate(
            { userId, dayN },
            { $set: { isComplete: true, completedAt: now } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean() as any

        // 2. Compute streak
        const previousDay = await DayRecord.findOne({ userId, dayN: dayN - 1 }).lean() as any

        let user = await User.findOne({ userId })
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        let newStreak = user.streak
        if (!wasAlreadyComplete) {
            if (dayN === 1 || (previousDay && previousDay.isComplete)) {
                newStreak += 1
            } else {
                newStreak = 1 // reset if previous day wasn't complete
            }
        }

        // 3. Update longestStreak
        const longestStreak = Math.max(user.longestStreak, newStreak)
        user.streak = newStreak
        user.longestStreak = longestStreak
        await user.save()

        // 4. Fetch the payload identically to GET /api/day
        const completedDaysCount = await DayRecord.countDocuments({ userId, isComplete: true })
        const carriedTasks = await getCarriedTasksForDay(userId, dayN)
        const payload = buildDayPayload(
            dayN,
            completedDaysCount,
            user.preferences?.questionsPerDay ?? 8,
            carriedTasks,
            currentDay.completedTaskIds,
            currentDay.isComplete
        )

        // 5. Generate uncompleted carry forwards for tomorrow
        await createCarryForwardsFromDay(userId, dayN, payload, currentDay.completedTaskIds)

        // 6. Log completion
        await LogRecord.create({
            userId,
            dayN,
            text: `Day ${dayN} complete ✓`,
            type: 'win'
        })

        return NextResponse.json({ streak: newStreak, longestStreak, dayN })
    } catch (error) {
        console.error('API /day/complete POST error:', error)
        return NextResponse.json({ error: 'Failed to complete day' }, { status: 500 })
    }
}
