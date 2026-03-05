import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { DayRecord } from '@/lib/models/DayRecord'
import { getPhaseProgress } from '@/lib/dayEngine'

export async function GET() {
    try {
        await connectDB()
        const user = await User.findOne({ userId: 'default' }) || { streak: 0, longestStreak: 0, totalTasksDone: 0, startDate: new Date() }
        const days = await DayRecord.find({ userId: 'default' }).sort({ dayN: -1 })

        const completedDays = days.filter(d => d.isComplete)
        const currentDayN = days.length > 0 ? days[0].dayN : 1

        const stats = {
            currentStreak: user.streak,
            longestStreak: user.longestStreak,
            totalTasksDone: user.totalTasksDone,
            daysCompleted: completedDays.length,
            startDate: user.startDate,
            phaseProgress: getPhaseProgress(currentDayN)
        }

        return NextResponse.json(stats)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
