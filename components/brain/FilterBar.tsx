'use client'
// components/brain/FilterBar.tsx
// Dynamic search + filter bar that adapts to the active collection.

import { useEffect, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import type { CollectionConfig } from '@/lib/brain/collections'

interface Props {
    config: CollectionConfig
    onChange: (filters: Record<string, string>) => void
}

const GLOW_MAP: Record<string, string> = {
    'q-base': 'focus:ring-q-base/40  focus:border-q-base',
    'p-base': 'focus:ring-p-base/40  focus:border-p-base',
    's-base': 'focus:ring-s-base/40  focus:border-s-base',
    'sk-base': 'focus:ring-sk-base/40 focus:border-sk-base',
    'sp-base': 'focus:ring-sp-base/40 focus:border-sp-base',
    'c-base': 'focus:ring-c-base/40  focus:border-c-base',
    'sv-base': 'focus:ring-sv-base/40 focus:border-sv-base',
}

const TOGGLE_ACTIVE: Record<string, string> = {
    'q-base': 'bg-q-base   text-white',
    'p-base': 'bg-p-base   text-white',
    's-base': 'bg-s-base   text-white',
    'sk-base': 'bg-sk-base  text-white',
    'sp-base': 'bg-sp-base  text-white',
    'c-base': 'bg-c-base   text-white',
    'sv-base': 'bg-sv-base  text-white',
}

export default function FilterBar({ config, onChange }: Props) {
    const [filters, setFilters] = useState<Record<string, string>>({})
    const glow = GLOW_MAP[config.colorBase] ?? ''
    const active = TOGGLE_ACTIVE[config.colorBase] ?? 'bg-text text-white'

    const setFilter = useCallback((key: string, val: string) => {
        setFilters(prev => {
            const next = { ...prev }
            if (val === '' || (prev[key] === val)) {
                delete next[key]
            } else {
                next[key] = val
            }
            return next
        })
    }, [])

    useEffect(() => { onChange(filters) }, [filters, onChange])

    return (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-brain-line bg-brain-canvas sticky top-0 z-10">
            {config.filters.map(f => {
                if (f.type === 'search') {
                    return (
                        <div key={f.key} className="relative flex-1 min-w-[180px] max-w-xs">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <input
                                type="text"
                                value={filters[f.key] ?? ''}
                                onChange={e => setFilter(f.key, e.target.value)}
                                placeholder={`Search ${config.label.toLowerCase()}…`}
                                className={`
                  w-full pl-8 pr-8 py-1.5 rounded-lg
                  bg-white border border-brain-line
                  font-body text-[13px] text-text placeholder:text-muted2
                  outline-none ring-2 ring-transparent transition-all
                  ${glow}
                `}
                            />
                            {filters[f.key] && (
                                <button onClick={() => setFilter(f.key, '')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    )
                }

                if (f.type === 'select' && f.options) {
                    return (
                        <select
                            key={f.key}
                            value={filters[f.key] ?? ''}
                            onChange={e => setFilter(f.key, e.target.value)}
                            className={`
                px-3 py-1.5 rounded-lg border border-brain-line bg-white
                font-mono text-[11px] text-text outline-none
                ring-2 ring-transparent transition-all ${glow}
              `}
                        >
                            <option value="">{f.label}: All</option>
                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    )
                }

                if (f.type === 'toggle' && f.options) {
                    return (
                        <div key={f.key} className="flex items-center gap-1 bg-white border border-brain-line rounded-lg p-1">
                            <span className="font-mono text-[10px] text-muted px-1">{f.label}:</span>
                            {f.options.map(o => (
                                <button
                                    key={o}
                                    onClick={() => setFilter(f.key, o)}
                                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all ${filters[f.key] === o ? active : 'text-muted hover:text-text'
                                        }`}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                    )
                }

                return null
            })}

            {/* Active filter count + clear */}
            {Object.keys(filters).filter(k => k !== 'q').length > 0 && (
                <button
                    onClick={() => setFilters({})}
                    className="ml-auto font-mono text-[10px] text-muted hover:text-text flex items-center gap-1 transition-colors"
                >
                    <X size={11} /> Clear filters
                </button>
            )}
        </div>
    )
}
