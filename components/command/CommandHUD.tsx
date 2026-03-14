'use client'

import { useDay } from '@/hooks/useDay'
import { getPhaseProgress, getExpectedTaskSpecs } from '@/lib/dayEngine'
import { Loader2, CheckCircle2, Circle, Flame, Moon, Sun, Code, Pickaxe, Brain, HardHat, BookOpen, User as UserIcon, ExternalLink, Command } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { TaskSpec } from '@/types'
import { useBrainStore } from '@/store/brainStore'

export default function CommandHUD() {
    const { renderMode, setRenderMode } = useBrainStore()
    const { data, toggleTask, markComplete, loading: isLoading } = useDay()
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

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
    const carriedSpecs = (data.carriedTasks || []).map((t: any) => ({
        id: t.taskId,
        text: t.taskText,
        type: t.taskType || 'tech'
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

    const TaskItem = ({ spec }: { spec: TaskSpec }) => {
        const isDone = completedSet.has(spec.id)
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
                <div className={`text-sm leading-relaxed ${isDone ? 'text-muted line-through' : 'text-text'}`}>
                    {spec.text}
                    {spec.url && !isDone && (
                        <a href={spec.url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center text-accent hover:underline opacity-80 hover:opacity-100" onClick={e => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3 inline" />
                        </a>
                    )}
                </div>
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
                    {tasks.map(t => <TaskItem key={t.id} spec={t} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-bg overflow-y-auto hide-scrollbar">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-32 min-h-[100dvh] flex flex-col">

                {/* Header Strip */}
                <div className="flex items-center justify-between border border-borderLo bg-surface2 rounded-xl p-4 mb-8 shadow-md">
                    <div className="flex items-center gap-3">
                        <Command className="w-6 h-6 text-accent" />
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-text leading-none">
                                INTEL·OS
                            </span>
                            <span className="text-xs font-mono text-muted uppercase mt-1">
                                Day {dayN} / 180 • {phaseData.phaseName}
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

                {/* Carried Tasks Badge */}
                {carriedSpecs.length > 0 && (
                    <div className="mb-8 border border-orange-500/30 bg-orange-500/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-3">
                            <Flame className="w-4 h-4" />
                            ⚠ Carried From Past ({carriedSpecs.length})
                        </div>
                        <div className="flex flex-col gap-2">
                            {carriedSpecs.map(t => <TaskItem key={t.id} spec={t} />)}
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
                            if (isAllDone && !data.dayComplete) markComplete()
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
                        {data.dayComplete ? 'Mission Accomplished' : isAllDone ? '[ MARK DAY COMPLETE ]' : `${Math.round((doneCount/totalCount)*100)}% Complete`}
                    </button>
                </div>
            </div>
        </div>
    )
}
