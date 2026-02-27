import projects from '@/data/projects.json'
import spineData from '@/data/tech-spine.json'
import skillsData from '@/data/skills.json'
import questionsData from '@/data/questions.json'
import type { Project, SpineArea, Question, BasicSkill, PayableSyllabus, DayPayload, CarryForwardTask } from './types'

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

export function getDayN(startDate: Date): number {
    const now = new Date()
    const diffTime = now.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, Math.min(diffDays, 180))
}

export function getPhaseForDay(dayN: number): string {
    const phase = PHASES.find(p => dayN >= p.dayStart && dayN <= p.dayEnd)
    return phase ? phase.name : 'Unknown'
}

export function getSpineForDay(dayN: number): SpineArea {
    const spines = spineData as any[]
    let rawSpine = spines.find(s => dayN >= ((s.weekStart - 1) * 7 + 1) && dayN <= (s.weekEnd * 7))
    if (!rawSpine) rawSpine = spines[spines.length - 1]

    return {
        id: rawSpine.id,
        area: rawSpine.area === 'nan' ? 'General Topic' : rawSpine.area,
        phase: rawSpine.phase,
        dayStart: (rawSpine.weekStart - 1) * 7 + 1,
        dayEnd: rawSpine.weekEnd * 7,
        questionTheme: rawSpine.area === 'nan' ? 'General' : rawSpine.area,
        topics: rawSpine.topics || [],
        microtasks: rawSpine.microtasks || [],
        resource: rawSpine.resource
    }
}

export function getProjectForDay(dayN: number): Project | null {
    const allProjects = projects as Project[]
    if (dayN >= 1 && dayN <= 150) {
        return allProjects[dayN - 1]
    }
    return null
}

export function getQuestionsForDay(
    dayN: number,
    questionsPerDay: 8 | 9,
    completedDaysCount: number
): Question[] {
    const spine = getSpineForDay(dayN)
    const allQuestions = questionsData as Question[]

    // Try finding questions that match the theme exactly
    let pool = allQuestions.filter(q => q.theme === spine.questionTheme).sort((a, b) => a.id - b.id)

    // Fallback: If no questions match the specific theme (or "General"), use all questions as the pool
    if (pool.length === 0) {
        pool = allQuestions.sort((a, b) => a.id - b.id)
    }

    const offset = (completedDaysCount * questionsPerDay) % pool.length
    const slice = pool.slice(offset, offset + questionsPerDay)

    if (slice.length < questionsPerDay) {
        const remaining = questionsPerDay - slice.length
        return [...slice, ...pool.slice(0, remaining)]
    }
    return slice
}

export function getBasicSkillForDay(dayN: number): BasicSkill {
    const basics = skillsData.basic as string[]
    const skillName = basics[(dayN - 1) % basics.length]
    return {
        id: dayN,
        name: skillName.replace(/\n\s*/g, ' '),
        category: 'General',
        microPractice: `Focus on ${skillName.replace(/\n\s*/g, ' ')} today.`
    }
}

export function getPayableForDay(dayN: number): PayableSyllabus {
    const payables = skillsData.payable as any[]
    const p = payables.find(p => dayN >= p.dayStart && dayN <= p.dayEnd) || payables[payables.length - 1]
    return {
        id: p.dayStart,
        name: p.name,
        dayStart: p.dayStart,
        dayEnd: p.dayEnd,
        description: `Study ${p.name}`,
        books: p.coreBooks ? p.coreBooks.map((t: string) => ({ title: t, author: 'Unknown', downloaded: true, coreChapter: 'Chapter 1' })) : [],
        podcasts: [],
        weeklyExercise: 'Reflect on readings',
        capstone: 'Write summary'
    }
}

export function isReviewDay(dayN: number): boolean {
    return dayN % 7 === 0
}

export function isCheckpointDay(dayN: number): boolean {
    return [30, 60, 90, 120, 150, 180].includes(dayN)
}

export function getTopicForDay(spine: SpineArea, dayN: number): string {
    if (!spine.topics || spine.topics.length === 0) return "General Review"
    const dayWithinArea = Math.max(0, dayN - spine.dayStart)
    const topicIndex = dayWithinArea % spine.topics.length
    return spine.topics[topicIndex]
}

export function getMicrotasksForDay(spine: SpineArea, dayN: number): string[] {
    if (!spine.microtasks || spine.microtasks.length === 0) return ["Process Review"]

    // Try to get 3 microtasks for variety, looping through the available ones
    const dayWithinArea = Math.max(0, dayN - spine.dayStart)
    const startIndex = (dayWithinArea * 3) % spine.microtasks.length
    const result = []

    for (let i = 0; i < 3; i++) {
        result.push(spine.microtasks[(startIndex + i) % spine.microtasks.length])
    }
    return result
}

export function buildDayPayload(
    dayN: number,
    completedDaysCount: number,
    questionsPerDay: 8 | 9,
    carriedTasks: CarryForwardTask[],
    completedTaskIds: string[],
    dayComplete: boolean
): DayPayload {
    const phase = getPhaseForDay(dayN)
    const spine = getSpineForDay(dayN)

    return {
        dayN,
        phase,
        isReviewDay: isReviewDay(dayN),
        isCheckpointDay: isCheckpointDay(dayN),
        project: getProjectForDay(dayN),
        spineArea: spine,
        topicToday: getTopicForDay(spine, dayN),
        microtasksToday: getMicrotasksForDay(spine, dayN),
        questions: getQuestionsForDay(dayN, questionsPerDay, completedDaysCount),
        basicSkill: getBasicSkillForDay(dayN),
        payable: getPayableForDay(dayN),
        carriedTasks,
        completedTaskIds,
        dayComplete
    }
}
