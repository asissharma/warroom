'use client'

import useSWR from 'swr'
import { Flame, Calendar, TrendingUp, AlertTriangle, Brain, MapPin, ChevronRight, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DashboardPage() {
    const { data: stats, isLoading: statsLoading } = useSWR('/api/stats', fetcher, { refreshInterval: 30000 })
    const { data: digest } = useSWR(stats?.daysCompleted > 0 ? `/api/digest?week=${Math.ceil(stats.daysCompleted / 7)}` : null, fetcher)

    if (statsLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    const dayN = stats?.dayN || 1
    const phase = stats?.phaseProgress?.find((p: any) => dayN >= p.dayStart && dayN <= p.dayEnd)
    const weekN = Math.ceil(dayN / 7)
    const dayInWeek = ((dayN - 1) % 7) + 1

    return (
        <div className="flex-1 min-h-[100dvh] bg-[#0a0a0b] text-white p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* 1. Mission Header */}
                <section className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-widest text-[#71717a]">Mission</span>
                        <span className="text-xs text-[#71717a]">Day {dayN} of 180</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        {phase?.phase || 'Foundation'}
                    </h1>
                    <p className="text-[#a1a1aa] text-sm">
                        Week {weekN} · Day {dayInWeek} of 7 · {phase?.daysRemaining || 0} days remaining
                    </p>
                </section>

                {/* 2. Streak Card */}
                <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-[#111113] border border-[#27272a] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-xs uppercase tracking-widest text-[#71717a]">Streak</span>
                        </div>
                        <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                            {stats?.currentStreak || 0}
                        </p>
                        <p className="text-xs text-[#71717a] mt-1">days</p>
                    </div>
                    <div className="bg-[#111113] border border-[#27272a] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs uppercase tracking-widest text-[#71717a]">Best</span>
                        </div>
                        <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                            {stats?.longestStreak || 0}
                        </p>
                        <p className="text-xs text-[#71717a] mt-1">days</p>
                    </div>
                    <div className="bg-[#111113] border border-[#27272a] rounded-xl p-5 col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-xs uppercase tracking-widest text-[#71717a]">Completed</span>
                        </div>
                        <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                            {stats?.daysCompleted || 0}
                        </p>
                        <p className="text-xs text-[#71717a] mt-1">of 180 days</p>
                    </div>
                </section>

                {/* 3. Week Snapshot */}
                <section className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Week {weekN} Snapshot
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const dayData = stats?.weekSummary?.[i]
                            const isComplete = dayData?.isComplete
                            const isToday = (dayInWeek === i + 1)
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                                        ${isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                                          isToday ? 'bg-accent/20 text-accent border border-accent' :
                                          'bg-[#27272a] text-[#71717a]'}`}>
                                        {isComplete ? '✓' : i + 1}
                                    </div>
                                    <span className="text-[10px] text-[#71717a] mt-1">
                                        {dayData?.taskCount || 0} tasks
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* 4. Carry-Forward Health */}
                <section className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-5 h-5 ${(stats?.carryForwardCount || 0) > 0 ? 'text-amber-500' : 'text-[#71717a]'}`} />
                            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Carry-Forward Health
                            </h2>
                        </div>
                        {(stats?.carryForwardCount || 0) >= 5 && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                ×{stats.carryForwardCount} at risk
                            </span>
                        )}
                    </div>
                    {stats?.carryItems?.length > 0 ? (
                        <div className="space-y-2">
                            {stats.carryItems.slice(0, 5).map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[#18181b] rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{item.taskText || item.taskId}</p>
                                        <p className="text-xs text-[#71717a]">
                                            Day {item.fromDayN} → Day {item.toDayN}
                                            {(item.timesCarried || 1) > 1 && ` · carried ×${item.timesCarried}`}
                                        </p>
                                    </div>
                                    <button className="ml-2 text-xs px-2 py-1 bg-[#27272a] hover:bg-[#3f3f46] rounded text-[#a1a1aa]">
                                        Skip →
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[#71717a] text-sm">No pending carry-forwards. Great job!</p>
                    )}
                </section>

                {/* 5. Weekly Digest */}
                <section className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Weekly Digest
                            </h2>
                        </div>
                        <span className="text-xs text-[#71717a]">Week {weekN}</span>
                    </div>
                    {digest ? (
                        <div className="space-y-4">
                            {digest.mastered?.length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-emerald-500 mb-2">Mastered</p>
                                    <div className="flex flex-wrap gap-1">
                                        {digest.mastered.map((topic: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {digest.fragile?.length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">Needs Work</p>
                                    <div className="flex flex-wrap gap-1">
                                        {digest.fragile.map((topic: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {digest.nextWeekFocus && (
                                <div className="pt-2 border-t border-[#27272a]">
                                    <p className="text-xs text-[#71717a] mb-1">Next Week Focus</p>
                                    <p className="text-sm text-white">{digest.nextWeekFocus}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[#71717a] text-sm">
                            {dayN < 7 ? 'Complete 7 days to see your first digest' : 'Loading digest...'}
                        </p>
                    )}
                </section>

                {/* 6. Phase Timeline Mini-map */}
                <section className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Phase Timeline
                            </h2>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {stats?.phaseProgress?.map((phase: any, i: number) => {
                            const isActive = dayN >= phase.dayStart && dayN <= phase.dayEnd
                            const isPast = dayN > phase.dayEnd
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className={`text-xs w-20 ${isActive ? 'text-white' : 'text-[#52525b]'}`}>
                                        {phase.phase}
                                    </span>
                                    <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isActive ? 'bg-accent' : isPast ? 'bg-emerald-500' : 'bg-[#3f3f46]'}`}
                                            style={{ width: isPast ? '100%' : isActive ? `${((dayN - phase.dayStart) / phase.totalDays) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="text-xs text-[#52525b] w-16 text-right">
                                        {phase.daysCompleted || 0}/{phase.totalDays}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Navigation back */}
                <div className="flex justify-center pt-4">
                    <a href="/" className="flex items-center gap-2 text-[#71717a] hover:text-white text-sm transition-colors">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Back to Today
                    </a>
                </div>
            </div>
        </div>
    )
}