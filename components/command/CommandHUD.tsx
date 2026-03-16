'use client'

import { useDay } from '@/hooks/useDay'
import { getPhaseProgress, getExpectedTaskSpecs } from '@/lib/dayEngine'
import { Loader2, CheckCircle2, Circle, Flame, Moon, Sun, Code, Pickaxe, Brain, HardHat, BookOpen, User as UserIcon, ExternalLink, Command, ArrowRight, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { TaskSpec } from '@/types'
import { useBrainStore } from '@/store/brainStore'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Course {
    _id: string
    id: number
    name: string
    provider: string
    area: string
    url: string
    weekRecommended: number
    estimatedHours: number
}

function findCourseForUrl(courses: Course[], url: string | undefined): Course | undefined {
    if (!url) return undefined
    return courses.find(c => url.includes(c.url) || c.url.includes(url))
}

export default function CommandHUD() {
    const { renderMode, setRenderMode } = useBrainStore()
    const { data, toggleTask, markComplete, loading: isLoading } = useDay()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [dayCompleted, setDayCompleted] = useState(false)
    const [showCelebration, setShowCelebration] = useState(false)

    // 3C: Fetch courses for TechSmith badges
    const { data: courses = [] } = useSWR<Course[]>('/api/courses', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000
    })

    // 3A: Fetch stats for streak and progress
    const { data: statsData } = useSWR<any>('/api/stats', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000
    })

    const streak = statsData?.currentStreak || 0

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    // 3B: Handle day completion celebration
    useEffect(() => {
        if (data?.dayComplete && !dayCompleted) {
            setDayCompleted(true)
            // Only show celebration if it wasn't already marked complete in this session
            // or if we just triggered it via markComplete
            setShowCelebration(true)
            const timer = setTimeout(() => setShowCelebration(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [data?.dayComplete]) // Removed dayCompleted from deps to allow re-trigger if logic changes

    if (renderMode !== 'command') {
        // Just return a tiny corner button to go back home when not in command mode
        return (
            <button
                onClick={() => setRenderMode('command')}
                className="fixed top-4 left-4 z-[9999] bg-surface border border-borderLo text-text p-2 rounded-lg shadow-lg hover:border-accent/50 transition-colors"
                title="Return to Command HUD (Esc)"
            >
                <Command className="w-5 h-5 text-accent" />
            </button>
        )
    }

    if (isLoading || !data) {
        return (
            <div className="fixed inset-0 z-[9999] bg-bg/95 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    const dayN = data.dayN
    const phaseData = getPhaseProgress(dayN)
    const specs = getExpectedTaskSpecs(dayN, data)

    // Calculate total including carried tasks for completion logic
    const carriedTasksWithMeta = (data.carriedTasks || []).map((t: any) => ({
        id: t.taskId,
        text: t.taskText,
        type: t.taskType || 'tech',
        carryId: t._id || t.id,
        timesCarried: t.timesCarried || 1,
        fromDayN: t.fromDayN || dayN - 1
    } as TaskSpec & { carryId: string; timesCarried: number; fromDayN: number }))

    // 3D: Sort carried tasks by urgency: (timesCarried * 2) + (daysSinceOriginal * 0.5)
    // daysSinceOriginal = dayN - fromDayN
    const sortedCarriedTasks = [...carriedTasksWithMeta].sort((a, b) => {
        const urgencyA = (a.timesCarried * 2) + ((dayN - a.fromDayN) * 0.5)
        const urgencyB = (b.timesCarried * 2) + ((dayN - b.fromDayN) * 0.5)
        return urgencyB - urgencyA
    })

    const carriedSpecs = sortedCarriedTasks.map(t => ({
        id: t.id,
        text: t.text,
        type: t.type
    } as TaskSpec))

    const allTaskIds = [
        ...specs.map(s => s.id),
        ...carriedSpecs.map(s => s.id)
    ]

    const completedSet = new Set(data.completedTaskIds)
    const isAllDone = allTaskIds.every(id => completedSet.has(id))
    const doneCount = allTaskIds.filter(id => completedSet.has(id)).length
    const totalCount = allTaskIds.length

    const hour = currentTime.getHours()
    const isFocusWindow = (hour >= 21 || hour < 1)

    // Grouping tasks
    const techSmith = specs.filter(s => s.type === 'tech' && s.id.startsWith('tech_micro'))
    const techReview = specs.filter(s => s.type === 'tech' && s.id.startsWith('tech_review'))
    const mastery = specs.filter(s => s.type === 'mastery')
    const build = specs.filter(s => s.type === 'build')
    const survival = specs.filter(s => s.type === 'survival')
    const payable = specs.filter(s => s.id.startsWith('human_payable'))
    const basic = specs.filter(s => s.id.startsWith('human_skill'))

    // 3D: Check for red warning (×5+ carried items)
    const hasTooManyCarried = carriedTasksWithMeta.some(t => t.timesCarried >= 5)

    const handleSkipTask = async (carryId: string) => {
        try {
            await fetch(`/api/carry/${carryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'skip' })
            })
            // Reload page to refresh carried tasks
            window.location.reload()
        } catch (error) {
            console.error('Failed to skip task:', error)
        }
    }

    const TaskItem = ({ spec, showCourseBadge = false }: { spec: TaskSpec, showCourseBadge?: boolean }) => {
        const isDone = completedSet.has(spec.id)
        const matchedCourse = showCourseBadge && spec.url ? findCourseForUrl(courses, spec.url) : undefined

        return (
            <div
                onClick={() => toggleTask(spec.id, !isDone)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isDone
                    ? 'bg-success/5 border-success/20 opacity-60'
                    : 'bg-surface2/50 border-borderLo hover:border-accent/40'
                    }`}
            >
                <div className="mt-0.5 shrink-0">
                    {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                        <Circle className="w-5 h-5 text-muted2" />
                    )}
                </div>
                <div className={`text-sm leading-relaxed flex-1 ${isDone ? 'text-muted line-through' : 'text-text'}`}>
                    {spec.text}
                    {/* 3C: Course badge */}
                    {matchedCourse && !isDone && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-surface2 text-muted text-[10px] font-mono border border-borderLo">
                            [{matchedCourse.provider} · {matchedCourseEstimatedHours(matchedCourse)}h]
                        </span>
                    )}
                    {spec.url && !isDone && (
                        <a href={spec.url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center text-accent hover:underline opacity-80 hover:opacity-100" onClick={e => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 inline" />
                        </a>
                    )}
                </div>
            </div>
        )
    }

    // 3D: Carried Task Item with skip button
    const CarriedTaskItem = ({ task }: { task: typeof sortedCarriedTasks[0] }) => {
        const isDone = completedSet.has(task.id)
        return (
            <div
                onClick={() => toggleTask(task.id, !isDone, task.carryId)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isDone
                    ? 'bg-success/5 border-success/20 opacity-60'
                    : task.timesCarried >= 5 
                        ? 'bg-red-500/5 border-red-500/50 border-l-4' 
                        : 'bg-surface2/50 border-borderLo hover:border-accent/40'
                    }`}
            >
                <div className="mt-0.5 shrink-0">
                    {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                        <Circle className="w-5 h-5 text-muted2" />
                    )}
                </div>
                <div className={`flex-1 text-sm leading-relaxed ${isDone ? 'text-muted line-through' : 'text-text'}`}>
                    {task.text}
                    {task.timesCarried >= 5 && (
                        <div className="mt-1 text-red-400 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> ⚠ Carried {task.timesCarried} times — consider dropping or rescheduling
                        </div>
                    )}
                </div>
                {!isDone && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleSkipTask(task.carryId)
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-text bg-surface rounded border border-borderLo hover:border-accent/50 transition-colors"
                    >
                        Skip today <ArrowRight className="w-3 h-3" />
                    </button>
                )}
            </div>
        )
    }

    const CategoryGroup = ({ title, icon: Icon, tasks, colorClass }: { title: string, icon: any, tasks: TaskSpec[], colorClass: string }) => {
        if (!tasks.length) return null
        return (
            <div className="mb-6">
                <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                    {title}
                </div>
                <div className="flex flex-col gap-2">
                    {tasks.map(t => <TaskItem key={t.id} spec={t} showCourseBadge={title === 'TechSmith'} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-bg overflow-y-auto hide-scrollbar">
            {/* 3B: Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 z-[10000] bg-success/20 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-surface border-2 border-success rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="w-16 h-16 text-success" />
                            <div>
                                <h2 className="text-3xl font-black text-success">Day Complete!</h2>
                                <p className="text-muted mt-1">Great work on Day {dayN}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-32 min-h-[100dvh] flex flex-col">

                {/* Header Strip */}
                <div className="flex items-center justify-between border border-borderLo bg-surface2 rounded-xl p-4 mb-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <Command className="w-6 h-6 text-accent" />
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-text leading-none">
                                INTEL·OS
                            </span>
                            <span className="text-xs font-mono text-muted uppercase mt-1">
                                Day {dayN} / 180 · {phaseData.phaseName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-mono font-bold text-muted bg-surface px-3 py-1 rounded-md border border-borderLo">
                            <span className={isAllDone ? 'text-success' : 'text-text'}>{doneCount}</span>
                            <span className="opacity-50">/{totalCount}</span>
                        </div>
                        <button
                            onClick={() => setRenderMode('work')}
                            className="bg-accent text-bg px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                        >
                            <Brain className="w-4 h-4" />
                            Enter Brain
                        </button>
                    </div>
                </div>

                {/* 3A: Progress Ribbon - 28px thin ribbon below header */}
                <div className="h-7 flex items-center justify-between px-4 bg-surface border-x border-b border-borderLo -mt-px rounded-b-xl relative overflow-hidden">
                    {/* Background Progress Fill */}
                    <div 
                        className="absolute inset-y-0 left-0 bg-accent/5 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.round((doneCount/totalCount)*100)}%` }}
                    />
                    
                    <div className="flex items-center gap-4 text-xs font-mono relative z-10">
                        <span className="text-muted flex items-center gap-1">
                            <span className="text-muted2">DAY</span>
                            <span className="text-text font-bold">{dayN}</span>
                        </span>
                        <span className="text-muted">
                            <span className="text-accent font-bold">{phaseData.phasePct}%</span> phase
                        </span>
                        <span className="text-muted">
                            <span className={isAllDone ? 'text-success font-bold' : 'text-text font-bold'}>{Math.round((doneCount/totalCount)*100)}%</span> done
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono relative z-10">
                        {streak >= 2 && (
                            <span className="text-orange-400 flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3 fill-current" /> {streak}d streak
                            </span>
                        )}
                        <span className="text-muted">
                            {phaseData.dayInPhase}/{phaseData.totalDays} days in phase
                        </span>
                    </div>
                </div>

                {/* 3D: Carried Tasks with Smart Carry-Forward */}
                {sortedCarriedTasks.length > 0 && (
                    <div className={`mb-8 border rounded-xl p-4 ${hasTooManyCarried
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-orange-500/30 bg-orange-500/5'
                    }`}>
                        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-3">
                            <Flame className="w-4 h-4" />
                            {hasTooManyCarried && <AlertTriangle className="w-4 h-4 text-red-400" />}
                            Carried From Past ({sortedCarriedTasks.length})
                            {hasTooManyCarried && <span className="text-red-400 text-xs font-normal ml-1">(Too many! Complete today)</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            {sortedCarriedTasks.map(t => <CarriedTaskItem key={t.carryId} task={t} />)}
                        </div>
                    </div>
                )}

                {/* Mission Section */}
                <div className="flex-1 bg-surface border border-borderLo rounded-xl p-6 shadow-sm">
                    <div className="text-sm font-bold uppercase tracking-widest text-muted2 mb-6 border-b border-borderLo pb-2">
                        Today's Mission
                    </div>
                    {data.isReviewDay ? (
                        <CategoryGroup title="Weekly Review" icon={Flame} tasks={techReview} colorClass="text-orange-400" />
                    ) : (
                        <>
                            <CategoryGroup title="Project" icon={Pickaxe} tasks={build} colorClass="text-emerald-400" />
                            <CategoryGroup title="TechSmith" icon={Code} tasks={techSmith} colorClass="text-blue-400" />
                            <CategoryGroup title="Questions" icon={Brain} tasks={mastery} colorClass="text-purple-400" />
                            <CategoryGroup title="Survival Area" icon={HardHat} tasks={survival} colorClass="text-red-400" />
                            <CategoryGroup title="Payable Skill" icon={BookOpen} tasks={payable} colorClass="text-yellow-400" />
                            <CategoryGroup title="Basic Skill" icon={UserIcon} tasks={basic} colorClass="text-teal-400" />
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => {
                            if (isAllDone && !data.dayComplete) {
                                markComplete()
                                // 3B: Trigger celebration state
                                setDayCompleted(false)
                            }
                        }}
                        disabled={!isAllDone || data.dayComplete}
                        className={`px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all w-full sm:w-auto
                            ${data.dayComplete
                                ? 'bg-success/10 text-success border-success/30 border cursor-default'
                                : isAllDone
                                    ? 'bg-text text-bg hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                    : 'bg-surface2 text-muted cursor-not-allowed border border-borderLo'
                            }`}
                    >
                        {dayCompleted || data.dayComplete ? 'Day Complete!' : isAllDone ? '[ MARK DAY COMPLETE ]' : `${Math.round((doneCount/totalCount)*100)}% Complete`}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Helper function to get estimated hours from course
function matchedCourseEstimatedHours(course: Course): number {
    return course.estimatedHours || 4 // default to 4 hours if not specified
}