import { CarryForward } from './models/CarryForward'
import type { CarryForwardTask, DayPayload } from '@/types'

export async function getCarriedTasksForDay(
    userId: string,
    dayN: number
): Promise<CarryForwardTask[]> {
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
        taskType: t.taskType as 'tech' | 'build' | 'mastery' | 'human'
    }))
}

import { getExpectedTaskSpecs } from './dayEngine'

export async function createCarryForwardsFromDay(
    userId: string,
    dayN: number,
    payload: DayPayload,
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

    const resolveOps = []
    for (const carried of payload.carriedTasks) {
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

export async function resolveCarryForward(
    userId: string,
    carryId: string
): Promise<void> {
    await CarryForward.findByIdAndUpdate(carryId, {
        resolved: true,
        resolvedAt: new Date()
    })
}
