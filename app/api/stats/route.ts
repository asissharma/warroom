import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { DayRecord } from '@/lib/models/DayRecord'
import { CarryForward } from '@/lib/models/CarryForward'
import { getPhaseProgress, getDayN } from '@/lib/dayEngine'

export async function GET() {
    try {
        await connectDB()
        const user = await User.findOne({ userId: 'default' }) as any || { streak: 0, longestStreak: 0, totalTasksDone: 0, startDate: new Date() }

        // Get current dayN based on start date
        const startDate = user.startDate || new Date()
        const currentDayN = getDayN(startDate)

        // Get all day records sorted
        const days = await DayRecord.find({ userId: 'default' }).sort({ dayN: -1 }).lean()
        const completedDays = days.filter(d => d.isComplete)

        // Week summary: last 7 days of data
        const weekSummary = days.slice(0, 7).map(d => ({
            dayN: d.dayN,
            isComplete: d.isComplete,
            taskCount: d.completedTaskIds?.length || 0,
            date: d.date
        }))

        // Carry-forward items (unresolved)
        const carryItems = await CarryForward.find({
            userId: 'default',
            toDayN: { $gte: currentDayN - 3 }, // Include recent and upcoming
            resolved: false
        }).sort({ toDayN: 1 }).lean()

        // Sort carry-items by urgency: (timesCarried * 2) + (daysSinceOriginal * 0.5)
        const carryItemsSorted = carryItems.map(cf => {
            const daysSinceOriginal = currentDayN - cf.fromDayN
            const urgency = (cf.timesCarried || 1) * 2 + daysSinceOriginal * 0.5
            return { ...cf, urgency }
        }).sort((a, b) => b.urgency - a.urgency)

        // Phase progress
        const phaseProgress = getPhaseProgress(currentDayN)

        // Calculate dayN from days array (use max completed day or current calculated day)
        const maxCompletedDay = completedDays.length > 0 ? Math.max(...completedDays.map(d => d.dayN)) : 0

        const stats = {
            dayN: Math.max(maxCompletedDay + (completedDays.length < maxCompletedDay ? 0 : 0), 1),
            currentStreak: user.streak || 0,
            longestStreak: user.longestStreak || 0,
            totalTasksDone: user.totalTasksDone || 0,
            daysCompleted: completedDays.length,
            startDate: startDate,
            weekSummary,
            carryItems: carryItemsSorted,
            carryForwardCount: carryItemsSorted.length,
            phaseProgress,
            totalDays: 180
        }

        return NextResponse.json(stats)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
