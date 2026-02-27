import { CarryForward } from './models/CarryForward'
import type { CarryForwardTask, DayPayload } from './types'

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

export async function createCarryForwardsFromDay(
    userId: string,
    dayN: number,
    payload: DayPayload,
    completedTaskIds: string[]
): Promise<void> {
    const expectedTasks: { id: string, text: string, type: 'tech' | 'build' | 'mastery' | 'human' }[] = []

    // Tech Tasks
    expectedTasks.push({ id: `tech_micro_0_D${dayN}`, text: `Read: ${payload.topicToday}`, type: 'tech' })
    expectedTasks.push({ id: `tech_micro_1_D${dayN}`, text: `Code: ${payload.microtaskToday}`, type: 'tech' })
    expectedTasks.push({ id: `tech_micro_2_D${dayN}`, text: `Document learnings`, type: 'tech' })
    if (payload.isReviewDay) {
        expectedTasks.push({ id: `tech_review_D${dayN}`, text: `Weekly Architecture Review`, type: 'tech' })
    }

    // Build Tasks
    if (payload.project) {
        expectedTasks.push({ id: `build_main_D${dayN}`, text: `Work on ${payload.project.name}`, type: 'build' })
        expectedTasks.push({ id: `build_commit_D${dayN}`, text: `Commit progress to source logic`, type: 'build' })
        expectedTasks.push({ id: `build_reflect_D${dayN}`, text: `Evaluate build velocity`, type: 'build' })
    }

    // Mastery Tasks
    payload.questions.forEach(q => {
        expectedTasks.push({ id: `mastery_Q${q.id}_D${dayN}`, text: `${q.question}`, type: 'mastery' })
    })

    // Human / Skills Tasks
    expectedTasks.push({ id: `human_skill_D${dayN}`, text: `Practice ${payload.basicSkill.name}`, type: 'human' })
    expectedTasks.push({ id: `human_payable_D${dayN}`, text: `Read ${payload.payable.books[0]?.title || 'Syllabus chapter'}`, type: 'human' })

    for (const task of expectedTasks) {
        if (!completedTaskIds.includes(task.id)) {
            await CarryForward.findOneAndUpdate(
                { userId, taskId: task.id, resolved: false },
                {
                    $set: {
                        toDayN: Math.min(180, dayN + 1),
                        taskText: task.text,
                        taskType: task.type,
                        fromDayN: dayN
                    }
                },
                { upsert: true }
            )
        }
    }

    // Mark completed carries from today as resolved
    for (const carried of payload.carriedTasks) {
        if (completedTaskIds.includes(carried.taskId)) {
            await resolveCarryForward(userId, carried._id)
        }
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
