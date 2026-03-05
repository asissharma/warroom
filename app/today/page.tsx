'use client'

import { useDay } from '@/hooks/useDay'
import { getPhaseProgress, getExpectedTaskSpecs } from '@/lib/dayEngine'
import { Loader2, CheckCircle2, Circle, Flame, Moon, Sun, Code, Pickaxe, Brain, HardHat, BookOpen, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { TaskSpec } from '@/lib/types'

export default function TodayPage() {
    const { data, toggleTask, markComplete, loading: isLoading } = useDay()
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    if (isLoading || !data) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    const dayN = data.dayN
    const phaseData = getPhaseProgress(dayN)
    const specs = getExpectedTaskSpecs(dayN, data)

    // Calculate total including carried tasks for completion logic
    const allTaskIds = [
        ...specs.map(s => s.id),
        ...(data.carriedTasks?.map((t: any) => t.taskId) || [])
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

    const TaskItem = ({ spec }: { spec: TaskSpec }) => {
        const isDone = completedSet.has(spec.id)
        return (
            <div
                onClick={() => toggleTask(spec.id, !isDone)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer a-transition ${isDone
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
                <div className={`text-sm leading-relaxed ${isDone ? 'text-muted line-through' : 'text-text'}`}>
                    {spec.text}
                </div>
            </div>
        )
    }

    const CategoryGroup = ({ title, icon: Icon, tasks, colorClass }: { title: string, icon: any, tasks: TaskSpec[], colorClass: string }) => {
        if (!tasks.length) return null
        return (
            <div className="mb-8">
                <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                    {title}
                </div>
                <div className="flex flex-col gap-2">
                    {tasks.map(t => <TaskItem key={t.id} spec={t} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="content-z pb-32 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 min-h-[100dvh] flex flex-col">

            {/* Header Strip */}
            <div className="flex items-center justify-between bg-surface border border-borderHi rounded-2xl p-4 mb-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tight text-text">DAY {dayN}</span>
                        <span className="text-xs font-mono text-muted2 uppercase">{phaseData.phaseName} • {phaseData.dayInPhase}/{phaseData.totalDays}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isFocusWindow
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-surface2 text-muted border border-borderLo'
                        }`}>
                        {isFocusWindow ? <Moon className="w-3.5 h-3.5 fill-current" /> : <Sun className="w-3.5 h-3.5" />}
                        {isFocusWindow ? 'FOCUS ACTIVE' : 'SHIFT OUT'}
                    </div>

                    <div className="text-sm font-mono text-muted">
                        <span className={isAllDone ? 'text-success font-bold' : 'text-text'}>{doneCount}</span>
                        <span className="opacity-50">/{totalCount}</span>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="flex-1">
                {data.isReviewDay ? (
                    <CategoryGroup title="Weekly Review" icon={Flame} tasks={techReview} colorClass="text-orange-400" />
                ) : (
                    <>
                        <CategoryGroup title="TechSmith" icon={Code} tasks={techSmith} colorClass="text-blue-400" />
                        <CategoryGroup title="Questions" icon={Brain} tasks={mastery} colorClass="text-purple-400" />
                        <CategoryGroup title="Project" icon={Pickaxe} tasks={build} colorClass="text-emerald-400" />
                        <CategoryGroup title="Survival Area" icon={HardHat} tasks={survival} colorClass="text-red-400" />
                        <CategoryGroup title="Payable Skill" icon={BookOpen} tasks={payable} colorClass="text-yellow-400" />
                        <CategoryGroup title="Basic Skill" icon={User} tasks={basic} colorClass="text-teal-400" />
                    </>
                )}

                {data.carriedTasks && data.carriedTasks.length > 0 && (
                    <CategoryGroup
                        title="Debt from Past"
                        icon={Flame}
                        tasks={data.carriedTasks.map((t: any) => ({ id: t.taskId, text: t.taskText, type: t.taskType as any }))}
                        colorClass="text-red-500"
                    />
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-borderLo flex justify-center pb-8">
                <button
                    onClick={() => {
                        if (isAllDone && !data.dayComplete) markComplete()
                    }}
                    disabled={!isAllDone || data.dayComplete}
                    className={`px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm a-transition w-full sm:w-auto
                        ${data.dayComplete
                            ? 'bg-success/10 text-success border-success/30 border cursor-default'
                            : isAllDone
                                ? 'bg-text text-bg hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                : 'bg-surface2 text-muted cursor-not-allowed border border-borderLo'
                        }`}
                >
                    {data.dayComplete ? 'MISSION ACCOMPLISHED' : isAllDone ? 'CLOSE THE DAY' : 'COMPLETE ALL TASKS TO CLOSE'}
                </button>
            </div>
        </div>
    )
}
