'use client'
// app/brain/[collection]/[id]/page.tsx
// Row detail page — full data for one row. Phase 1: display only. Phase 2 adds block editor.

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { COLLECTIONS, CollectionKey } from '@/lib/brain/collections'
import type { NormalizedRow } from '@/lib/brain/reader'
import BlockEditor from '@/components/brain/BlockEditor'
import BuildEvidence from '@/components/brain/BuildEvidence'

const HEADER_COLOR: Record<string, { bg: string; text: string; badge: string }> = {
    questions: { bg: 'bg-q-muted', text: 'text-q-base', badge: 'bg-q-base  text-white' },
    projects: { bg: 'bg-p-muted', text: 'text-p-base', badge: 'bg-p-base  text-white' },
    syllabus: { bg: 'bg-s-muted', text: 'text-s-base', badge: 'bg-s-base  text-white' },
    skills: { bg: 'bg-sk-muted', text: 'text-sk-base', badge: 'bg-sk-base text-white' },
    spine: { bg: 'bg-sp-muted', text: 'text-sp-base', badge: 'bg-sp-base text-white' },
    courses: { bg: 'bg-c-muted', text: 'text-c-base', badge: 'bg-c-base  text-white' },
    survival: { bg: 'bg-sv-muted', text: 'text-sv-base', badge: 'bg-sv-base text-white' },
}

const DIFFICULTY_LABEL: Record<number, { label: string; cls: string }> = {
    1: { label: 'EASY', cls: 'bg-success/60 text-green-800' },
    2: { label: 'MEDIUM', cls: 'bg-warning/60 text-yellow-800' },
    3: { label: 'HARD', cls: 'bg-danger/60  text-red-700' },
}

const URGENCY_CLS: Record<string, string> = {
    CRITICAL: 'bg-sv-muted text-sv-base font-bold',
    HIGH: 'bg-p-muted  text-p-base',
    MEDIUM: 'bg-warning/50 text-yellow-800',
}

// Hide internal fields from the detail view
const HIDDEN_KEYS = new Set(['_id', '_idx', '_topicsRaw', '_microtasksRaw', '_booksRaw', '_resourcesRaw', 'coreBooks'])

function DetailField({ label, value }: { label: string; value: any }) {
    if (value === undefined || value === null || value === '') return null

    // URL field
    if (typeof value === 'string' && value.startsWith('http')) {
        return (
            <div className="border-b border-brain-line py-4">
                <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1">{label}</p>
                <a href={value} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sp-base hover:underline font-body text-[13px]">
                    {value.length > 60 ? value.slice(0, 60) + '…' : value}
                    <ExternalLink size={11} />
                </a>
            </div>
        )
    }

    // Arrays
    if (Array.isArray(value)) {
        return (
            <div className="border-b border-brain-line py-4">
                <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-2">{label}</p>
                <ul className="space-y-1.5">
                    {value.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted2 flex-shrink-0 mt-1.5" />
                            {typeof item === 'object'
                                ? <span className="font-body text-[13px] text-text">{JSON.stringify(item)}</span>
                                : <span className="font-body text-[13px] text-text">{String(item)}</span>
                            }
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    // Numbers
    if (typeof value === 'number') {
        return (
            <div className="border-b border-brain-line py-4">
                <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1">{label}</p>
                <p className="font-mono text-[14px] text-text">{value.toLocaleString()}</p>
            </div>
        )
    }

    return (
        <div className="border-b border-brain-line py-4">
            <p className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-1">{label}</p>
            <p className="font-body text-[14px] text-text leading-relaxed">{String(value)}</p>
        </div>
    )
}

export default function RowDetailPage() {
    const params = useParams()
    const router = useRouter()
    const key = params.collection as CollectionKey
    const id = params.id as string
    const cfg = COLLECTIONS[key]
    const colors = HEADER_COLOR[key] ?? { bg: 'bg-surface2', text: 'text-text', badge: 'bg-text text-white' }

    const [row, setRow] = useState<NormalizedRow | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!key || !id) return
        fetch(`/api/brain/${key}/${id}`)
            .then(r => r.json())
            .then(r => { setRow(r); setLoading(false) })
            .catch(() => setLoading(false))
    }, [key, id])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-brain-line border-t-sp-base rounded-full animate-spin" />
            </div>
        )
    }

    if (!row || !cfg) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="font-mono text-[12px] text-muted">Record not found.</p>
            </div>
        )
    }

    const title = String(row[cfg.titleField] ?? `${cfg.singularLabel} ${id}`)
    const subtitle = cfg.subtitleField ? String(row[cfg.subtitleField] ?? '') : ''

    // Special rendering for certain fields
    const difficultyMeta = key === 'questions' ? DIFFICULTY_LABEL[row.difficulty] : null
    const urgencyCls = key === 'survival' ? URGENCY_CLS[row.urgency] : null

    // All raw fields to display (excluding internal keys + already shown header fields)
    const detailFields = Object.entries(row).filter(([k]) =>
        !HIDDEN_KEYS.has(k) && k !== cfg.titleField && k !== cfg.subtitleField
    )

    // Add the "raw" arrays back under clean labels
    if (row._topicsRaw) detailFields.push(['Topics', row._topicsRaw])
    if (row._microtasksRaw) detailFields.push(['Microtasks', row._microtasksRaw])
    if (row._booksRaw) detailFields.push(['Core Books', row._booksRaw])
    if (row._resourcesRaw) detailFields.push(['Resources', row._resourcesRaw.map((r: any) => `${r.name} — ${r.author}${r.free ? ' (free)' : ''}`)])

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Header strip */}
            <div className={`${colors.bg} px-5 pt-5 pb-4 border-b border-brain-line`}>
                <button
                    onClick={() => router.push(`/brain/${key}`)}
                    className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted hover:text-text mb-4 transition-colors"
                >
                    <ArrowLeft size={12} /> Back to {cfg.label}
                </button>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${colors.badge}`}>
                        {cfg.emoji} {cfg.singularLabel}
                    </span>
                    {subtitle && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/60 text-muted">
                            {subtitle}
                        </span>
                    )}
                    {difficultyMeta && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${difficultyMeta.cls}`}>
                            {difficultyMeta.label}
                        </span>
                    )}
                    {urgencyCls && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${urgencyCls}`}>
                            {row.urgency}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className={`font-body text-[18px] font-semibold text-text leading-snug max-w-2xl`}>
                    {title}
                </h1>
            </div>

            {/* Fields */}
            <div className="px-5 pb-24 divide-y divide-brain-line max-w-2xl">
                {detailFields.map(([label, value]) => (
                    <DetailField
                        key={label}
                        label={label.replace(/_/g, ' ').toUpperCase()}
                        value={value}
                    />
                ))}
            </div>

            {/* Build Evidence Locker (Projects only) */}
            {key === 'projects' && (
                <div className="px-5 max-w-2xl">
                    <BuildEvidence id={id} row={row} color={colors.text} />
                </div>
            )}

            {/* Block Editor */}
            <div className="px-5 pb-24 max-w-2xl">
                <BlockEditor collection={key} id={id} color={colors.text} />
            </div>
        </div>
    )
}
