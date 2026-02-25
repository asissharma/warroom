import dailyPlanRaw from '@/data/daily-plan.json'
import questionsRaw from '@/data/questions.json'
import type { DayPlan, Question } from './types'

export function getDayN(startDate: string): number {
    if (!startDate) return 1;
    const start = new Date(startDate)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / 86400000)
    return Math.max(1, Math.min(180, diff + 1))
}

export function getDayData(dayN: number): DayPlan {
    const data = dailyPlanRaw as unknown as DayPlan[];
    return data[dayN - 1] || data[0];
}

export function getQuestionsForDay(dayN: number): Question[] {
    const day = getDayData(dayN);
    if (!day.questionTheme) return [];
    const pool = (questionsRaw as unknown as Question[]).filter(q => q.theme === day.questionTheme);
    const start = (day.questionOffset || 0) % Math.max(pool.length, 1);
    return pool.slice(start, start + 3);
}
