import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { DayRecord } from '@/lib/models/DayRecord'
import { User } from '@/lib/models/User'
import { resolveCarryForward } from '@/lib/carryEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const { userId = 'default', dayN, taskId, completed, carryId } = await request.json()

        if (!dayN || !taskId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Upsert DayRecord
        const updateQuery = completed
            ? { $addToSet: { completedTaskIds: taskId } }
            : { $pull: { completedTaskIds: taskId } }

        const dayRecord = await DayRecord.findOneAndUpdate(
            { userId, dayN },
            updateQuery,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean() as any

        // 2. Resolve carry forward if applicable
        if (completed && carryId) {
            await resolveCarryForward(userId, carryId)
        }

        // 3. Increment/Decrement aggregate user task count
        const incValue = completed ? 1 : -1
        await User.findOneAndUpdate(
            { userId },
            { $inc: { totalTasksDone: incValue } }
        )

        return NextResponse.json({
            completedTaskIds: dayRecord.completedTaskIds,
            totalTasksDone: incValue // Simplified for front-end reaction, not total absolute count
        })
    } catch (error) {
        console.error('API /task POST error:', error)
        return NextResponse.json({ error: 'Failed to update task state' }, { status: 500 })
    }
}
