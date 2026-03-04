'use client'
// components/brain/CommandPalette.tsx
// ⌘K global search across all 7 collections. In-memory, instant, no API needed.

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ChevronRight } from 'lucide-react'
import { COLLECTION_ORDER, COLLECTIONS, CollectionKey } from '@/lib/brain/collections'

interface SearchResult {
    collection: CollectionKey
    id: string
    label: string
    sublabel?: string
}

// Preloaded data (fetched once, searched client-side)
let preloadedData: Record<CollectionKey, Array<{ _id: string;[k: string]: any }>> | null = null

async function loadAllData() {
    if (preloadedData) return preloadedData
    const result: any = {}
    await Promise.all(
        COLLECTION_ORDER.map(async key => {
            const r = await fetch(`/api/brain/${key}?limit=2000`)
            const j = await r.json()
            result[key] = j.rows ?? []
        })
    )
    preloadedData = result
    return preloadedData!
}

function searchAll(query: string, data: typeof preloadedData): SearchResult[] {
    if (!data || query.length < 2) return []
    const q = query.toLowerCase()
    const results: SearchResult[] = []

    for (const key of COLLECTION_ORDER) {
        const cfg = COLLECTIONS[key]
        const rows = data[key] ?? []
        for (const row of rows) {
            const title = String(row[cfg.titleField] ?? '')
            const sub = cfg.subtitleField ? String(row[cfg.subtitleField] ?? '') : ''
            if (title.toLowerCase().includes(q) || sub.toLowerCase().includes(q)) {
                results.push({ collection: key, id: row._id, label: title, sublabel: sub })
                if (results.length >= 30) break
            }
        }
        if (results.length >= 30) break
    }
    return results
}

const EMOJI_MAP: Record<CollectionKey, string> = {
    questions: '⚡', projects: '🔨', syllabus: '📘',
    skills: '🧠', spine: '🔗', courses: '🎓', survival: '🛡',
}

interface Props { open: boolean; onClose: () => void }

export default function CommandPalette({ open, onClose }: Props) {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [cursor, setCursor] = useState(0)
    const [loading, setLoading] = useState(false)

    // Load data on first open
    useEffect(() => {
        if (open) {
            setLoading(true)
            loadAllData().then(data => {
                setLoading(false)
                // Trigger initial search if query exists
                if (query) setResults(searchAll(query, data))
            })
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            setQuery('')
            setResults([])
            setCursor(0)
        }
    }, [open])

    const handleQuery = useCallback((q: string) => {
        setQuery(q)
        if (!preloadedData) return
        setResults(searchAll(q, preloadedData))
        setCursor(0)
    }, [])

    const navigate = useCallback((r: SearchResult) => {
        router.push(`/brain/${r.collection}/${r.id}`)
        onClose()
    }, [router, onClose])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return }
            if (e.key === 'ArrowDown') { setCursor(c => Math.min(c + 1, results.length - 1)); e.preventDefault() }
            if (e.key === 'ArrowUp') { setCursor(c => Math.max(c - 1, 0)); e.preventDefault() }
            if (e.key === 'Enter' && results[cursor]) { navigate(results[cursor]) }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, results, cursor, navigate, onClose])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brain-void/70 backdrop-blur-sm" />

            {/* Palette */}
            <div
                className="relative w-full max-w-xl bg-brain-card rounded-2xl shadow-2xl overflow-hidden animate-palette-in border border-brain-border/20"
                onClick={e => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 border-b border-brain-line">
                    <Search size={16} className="text-muted flex-shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => handleQuery(e.target.value)}
                        placeholder="Search questions, projects, skills, courses…"
                        className="flex-1 py-4 font-body text-[14px] text-text placeholder:text-muted2 outline-none bg-transparent"
                    />
                    {loading && (
                        <div className="w-4 h-4 border-2 border-brain-line border-t-sp-glow rounded-full animate-spin" />
                    )}
                    <button onClick={onClose} className="text-muted hover:text-text">
                        <X size={14} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[380px] overflow-y-auto">
                    {query.length < 2 ? (
                        <div className="px-4 py-6">
                            <p className="font-mono text-[10px] text-muted2 tracking-[2px] mb-3">JUMP TO</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {COLLECTION_ORDER.map(key => {
                                    const cfg = COLLECTIONS[key]
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => { router.push(`/brain/${key}`); onClose() }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brain-canvas text-left transition-colors"
                                        >
                                            <span className="text-base">{cfg.emoji}</span>
                                            <span className="font-mono text-[11px] text-text">{cfg.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="font-mono text-[11px] text-muted">No results for "{query}"</p>
                        </div>
                    ) : results.map((r, i) => (
                        <button
                            key={`${r.collection}-${r.id}`}
                            onClick={() => navigate(r)}
                            onMouseEnter={() => setCursor(i)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === cursor ? 'bg-brain-canvas' : 'hover:bg-brain-canvas/50'
                                }`}
                        >
                            <span className="w-5 text-center text-sm">{EMOJI_MAP[r.collection]}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-body text-[13px] text-text truncate">{r.label}</p>
                                {r.sublabel && (
                                    <p className="font-mono text-[10px] text-muted truncate">{r.sublabel}</p>
                                )}
                            </div>
                            <ChevronRight size={13} className={`text-muted flex-shrink-0 ${i === cursor ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                    ))}
                </div>

                {/* Footer hint */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-brain-line">
                    <span className="font-mono text-[9px] text-muted2">↑↓ navigate</span>
                    <span className="font-mono text-[9px] text-muted2">↵ open</span>
                    <span className="font-mono text-[9px] text-muted2">esc close</span>
                </div>
            </div>
        </div>
    )
}
