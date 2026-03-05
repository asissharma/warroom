'use client'

import { useState } from 'react'
import { useMap } from '@/hooks/useMap'
import { Brain, Flame, Target, Loader2, CheckCircle2, CircleDashed, RotateCcw, Circle } from 'lucide-react'
import spineData from '@/data/tech-spine.json'

type Tab = 'TIMELINE' | 'TOPICS' | 'PROGRESS'
type StatusType = 'done' | 'partial' | 'revisit' | 'not_started'

// Extract all unique topics from spine data
const allTopics = Array.from(new Set(
    (spineData as any[]).flatMap(s => s.topics || [])
))

const STATUS_CONFIG: Record<StatusType, { icon: any, color: string, label: string }> = {
    done: { icon: CheckCircle2, color: 'text-success border-success/30 bg-success/10', label: 'Done' },
    partial: { icon: CircleDashed, color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10', label: 'Partial' },
    revisit: { icon: RotateCcw, color: 'text-orange-500 border-orange-500/30 bg-orange-500/10', label: 'Revisit' },
    not_started: { icon: Circle, color: 'text-muted2 border-borderLo bg-surface2/50', label: 'Not Started' }
}

export default function MapPage() {
    const { statuses, stats, updateTopicStatus } = useMap()
    const [activeTab, setActiveTab] = useState<Tab>('TIMELINE')

    if (!statuses || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    const getTopicStatus = (topicKey: string): StatusType => {
        const entry = statuses.find((s: any) => s.topicKey === topicKey)
        return entry ? entry.status : 'not_started'
    }

    const cycleStatus = (topicKey: string, current: StatusType) => {
        const order: StatusType[] = ['not_started', 'partial', 'done', 'revisit']
        const nextIdx = (order.indexOf(current) + 1) % order.length
        updateTopicStatus(topicKey, order[nextIdx])
    }

    // Group spine data by phase for Timeline view
    const phases = (spineData as any[]).reduce((acc: any, curr: any) => {
        if (!acc[curr.phase]) acc[curr.phase] = []
        acc[curr.phase].push(curr)
        return acc
    }, {})

    return (
        <div className="content-z pb-32 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 min-h-[100dvh] flex flex-col">

            {/* Header Strip */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-borderLo">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Brain className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-text">MAP</h1>
                        <p className="text-xs text-muted font-mono tracking-wider uppercase">Syllabus & Atlas</p>
                    </div>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="flex bg-surface2 rounded-xl p-1 mb-6 border border-borderLo">
                {(['TIMELINE', 'TOPICS', 'PROGRESS'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg a-transition ${activeTab === tab ? 'bg-surface shadow text-text' : 'text-muted hover:text-text'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Views */}
            <div className="flex-1">

                {activeTab === 'TIMELINE' && (
                    <div className="space-y-8">
                        {Object.entries(phases).map(([phaseName, blocks]: [string, any]) => (
                            <div key={phaseName} className="bg-surface border border-borderHi rounded-2xl p-5">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-text mb-4 pb-2 border-b border-borderLo flex items-center gap-2">
                                    <Target className="w-4 h-4 text-accent" /> {phaseName}
                                </h2>
                                <div className="space-y-4">
                                    {blocks.map((block: any) => (
                                        <div key={block.id} className="grid grid-cols-[60px_1fr] gap-4">
                                            <div className="text-[10px] font-mono text-muted pt-1">
                                                Wk {block.weekStart}-{block.weekEnd}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {block.topics?.map((t: string) => {
                                                    const stat = getTopicStatus(t)
                                                    const config = STATUS_CONFIG[stat]
                                                    return (
                                                        <span key={t} className={`text-xs px-2 py-1 rounded border ${config.color}`}>
                                                            {t}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'TOPICS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allTopics.map(topic => {
                            const stat = getTopicStatus(topic)
                            const config = STATUS_CONFIG[stat]
                            const Icon = config.icon
                            return (
                                <div
                                    key={topic}
                                    onClick={() => cycleStatus(topic, stat)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer a-transition select-none ${config.color} hover:brightness-110`}
                                >
                                    <span className="text-sm font-medium leading-tight truncate px-2">{topic}</span>
                                    <Icon className="w-4 h-4 shrink-0" />
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'PROGRESS' && (
                    <div className="space-y-4">
                        <div className="bg-surface border border-borderHi rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
                            <Flame className="w-8 h-8 text-orange-500" />
                            <div className="text-4xl font-black">{stats.currentStreak}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted">Current Streak</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                                <div className="text-2xl font-black text-text mb-1">{stats.daysCompleted}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Days Executed</div>
                            </div>
                            <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                                <div className="text-2xl font-black text-text mb-1">{stats.totalTasksDone}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Tasks Cleared</div>
                            </div>
                            <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                                <div className="text-2xl font-black text-text mb-1">{stats.longestStreak}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Longest Streak</div>
                            </div>
                            <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                                <div className="text-2xl font-black text-text mb-1 text-accent">{stats.phaseProgress.phaseName}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Current Phase</div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
