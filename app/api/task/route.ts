import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { DayRecord } from '@/lib/models/DayRecord'
import { User } from '@/lib/models/User'
import { resolveCarryForward } from '@/lib/carryEngine'

export async function POST(request: Request) {
    try {
        await connectDB()
        const body = await request.json()
        const { userId = 'default', dayN, taskId, completed, carryId } = body

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

        // 4. Emit to IntelOS Level (Fire-and-continue for task completion)
        if (completed) {
            const now = new Date()
            // Lightly reconstruct the day payload to get task details
            const userDoc = await User.findOne({ userId }).lean() as any
            const completedDaysCount = await DayRecord.countDocuments({ userId, isComplete: true })

            import('@/lib/carryEngine').then(ce => {
                ce.getCarriedTasksForDay(userId, dayN).then(carriedTasks => {
                    import('@/lib/dayEngine').then(de => {
                        const payload = de.buildDayPayload(
                            dayN,
                            completedDaysCount,
                            userDoc?.preferences?.questionsPerDay ?? 8,
                            carriedTasks,
                            dayRecord.completedTaskIds,
                            dayRecord.isComplete
                        )

                        const specs = de.getExpectedTaskSpecs(dayN, payload)
                        const spec = specs.find(s => s.id === taskId)

                        let domain = 'general'
                        let cType = 'task' as any

                        if (spec) {
                            domain = spec.type === 'tech' ? 'engineering' :
                                spec.type === 'build' ? 'projects' :
                                    spec.type === 'mastery' ? 'mastery' :
                                        spec.type === 'survival' ? 'survival' : 'human'
                        }

                        import('@/lib/intelEmitter').then(emitter => {
                            emitter.emitToIntel({
                                userId,
                                type: 'task',
                                source: 'cockpit',
                                title: spec?.text || `Completed Task ${taskId}`,
                                domain,
                                phase: payload.phase === 'Foundation' ? 1 :
                                    payload.phase === 'Distributed' ? 2 :
                                        payload.phase === 'Cloud' ? 3 :
                                            payload.phase === 'Security' ? 4 :
                                                payload.phase === 'ML/AI' ? 5 :
                                                    payload.phase === 'Frontend' ? 6 :
                                                        payload.phase === 'Mastery' ? 7 : 8,
                                dayN,
                                status: 'completed',
                                sourceRefId: taskId
                            }).catch(err => console.error('Silent Intel emit task error:', err))
                        })
                    })
                })
            })
        }

        return NextResponse.json({
            completedTaskIds: dayRecord.completedTaskIds,
            totalTasksDone: incValue // Simplified for front-end reaction, not total absolute count
        })
    } catch (error) {
        console.error('API /task POST error:', error)
        return NextResponse.json({ error: 'Failed to update task state' }, { status: 500 })
    }
}
