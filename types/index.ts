import type { Types } from 'mongoose'

// Core data types (matching your JSON files exactly)
export interface Project {
    day: number
    phase: string
    category: string
    name: string
    doneMeans: string
}

export interface SpineArea {
    id: number
    area: string
    phase: string
    dayStart: number
    dayEnd: number
    questionTheme: string
    topics: string[]
    topicKeys?: string[]
    microtasks: string[]
    resource: string
    resourceUrl?: string
}

export interface Question {
    id: number
    question: string
    theme: string
    difficulty: 1 | 2 | 3
}

export interface BasicSkill {
    id: number
    name: string
    category: string
    microPractice: string
}

export interface PayableBook {
    title: string
    author: string
    downloaded: boolean
    coreChapter: string
}

export interface PayableSyllabus {
    id: number
    name: string
    dayStart: number
    dayEnd: number
    description: string
    books: PayableBook[]
    podcasts: string[]
    weeklyExercise: string
    capstone: string
    chapterMap?: Record<string, string>
}

export interface SurvivalTopic {
    id: string
    title: string
    drill: string
    connectedTopicKeys: string[]
}

export interface SurvivalArea {
    id: number
    area: string
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    why: string
    topics: SurvivalTopic[]
    resources?: { name: string; author: string; free: boolean; url: string | null }[]
    spineConnection?: string
}

export interface Course {
    id: number
    name: string
    provider: string
    area: string
    url: string
    spineWeek: number
    estimatedHours: number
}

// MongoDB document shapes
export interface IUser {
    userId: string
    startDate: Date
    streak: number
    longestStreak: number
    totalTasksDone: number
    preferences: {
        questionsPerDay: 8 | 9
        timezone: string
    }
}

export interface IDayRecord {
    userId: string
    dayN: number
    date: Date
    completedTaskIds: string[]
    isComplete: boolean
    completedAt?: Date
    enrichedTasks?: { taskId: string; enrichedText: string }[]
}

export interface ISkillProgress {
    userId: string
    barKey: 'python_algo_oop' | 'databases_concurrency' | 'js_node_security' | 'ml_ai_mlops' | 'build_output'
    value: number
    level: number
    lastUpdated: Date
}

export interface ILogRecord {
    userId: string
    dayN: number
    text: string
    type: 'win' | 'skip' | 'key' | 'block'
    createdAt: Date
}

export interface ITopicStatus {
    userId: string
    topicKey: string
    status: 'done' | 'partial' | 'revisit' | 'not_started'
    createdAt: Date
    updatedAt: Date
}

export interface ICarryForward {
    _id: Types.ObjectId
    userId: string
    fromDayN: number
    toDayN: number
    taskId: string
    taskText: string
    taskType: 'tech' | 'build' | 'mastery' | 'human' | 'survival'
    resolved: boolean
    resolvedAt?: Date
    timesCarried: number
    timesSkipped: number
}

export interface IWeeklyDigest {
    weekNumber: number
    dayN: number
    generatedAt: Date
    mastered: string[]
    fragile: string[]
    skipRisk: string[]
    nextWeekFocus: string
    honestAssessment: string
    rawText?: string
}

export interface IShadowInsight {
    userId: string
    topicKey: string
    keyConcepts: string[]
    weakSpots: string[]
    relatedTopics: string[]
    suggestRevisitIn: number
    rawSummary: string
    createdAt: Date
    updatedAt: Date
}

// API response shapes
export interface CarryForwardTask {
    _id: string
    fromDayN: number
    taskId: string
    taskText: string
    taskType: 'tech' | 'build' | 'mastery' | 'human' | 'survival'
}

export interface IntelEntry {
    _id: string
    userId: string
    dayN: number
    topicKey: string
    phase: string
    title: string
    what: string
    how: string
    resources: { label: string; url: string }[]
    codeSnippet?: string
    blockers?: string
    timeSpentMins: number
    createdAt: string
}

export interface TaskSpec {
    id: string
    text: string
    type: 'tech' | 'build' | 'mastery' | 'human' | 'survival'
    url?: string
}

export interface DayPayload {
    dayN: number
    phase: string
    isReviewDay: boolean
    isCheckpointDay: boolean
    project: Project | null
    spineArea: SpineArea
    topicToday: string
    topicKeyToday: string
    microtasksToday: string[]
    questions: Question[]
    basicSkill: BasicSkill
    payable: PayableSyllabus
    payableChapterToday?: string
    survivalToday?: { areaId: number, area: string, urgency: string, topic: string, drill: string }
    carriedTasks: CarryForwardTask[]
    completedTaskIds: string[]
    dayComplete: boolean
}

export interface DashboardData {
    totalDaysCompleted: number
    currentStreak: number
    longestStreak: number
    totalTasksDone: number
    carryForwardCount: number
    avgTasksPerDay: number
    completionHeatmap: { date: string; dayN: number; isComplete: boolean; taskCount: number }[]
    phaseProgress: { phase: string; dayStart: number; dayEnd: number; daysCompleted: number; totalDays: number }[]
    skillBars: Record<string, { value: number; level: number }>
    recentLogs: { text: string; type: string; dayN: number; createdAt: string }[]
}
