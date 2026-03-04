'use client'
// components/brain/BuildEvidence.tsx
// Renders the Build Evidence Locker for the projects collection. Includes doneMeans checklist, links, self-score, and hours.

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckSquare, Square, ExternalLink, Link as LinkIcon, Clock, Star, Scissors, AlertTriangle } from 'lucide-react'
import type { NormalizedRow } from '@/lib/brain/reader'

interface Props {
    id: string
    row: NormalizedRow
    color: string // Tailwind text color class, e.g. text-p-base
}

export default function BuildEvidence({ id, row, color }: Props) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // State matching IBuildRecord
    const [state, setState] = useState({
        doneMeansChecked: false,
        githubUrl: '',
        demoUrl: '',
        hours: '' as string | number, // use string for input driving
        selfScore: 0,
        whatICut: '',
        whatBroke: ''
    })

    const saveTimeout = useRef<NodeJS.Timeout | null>(null)

    // Load initial data
    useEffect(() => {
        fetch(`/api/brain/projects/${id}/build`)
            .then(r => r.json())
            .then(data => {
                if (!data.error) {
                    setState({
                        doneMeansChecked: data.doneMeansChecked ?? false,
                        githubUrl: data.githubUrl ?? '',
                        demoUrl: data.demoUrl ?? '',
                        hours: data.hours !== null ? String(data.hours) : '',
                        selfScore: data.selfScore ?? 0,
                        whatICut: data.whatICut ?? '',
                        whatBroke: data.whatBroke ?? ''
                    })
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    // Auto-save logic
    const triggerSave = useCallback((newState: typeof state) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        setSaving(true)
        saveTimeout.current = setTimeout(async () => {
            const payload = {
                ...newState,
                hours: newState.hours === '' ? null : Number(newState.hours)
            }
            await fetch(`/api/brain/projects/${id}/build`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            setSaving(false)
        }, 800)
    }, [id])

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => {
            const next = { ...prev, ...updates }
            triggerSave(next)
            return next
        })
    }

    if (loading) {
        return (
            <div className="py-8 flex justify-center">
                <div className={`w-5 h-5 border-2 border-brain-line rounded-full animate-spin border-t-current ${color}`} />
            </div>
        )
    }

    return (
        <div className="mt-8 mb-8 p-5 rounded-xl border border-brain-line bg-surface2/30">
            <div className="flex items-center justify-between mb-5 border-b border-brain-line pb-3">
                <span className="font-bebas text-lg text-text tracking-wider flex items-center gap-2">
                    EVIDENCE LOCKER
                </span>
                <span className={`font-mono text-[9px] tracking-[2px] ${saving ? 'opacity-50' : 'opacity-100'} transition-opacity ${color}`}>
                    {saving ? 'SAVING...' : 'SAVED'}
                </span>
            </div>

            <div className="space-y-6">

                {/* Done Means Checklist */}
                <div>
                    <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-2">Done Means</p>
                    <button
                        onClick={() => updateState({ doneMeansChecked: !state.doneMeansChecked })}
                        className="flex items-start gap-3 w-full text-left group hover:bg-white/40 p-2 -ml-2 rounded transition-colors"
                    >
                        <div className={`mt-0.5 ${state.doneMeansChecked ? color : 'text-muted2 group-hover:text-muted'} transition-colors`}>
                            {state.doneMeansChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                        </div>
                        <p className={`font-body text-[14px] leading-relaxed ${state.doneMeansChecked ? 'text-muted line-through' : 'text-text'}`}>
                            {row.doneMeans || "No completion criteria specified for this project."}
                        </p>
                    </button>
                </div>

                {/* Primary Meta Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GitHub */}
                    <div className="flex bg-white/50 border border-brain-line rounded-lg overflow-hidden focus-within:border-p-muted transition-colors">
                        <div className="px-3 flex items-center justify-center bg-surface2 border-r border-brain-line text-muted">
                            <LinkIcon size={14} />
                        </div>
                        <input
                            type="url"
                            placeholder="github.com/user/project"
                            value={state.githubUrl}
                            onChange={e => updateState({ githubUrl: e.target.value })}
                            className="flex-1 bg-transparent px-3 py-2 text-[13px] font-mono text-text outline-none placeholder:text-muted2/50"
                        />
                        {state.githubUrl && (
                            <a href={state.githubUrl} target="_blank" rel="noopener noreferrer" className="px-3 flex items-center justify-center text-muted hover:text-p-base transition-colors">
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </div>

                    {/* Demo */}
                    <div className="flex bg-white/50 border border-brain-line rounded-lg overflow-hidden focus-within:border-p-muted transition-colors">
                        <div className="px-3 flex items-center justify-center bg-surface2 border-r border-brain-line text-muted">
                            <span className="font-bebas text-[11px] tracking-wider translate-y-px">DEMO</span>
                        </div>
                        <input
                            type="url"
                            placeholder="project.vercel.app"
                            value={state.demoUrl}
                            onChange={e => updateState({ demoUrl: e.target.value })}
                            className="flex-1 bg-transparent px-3 py-2 text-[13px] font-mono text-text outline-none placeholder:text-muted2/50"
                        />
                        {state.demoUrl && (
                            <a href={state.demoUrl} target="_blank" rel="noopener noreferrer" className="px-3 flex items-center justify-center text-muted hover:text-p-base transition-colors">
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Small Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Hours */}
                    <div className="col-span-1">
                        <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1.5 flex items-center gap-1"><Clock size={10} /> Hours</p>
                        <input
                            type="number"
                            step="0.5"
                            placeholder="e.g. 6.5"
                            value={state.hours}
                            onChange={e => updateState({ hours: e.target.value })}
                            className="w-full bg-white/50 border border-brain-line rounded-lg px-3 py-2 text-[13px] font-mono text-text outline-none focus:border-p-muted transition-colors placeholder:text-muted2/50"
                        />
                    </div>
                    {/* Score */}
                    <div className="col-span-1 md:col-span-3">
                        <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1.5 flex items-center gap-1"><Star size={10} /> Self-Score (0-5)</p>
                        <div className="flex items-center gap-1 h-[38px]">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => updateState({ selfScore: star === state.selfScore ? 0 : star })}
                                    className={`p-1.5 rounded-full transition-all hover:scale-110 ${star <= state.selfScore ? color : 'text-muted2 hover:text-muted'}`}
                                >
                                    <Star size={16} fill={star <= state.selfScore ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Text logs */}
                <div className="space-y-4 pt-2 border-t border-brain-line">
                    <div>
                        <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1.5 flex items-center gap-1.5"><Scissors size={10} /> What I Cut</p>
                        <textarea
                            value={state.whatICut}
                            onChange={e => updateState({ whatICut: e.target.value })}
                            placeholder="Scope you removed to ship on time..."
                            className="w-full bg-white/50 border border-brain-line rounded-lg px-3 py-2.5 text-[13px] font-body text-text outline-none focus:border-p-muted transition-colors placeholder:text-muted2/50 resize-y min-h-[60px]"
                        />
                    </div>
                    <div>
                        <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1.5 flex items-center gap-1.5"><AlertTriangle size={10} /> What Broke</p>
                        <textarea
                            value={state.whatBroke}
                            onChange={e => updateState({ whatBroke: e.target.value })}
                            placeholder="Bugs you hit and how you fixed them..."
                            className="w-full bg-white/50 border border-brain-line rounded-lg px-3 py-2.5 text-[13px] font-body text-text outline-none focus:border-p-muted transition-colors placeholder:text-muted2/50 resize-y min-h-[60px]"
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
