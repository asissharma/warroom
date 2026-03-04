'use client'
// app/brain/[collection]/page.tsx — Database table view for any collection.

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { COLLECTIONS, CollectionKey } from '@/lib/brain/collections'
import type { NormalizedRow } from '@/lib/brain/reader'
import FilterBar from '@/components/brain/FilterBar'
import DatabaseTable from '@/components/brain/DatabaseTable'

const HEADER_BORDER: Record<string, string> = {
    questions: 'border-b-q-base',
    projects: 'border-b-p-base',
    syllabus: 'border-b-s-base',
    skills: 'border-b-sk-base',
    spine: 'border-b-sp-base',
    courses: 'border-b-c-base',
    survival: 'border-b-sv-base',
}

const HEADER_EMOJI_BG: Record<string, string> = {
    questions: 'bg-q-muted',
    projects: 'bg-p-muted',
    syllabus: 'bg-s-muted',
    skills: 'bg-sk-muted',
    spine: 'bg-sp-muted',
    courses: 'bg-c-muted',
    survival: 'bg-sv-muted',
}

export default function CollectionPage() {
    const params = useParams()
    const key = params.collection as CollectionKey
    const cfg = COLLECTIONS[key]

    const [rows, setRows] = useState<NormalizedRow[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Record<string, string>>({})

    const fetchRows = useCallback(async (f: Record<string, string>) => {
        if (!key || !cfg) return
        setLoading(true)
        try {
            const qs = new URLSearchParams({ limit: '1000', ...f }).toString()
            const r = await fetch(`/api/brain/${key}?${qs}`)
            const j = await r.json()
            setRows(j.rows ?? [])
            setTotal(j.total ?? 0)
        } finally {
            setLoading(false)
        }
    }, [key, cfg])

    useEffect(() => { fetchRows(filters) }, [filters, fetchRows])

    const handleFilterChange = useCallback((f: Record<string, string>) => {
        setFilters(f)
    }, [])

    if (!cfg) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="font-mono text-[12px] text-muted">Unknown collection: {key}</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Collection header */}
            <div className={`px-5 py-4 bg-brain-canvas border-b-2 ${HEADER_BORDER[key] ?? 'border-b-accent'} flex items-center gap-4`}>
                <div className={`w-10 h-10 rounded-xl ${HEADER_EMOJI_BG[key]} flex items-center justify-center text-xl`}>
                    {cfg.emoji}
                </div>
                <div className="flex-1">
                    <h2 className="font-bebas text-2xl text-text tracking-widest leading-none">{cfg.label.toUpperCase()}</h2>
                    <p className="font-mono text-[10px] text-muted tracking-wider mt-0.5">{cfg.description}</p>
                </div>
                {!loading && (
                    <div className="text-right">
                        <p className="font-bebas text-2xl text-text">{total.toLocaleString()}</p>
                        <p className="font-mono text-[9px] text-muted2">RECORDS</p>
                    </div>
                )}
            </div>

            {/* Filter bar */}
            <FilterBar config={cfg} onChange={handleFilterChange} />

            {/* Data table */}
            <DatabaseTable
                collection={key}
                config={cfg}
                rows={rows}
                total={total}
                isLoading={loading}
            />
        </div>
    )
}
