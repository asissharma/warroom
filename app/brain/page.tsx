'use client'
// app/brain/page.tsx — Command Center: the Brain home page.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { COLLECTION_ORDER, COLLECTIONS, CollectionKey } from '@/lib/brain/collections'

const ACCENT_BG: Record<CollectionKey, string> = {
    questions: 'from-q-base  to-q-glow',
    projects: 'from-p-base  to-p-glow',
    syllabus: 'from-s-base  to-s-glow',
    skills: 'from-sk-base to-sk-glow',
    spine: 'from-sp-base to-sp-glow',
    courses: 'from-c-base  to-c-glow',
    survival: 'from-sv-base to-sv-glow',
}

const CARD_BG: Record<CollectionKey, string> = {
    questions: 'bg-q-muted  border-q-base/20  hover:border-q-base/50',
    projects: 'bg-p-muted  border-p-base/20  hover:border-p-base/50',
    syllabus: 'bg-s-muted  border-s-base/20  hover:border-s-base/50',
    skills: 'bg-sk-muted border-sk-base/20 hover:border-sk-base/50',
    spine: 'bg-sp-muted border-sp-base/20 hover:border-sp-base/50',
    courses: 'bg-c-muted  border-c-base/20  hover:border-c-base/50',
    survival: 'bg-sv-muted border-sv-base/20 hover:border-sv-base/50',
}

const COUNT_COLOR: Record<CollectionKey, string> = {
    questions: 'text-q-base',
    projects: 'text-p-base',
    syllabus: 'text-s-base',
    skills: 'text-sk-base',
    spine: 'text-sp-base',
    courses: 'text-c-base',
    survival: 'text-sv-base',
}

export default function BrainHome() {
    const [collections, setCollections] = useState<Array<{
        key: CollectionKey; label: string; emoji: string; count: number; description: string
    }>>([])

    useEffect(() => {
        fetch('/api/brain/collections')
            .then(r => r.json())
            .then(setCollections)
            .catch(() => { })
    }, [])

    const totalRecords = collections.reduce((s, c) => s + c.count, 0)

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Hero */}
            <div className="px-6 pt-10 pb-8 bg-brain-canvas border-b border-brain-line">
                <p className="font-mono text-[10px] tracking-[4px] text-muted2 mb-3">INTEL·OS BRAIN</p>
                <h1 className="font-bebas text-5xl text-text tracking-wider leading-none mb-2">
                    KNOWLEDGE WORKSPACE
                </h1>
                <p className="font-body text-[14px] text-muted max-w-lg">
                    Every question, project, book, skill, and resource powering your 180-day residency.
                    Searchable. Annotatable. Yours.
                </p>
                <div className="flex items-center gap-6 mt-5">
                    <div>
                        <p className="font-bebas text-3xl text-text">{totalRecords.toLocaleString()}</p>
                        <p className="font-mono text-[9px] tracking-[2px] text-muted2">TOTAL RECORDS</p>
                    </div>
                    <div>
                        <p className="font-bebas text-3xl text-text">{collections.length}</p>
                        <p className="font-mono text-[9px] tracking-[2px] text-muted2">DATABASES</p>
                    </div>
                    <div className="ml-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-brain-line text-muted text-[11px] font-mono">
                            Press <kbd className="bg-surface2 px-1 rounded text-[10px]">⌘K</kbd> to search
                        </div>
                    </div>
                </div>
            </div>

            {/* Database cards */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {COLLECTION_ORDER.map(key => {
                    const cfg = COLLECTIONS[key]
                    const data = collections.find(c => c.key === key)
                    const count = data?.count ?? 0

                    return (
                        <Link
                            key={key}
                            href={`/brain/${key}`}
                            className={`relative group flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${CARD_BG[key]}`}
                        >
                            {/* Gradient bar */}
                            <div className={`absolute top-0 left-5 right-5 h-0.5 rounded-full bg-gradient-to-r ${ACCENT_BG[key]} opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className="flex items-start justify-between">
                                <span className="text-3xl">{cfg.emoji}</span>
                                <span className={`font-bebas text-4xl ${COUNT_COLOR[key]} leading-none`}>
                                    {count.toLocaleString()}
                                </span>
                            </div>

                            <div>
                                <p className="font-bebas text-xl text-text tracking-wider">{cfg.label.toUpperCase()}</p>
                                <p className="font-body text-[12px] text-muted mt-0.5 leading-relaxed">{cfg.description}</p>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-2">
                                <span className="font-mono text-[9px] tracking-[2px] text-muted2">{count.toLocaleString()} RECORDS</span>
                                <span className={`font-mono text-[11px] ${COUNT_COLOR[key]} opacity-0 group-hover:opacity-100 transition-opacity`}>View all →</span>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Quick tips */}
            <div className="px-6 pb-24">
                <p className="font-mono text-[9px] tracking-[3px] text-muted2 uppercase mb-3">Tips</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { key: '⌘K', tip: 'Search across all databases instantly' },
                        { key: '→', tip: 'Click any row to open its full page + add notes' },
                        { key: '🛡', tip: 'Survival areas sorted by urgency — start there' },
                    ].map(({ key, tip }) => (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-brain-line">
                            <kbd className="font-mono text-[13px] bg-surface2 px-2 py-1 rounded text-text flex-shrink-0">{key}</kbd>
                            <p className="font-body text-[12px] text-muted">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
