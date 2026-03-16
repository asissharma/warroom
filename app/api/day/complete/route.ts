import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { DayRecord } from '@/lib/models/DayRecord'
import { User } from '@/lib/models/User'
import { LogRecord } from '@/lib/models/LogRecord'
import { CarryForward } from '@/lib/models/CarryForward'
import { getExpectedTaskSpecs, buildDayPayload } from '@/lib/dayEngine'

// Helper to build payload inline (avoids circular deps)
function getPayloadForCarryCreation(dayN: number, userId: string, completedDaysCount: number, questionsPerDay: number, carriedTasks: any[], completedTaskIds: string[], isComplete: boolean) {
    return buildDayPayload(dayN, completedDaysCount, questionsPerDay as 8 | 9, carriedTasks, completedTaskIds, isComplete)
}

// Helper to create carry forwards inline (avoids circular deps)
async function createCarryForwardsInline(
    userId: string,
    dayN: number,
    payload: any,
    completedTaskIds: string[]
): Promise<void> {
    const expectedTasks = getExpectedTaskSpecs(dayN, payload)
    const bulkOps = []

    for (const task of expectedTasks) {
        if (!completedTaskIds.includes(task.id)) {
            bulkOps.push({
                updateOne: {
                    filter: { userId, taskId: task.id, resolved: false },
                    update: {
                        $set: {
                            toDayN: Math.min(180, dayN + 1),
                            taskText: task.text,
                            taskType: task.type,
                        },
                        $inc: { timesCarried: 1 },
                        $setOnInsert: {
                            fromDayN: dayN,
                            timesSkipped: 0
                        }
                    },
                    upsert: true
                }
            })
        }
    }

    if (bulkOps.length > 0) {
        await CarryForward.bulkWrite(bulkOps)
    }

    // Resolve completed carry forwards
    const resolveOps = []
    for (const carried of payload.carriedTasks || []) {
        if (completedTaskIds.includes(carried.taskId)) {
            resolveOps.push({
                updateOne: {
                    filter: { _id: carried._id },
                    update: {
                        $set: {
                            resolved: true,
                            resolvedAt: new Date()
                        }
                    }
                }
            })
        }
    }
    if (resolveOps.length > 0) {
        await CarryForward.bulkWrite(resolveOps)
    }
}

// Helper: get carried tasks inline
async function getCarriedTasksInline(userId: string, dayN: number): Promise<any[]> {
    await CarryForward.updateMany(
        { userId, resolved: false, toDayN: { $lt: dayN } },
        { $set: { toDayN: dayN } }
    )
    const traces = await CarryForward.find({ userId, toDayN: dayN, resolved: false }).lean()
    return traces.map((t: any) => ({
        _id: t._id.toString(),
        fromDayN: t.fromDayN,
        taskId: t.taskId,
        taskText: t.taskText,
        taskType: t.taskType
    }))
}

export async function POST(request: Request) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        await connectDB()
        const { userId = 'default', dayN, force = false } = await request.json()

        if (!dayN) {
            await session.abortTransaction()
            return NextResponse.json({ error: 'Missing dayN' }, { status: 400 })
        }

        // 1. Check current state within transaction
        const currentDayBefore = await DayRecord.findOne({ userId, dayN }).session(session).lean() as any
        const wasAlreadyComplete = currentDayBefore?.isComplete ?? false

        // 2. Mark day complete (atomic within transaction)
        const now = new Date()
        const currentDay = await DayRecord.findOneAndUpdate(
            { userId, dayN },
            { $set: { isComplete: true, completedAt: now } },
            { new: true, upsert: true, setDefaultsOnInsert: true, session }
        ).lean() as any

        // 3. Compute streak (with grace)
        const previousDay = await DayRecord.findOne({ userId, dayN: dayN - 1 }).session(session).lean() as any

        let user = await User.findOne({ userId }).session(session)
        if (!user) {
            await session.abortTransaction()
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let newStreak = user.streak
        if (!wasAlreadyComplete || force) {
            if (dayN === 1) {
                newStreak = 1
            } else if (previousDay && previousDay.isComplete) {
                newStreak += 1
            } else if (previousDay && !previousDay.isComplete) {
                newStreak = user.streak // maintain streak
            } else {
                newStreak = 1 // gap in days
            }
        }

        // 4. Update user streak (atomic)
        const longestStreak = Math.max(user.longestStreak, newStreak)
        await User.updateOne(
            { userId },
            { $set: { streak: newStreak, longestStreak } },
            { session }
        )

        // 5. Fetch payload and create carry forwards within transaction
        const completedDaysCount = await DayRecord.countDocuments({ userId, isComplete: true }).session(session)
        const carriedTasks = await getCarriedTasksInline(userId, dayN)
        const payload = getPayloadForCarryCreation(
            dayN, userId, completedDaysCount,
            user.preferences?.questionsPerDay ?? 8,
            carriedTasks, currentDay.completedTaskIds, currentDay.isComplete
        )

        // 6. Create carry forwards (atomic)
        await createCarryForwardsInline(userId, dayN, payload, currentDay.completedTaskIds)

        // 7. Log completion (atomic)
        await LogRecord.create([{
            userId,
            dayN,
            text: `Day ${dayN} complete ${force ? '(forced)' : ''} ✓`,
            type: 'win'
        }], { session })

        // Commit the transaction
        await session.commitTransaction()
        session.endSession()

        // 8. Async: Emit IntelNodes (fire-and-forget, outside transaction)
        if (currentDay.completedTaskIds && currentDay.completedTaskIds.length > 0) {
            import('@/lib/dayEngine').then(de => {
                const specs = de.getExpectedTaskSpecs(dayN, payload)
                import('@/lib/intelEmitter').then(emitter => {
                    for (const taskId of currentDay.completedTaskIds) {
                        const spec = specs.find((s: any) => s.id === taskId)
                        let domain = 'general'
                        if (spec) {
                            domain = spec.type === 'tech' ? 'engineering' :
                                spec.type === 'build' ? 'projects' :
                                    spec.type === 'mastery' ? 'mastery' :
                                        spec.type === 'survival' ? 'survival' : 'human'
                        }
                        const phaseNum = payload.phase === 'Foundation' ? 1 :
                            payload.phase === 'Distributed' ? 2 :
                                payload.phase === 'Cloud' ? 3 :
                                    payload.phase === 'Security' ? 4 :
                                        payload.phase === 'ML/AI' ? 5 :
                                            payload.phase === 'Frontend' ? 6 :
                                                payload.phase === 'Mastery' ? 7 : 8

                        emitter.emitToIntel({
                            userId,
                            type: 'task',
                            source: 'system',
                            title: spec?.text || `Completed Task ${taskId}`,
                            domain,
                            phase: phaseNum,
                            dayN,
                            status: 'completed',
                            sourceRefId: taskId
                        }).catch(err => console.error('Silent Intel emit error:', err))
                    }
                }).catch(err => console.error('Silent Intel emitter import error:', err))
            }).catch(err => console.error('Silent dayEngine import error:', err))
        }

        // 9. Trigger weekly digest if day is a multiple of 7 (fire-and-forget)
        if (dayN % 7 === 0) {
            const weekN = Math.floor(dayN / 7)
            fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/shadow/weekly`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weekN, store: true })
            }).catch(err => console.error('Failed to trigger weekly digest', err))
        }

        return NextResponse.json({ streak: newStreak, longestStreak, dayN, completed: true })
    } catch (error) {
        // Rollback on any error
        await session.abortTransaction()
        session.endSession()
        console.error('API /day/complete POST error:', error)
        return NextResponse.json({ error: 'Failed to complete day' }, { status: 500 })
    }
}
