'use client'
// components/brain/DatabaseTable.tsx
// Generic virtualized table renderer. Config-driven columns + row click → detail page.

import { useRouter } from 'next/navigation'
import type { CollectionConfig } from '@/lib/brain/collections'
import type { NormalizedRow } from '@/lib/brain/reader'

// ── Badge colour map by value ────────────────────────────────────────────────
const DIFFICULTY_LABELS: Record<number, { label: string; cls: string }> = {
    1: { label: 'EASY', cls: 'bg-success/60  text-green-800' },
    2: { label: 'MEDIUM', cls: 'bg-warning/60  text-yellow-800' },
    3: { label: 'HARD', cls: 'bg-danger/60   text-red-700' },
}

const PHASE_COLORS: Record<string, string> = {
    'Foundation': 'bg-q-muted  text-q-base',
    'Distributed': 'bg-p-muted  text-p-base',
    'Cloud': 'bg-sp-muted text-sp-base',
    'Security': 'bg-sv-muted text-sv-base',
    'ML/AI': 'bg-sk-muted text-sk-base',
    'Advanced Frontend': 'bg-c-muted  text-c-base',
    'Architecture': 'bg-s-muted  text-s-base',
    'Capstone': 'bg-warning/50 text-yellow-800',
}

const URGENCY_COLORS: Record<string, string> = {
    CRITICAL: 'bg-sv-muted text-sv-base font-bold',
    HIGH: 'bg-p-muted  text-p-base',
    MEDIUM: 'bg-warning/50 text-yellow-800',
}

function CellValue({ col, value }: { col: CollectionConfig['columns'][0]; value: any }) {
    if (value === undefined || value === null) return <span className="text-muted2">—</span>

    switch (col.render) {
        case 'difficulty': {
            const d = DIFFICULTY_LABELS[value] ?? { label: String(value), cls: 'bg-surface2 text-text' }
            return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider ${d.cls}`}>
                    {d.label}
                </span>
            )
        }
        case 'phase': {
            const cls = PHASE_COLORS[value] ?? 'bg-surface2 text-text'
            return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${cls}`}>
                    {value}
                </span>
            )
        }
        case 'badge': {
            // Urgency badge for survival collection
            if (URGENCY_COLORS[value]) {
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${URGENCY_COLORS[value]}`}>
                        {value}
                    </span>
                )
            }
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface2 text-muted">
                    {String(value)}
                </span>
            )
        }
        case 'number':
            return <span className="font-mono text-[12px] text-muted">{Number(value).toLocaleString()}</span>
        default: {
            const str = String(value)
            return (
                <span className={`${col.mono ? 'font-mono text-[11px]' : 'font-body text-[13px]'} text-text ${col.truncate ? 'truncate block' : ''}`}>
                    {str}
                </span>
            )
        }
    }
}

interface Props {
    collection: string
    config: CollectionConfig
    rows: NormalizedRow[]
    total: number
    isLoading?: boolean
}

export default function DatabaseTable({ collection, config, rows, total, isLoading }: Props) {
    const router = useRouter()

    const ROW_BORDER_MAP: Record<string, string> = {
        questions: 'hover:border-l-q-base',
        projects: 'hover:border-l-p-base',
        syllabus: 'hover:border-l-s-base',
        skills: 'hover:border-l-sk-base',
        spine: 'hover:border-l-sp-base',
        courses: 'hover:border-l-c-base',
        survival: 'hover:border-l-sv-base',
    }
    const rowBorder = ROW_BORDER_MAP[collection] ?? 'hover:border-l-accent'

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-brain-line border-t-sp-base rounded-full animate-spin" />
                    <p className="font-mono text-[11px] text-muted tracking-wider">LOADING…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Count bar */}
            <div className="px-4 py-2 border-b border-brain-line bg-brain-canvas flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted tracking-[2px]">
                    {rows.length < total ? `${rows.length} of ${total.toLocaleString()}` : `${total.toLocaleString()}`} RECORDS
                </span>
            </div>

            {/* Table header */}
            <div className="bg-brain-canvas border-b border-brain-line">
                <div className="flex items-center px-4 gap-3 h-9">
                    {config.columns.map(col => (
                        <div key={col.key} className={`${col.width} flex-shrink-0 font-mono text-[9px] tracking-[2px] text-muted2 uppercase select-none`}>
                            {col.label}
                        </div>
                    ))}
                    <div className="w-5 flex-shrink-0" /> {/* chevron space */}
                </div>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto">
                {rows.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="font-mono text-[11px] text-muted">No results.</p>
                    </div>
                ) : rows.map((row, i) => (
                    <div
                        key={row._id}
                        onClick={() => router.push(`/brain/${collection}/${row._id}`)}
                        className={`
              flex items-center px-4 gap-3 h-11 cursor-pointer
              border-l-2 border-l-transparent transition-all duration-100
              ${i % 2 === 0 ? 'bg-brain-canvas' : 'bg-white/40'}
              hover:bg-white ${rowBorder}
              group
            `}
                    >
                        {config.columns.map(col => (
                            <div key={col.key} className={`${col.width} flex-shrink-0 min-w-0`}>
                                <CellValue col={col} value={row[col.key]} />
                            </div>
                        ))}
                        {/* Chevron */}
                        <div className="w-5 flex-shrink-0 text-right">
                            <span className="font-mono text-[12px] text-muted/0 group-hover:text-muted transition-colors">›</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
