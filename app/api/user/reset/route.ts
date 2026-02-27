import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { DayRecord } from '@/lib/models/DayRecord'
import { SkillProgress } from '@/lib/models/SkillProgress'
import { CarryForward } from '@/lib/models/CarryForward'
import { LogRecord } from '@/lib/models/LogRecord'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { userId = 'default', confirm } = await request.json()

        if (confirm !== 'RESET') {
            return NextResponse.json({ error: 'Invalid confirmation string' }, { status: 400 })
        }

        await Promise.all([
            DayRecord.deleteMany({ userId }),
            SkillProgress.deleteMany({ userId }),
            CarryForward.deleteMany({ userId }),
            LogRecord.deleteMany({ userId })
        ])

        await User.findOneAndUpdate(
            { userId },
            { $set: { streak: 0, longestStreak: 0, totalTasksDone: 0 } },
            { new: true }
        )

        return NextResponse.json({ reset: true })
    } catch (error) {
        console.error('API /user/reset POST error:', error) // Changed to POST instead of DELETE because Nextjs route handlers prefer payloads in POST/PATCH, native DELETE payloads are often blocked/stripped by proxies.
        return NextResponse.json({ error: 'Failed to reset user' }, { status: 500 })
    }
}
