import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { DayRecord } from '@/lib/models/DayRecord'
import { getDayN, buildDayPayload } from '@/lib/dayEngine'
import { getCarriedTasksForDay } from '@/lib/carryEngine'

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

        return NextResponse.json(payload)
    } catch (error) {
        console.error('API /day GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch day payload' }, { status: 500 })
    }
}
