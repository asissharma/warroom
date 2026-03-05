'use client'

import { useState } from 'react'
import { useIntel } from '@/hooks/useIntel'
import { useDay } from '@/hooks/useDay'
import { Target, Loader2, Plus, X, AlignLeft, Code, Clock, AlertTriangle, Send } from 'lucide-react'

import OfflineState from '@/components/OfflineState'

export default function IntelPage() {
    const { data: intelEntries, isLoading: intelLoading, error: intelError, createEntry } = useIntel()
    const { data: dayData, loading: dayLoading, error: dayError } = useDay()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [what, setWhat] = useState('')
    const [how, setHow] = useState('')
    const [timeSpent, setTimeSpent] = useState('')
    const [code, setCode] = useState('')
    const [blockers, setBlockers] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!dayData) return
        setSubmitting(true)

        const success = await createEntry({
            dayN: dayData.dayN,
            topicKey: dayData.topicToday || 'General',
            phase: dayData.phase || 'Unknown',
            title,
            what,
            how,
            timeSpentMins: parseInt(timeSpent) || 0,
            codeSnippet: code,
            blockers,
            resources: [] // To be added later
        })

        if (success) {
            setTitle('')
            setWhat('')
            setHow('')
            setTimeSpent('')
            setCode('')
            setBlockers('')
            setIsFormOpen(false)
        }
        setSubmitting(false)
    }

    if (dayError) return <OfflineState error={dayError} />

    if (intelLoading || dayLoading) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="content-z pb-32 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 min-h-[100dvh] flex flex-col relative">

            {/* Header Strip */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-borderLo">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-text">INTEL</h1>
                        <p className="text-xs text-muted font-mono tracking-wider uppercase">Mission Logs & Synthesis</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-text text-bg px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 a-transition"
                >
                    <Plus className="w-4 h-4" /> Log Intel
                </button>
            </div>

            {/* Quick Capture Overlay (Bottom Sheet on Mobile) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-bg/90 backdrop-blur-md p-0 sm:p-6 transition-all duration-300">
                    <div className="bg-surface/90 glass-panel w-full sm:max-w-xl max-h-[90dvh] sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="flex items-center justify-between p-5 border-b border-borderLo shrink-0 bg-transparent">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-text">Log Intel • Day {dayData?.dayN} • {dayData?.topicToday}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-muted hover:text-text rounded-full hover:bg-surface2 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <form id="intel-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted2 flex items-center gap-2">Title</label>
                                    <input
                                        required value={title} onChange={e => setTitle(e.target.value)}
                                        placeholder="One-line summary of what you learned"
                                        className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted2 flex items-center gap-2"><AlignLeft className="w-3.5 h-3.5" /> What did you learn?</label>
                                    <textarea
                                        required value={what} onChange={e => setWhat(e.target.value)}
                                        placeholder="Core concepts, mental models, raw facts..."
                                        rows={3}
                                        className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted2 flex items-center gap-2">How did you learn it?</label>
                                    <textarea
                                        required value={how} onChange={e => setHow(e.target.value)}
                                        placeholder="What process did you use? E.g., read docs, built a toy app, broke something."
                                        rows={2}
                                        className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted2 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Time (Mins)</label>
                                        <input
                                            type="number" required min="1" value={timeSpent} onChange={e => setTimeSpent(e.target.value)}
                                            placeholder="60"
                                            className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1 flex-[2]">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted2 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Blockers</label>
                                        <input
                                            value={blockers} onChange={e => setBlockers(e.target.value)}
                                            placeholder="What got you stuck?"
                                            className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted2 flex items-center gap-2"><Code className="w-3.5 h-3.5" /> Code Snippet (Optional)</label>
                                    <textarea
                                        value={code} onChange={e => setCode(e.target.value)}
                                        placeholder="Paste essential code blocks here..."
                                        rows={4}
                                        className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-xs font-mono text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-borderLo shrink-0 bg-surface">
                            <button
                                type="submit" form="intel-form" disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-text text-bg py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm disabled:opacity-50 hover:scale-[1.02] a-transition"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Save Intel</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="flex flex-col gap-4 relative">
                <div className="absolute left-6 top-4 bottom-4 w-px bg-borderLo/50 hidden sm:block pointer-events-none" />

                {intelError ? (
                    <div className="py-12 px-6 text-center text-red-500 border border-red-500/20 border-dashed rounded-2xl bg-red-500/5">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-bold">Failed to load intel entries</p>
                        <p className="text-xs mt-1 text-red-500/70">{intelError.message || 'An error occurred while fetching intel.'}</p>
                    </div>
                ) : intelEntries?.length === 0 ? (
                    <div className="py-12 text-center text-muted border border-borderLo border-dashed rounded-2xl bg-surface2/20">
                        <Target className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No intel recorded yet.</p>
                        <p className="text-xs mt-1">Capture your first learning log after today's mission.</p>
                    </div>
                ) : (
                    intelEntries?.map((entry: any) => (
                        <div key={entry._id} className="relative flex gap-4 w-full group">
                            <div className="hidden sm:flex mt-4 w-12 shrink-0 items-start justify-center relative z-10">
                                <div className="w-3 h-3 rounded-full bg-accent/20 border-[2px] border-accent ring-4 ring-bg" />
                            </div>

                            <div className="flex-1 glass-panel p-5 sm:p-6 a-transition group-hover:-translate-y-1">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-borderLo bg-surface2 text-muted">
                                                Day {entry.dayN}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-accent/20 bg-accent/5 text-accent">
                                                {entry.topicKey}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-text leading-tight">{entry.title}</h3>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-mono text-muted2">{new Date(entry.createdAt).toLocaleDateString()}</div>
                                        <div className="text-[10px] font-mono text-muted mt-0.5">{entry.timeSpentMins}m</div>
                                    </div>
                                </div>

                                <div className="space-y-4 text-sm mt-4 pt-4 border-t border-borderLo/50">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted2 mb-1 flex items-center gap-1.5"><AlignLeft className="w-3 h-3" /> Learned</div>
                                        <p className="text-muted leading-relaxed whitespace-pre-wrap">{entry.what}</p>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted2 mb-1 flex items-center gap-1.5">Method</div>
                                        <p className="text-muted leading-relaxed whitespace-pre-wrap">{entry.how}</p>
                                    </div>

                                    {entry.blockers && (
                                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Blocker</div>
                                            <p className="text-red-400 leading-relaxed whitespace-pre-wrap">{entry.blockers}</p>
                                        </div>
                                    )}

                                    {entry.codeSnippet && (
                                        <div className="relative group/code">
                                            <div className="absolute right-2 top-2 text-[10px] font-mono text-muted bg-surface/80 px-2 py-1 rounded shadow-sm opacity-0 group-hover/code:opacity-100 a-transition">
                                                CODE
                                            </div>
                                            <pre className="text-xs font-mono bg-[#0d1117] text-[#c9d1d9] p-4 rounded-xl overflow-x-auto border border-[#30363d] leading-relaxed">
                                                <code>{entry.codeSnippet}</code>
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
