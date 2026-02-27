import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { DayRecord } from '@/lib/models/DayRecord'
import { SkillProgress } from '@/lib/models/SkillProgress'
import { CarryForward } from '@/lib/models/CarryForward'
import { LogRecord } from '@/lib/models/LogRecord'

export async function GET(request: Request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || 'default'

        const results = await Promise.allSettled([
            User.findOne({ userId }).lean() as any,
            DayRecord.find({ userId }).sort({ dayN: 1 }).lean() as unknown as any,
            SkillProgress.find({ userId }).lean() as unknown as any,
            CarryForward.countDocuments({ userId, resolved: false }),
            LogRecord.find({ userId }).sort({ createdAt: -1 }).limit(5).lean() as unknown as any
        ])

        const user = results[0].status === 'fulfilled' ? results[0].value : null
        const dayRecords = results[1].status === 'fulfilled' ? results[1].value || [] : []
        const skills = results[2].status === 'fulfilled' ? results[2].value || [] : []
        const carryForwardCount = results[3].status === 'fulfilled' ? results[3].value || 0 : 0
        const recentLogs = results[4].status === 'fulfilled' ? results[4].value || [] : []

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // 1. Completion Heatmap
        const completionHeatmap = Array.from({ length: 180 }, (_, i) => {
            const dayN = i + 1
            const record = dayRecords.find((r: any) => r.dayN === dayN)
            return {
                date: record?.date ? new Date(record.date).toISOString().split('T')[0] : '',
                dayN,
                isComplete: record?.isComplete || false,
                taskCount: record?.completedTaskIds?.length || 0
            }
        })

        // 2. Phase Progress
        const PHASES = [
            { name: 'Foundation', dayStart: 1, dayEnd: 30 },
            { name: 'Distributed', dayStart: 31, dayEnd: 50 },
            { name: 'Cloud', dayStart: 51, dayEnd: 70 },
            { name: 'Security', dayStart: 71, dayEnd: 90 },
            { name: 'ML/AI', dayStart: 91, dayEnd: 110 },
            { name: 'Frontend', dayStart: 111, dayEnd: 130 },
            { name: 'Mastery', dayStart: 131, dayEnd: 140 },
            { name: 'Capstone', dayStart: 141, dayEnd: 180 },
        ]

        const phaseProgress = PHASES.map(phase => {
            const daysInPhase = dayRecords.filter((r: any) => r.dayN >= phase.dayStart && r.dayN <= phase.dayEnd && r.isComplete)
            return {
                phase: phase.name,
                dayStart: phase.dayStart,
                dayEnd: phase.dayEnd,
                daysCompleted: daysInPhase.length,
                totalDays: (phase.dayEnd - phase.dayStart) + 1
            }
        })

        // 3. Skill Bars Map
        const skillBars = skills.reduce((acc: any, skill: any) => {
            acc[skill.barKey] = { value: skill.value, level: skill.level }
            return acc
        }, {})

        // 4. Avg Tasks Per Day (last 7 complete days)
        const last7Complete = dayRecords.filter((r: any) => r.isComplete).slice(-7)
        let avgTasksPerDay = 0
        if (last7Complete.length > 0) {
            const totalTasksInLast7 = last7Complete.reduce((sum: number, r: any) => sum + (r.completedTaskIds?.length || 0), 0)
            avgTasksPerDay = Math.round((totalTasksInLast7 / last7Complete.length) * 10) / 10
        }

        // 5. Build Final Response
        return NextResponse.json({
            totalDaysCompleted: dayRecords.filter((r: any) => r.isComplete).length,
            currentStreak: user.streak,
            longestStreak: user.longestStreak,
            totalTasksDone: user.totalTasksDone,
            carryForwardCount,
            avgTasksPerDay,
            completionHeatmap,
            phaseProgress,
            skillBars,
            recentLogs: recentLogs.map((l: any) => ({
                text: l.text,
                type: l.type,
                dayN: l.dayN,
                createdAt: l.createdAt.toISOString()
            }))
        })

    } catch (error) {
        console.error('API /dashboard GET error:', error)
        return NextResponse.json({ error: 'Failed to build dashboard' }, { status: 500 })
    }
}
