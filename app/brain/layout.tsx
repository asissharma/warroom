'use client'
// app/brain/layout.tsx
// Brain workspace root layout: dark sidebar + light canvas + command palette.

import { useState, useEffect } from 'react'
import BrainSidebar from '@/components/brain/BrainSidebar'
import CommandPalette from '@/components/brain/CommandPalette'

interface Props { children: React.ReactNode }

export default function BrainLayout({ children }: Props) {
    const [paletteOpen, setPaletteOpen] = useState(false)
    const [counts, setCounts] = useState<Record<string, number>>({})

    // Fetch collection counts for sidebar badges
    useEffect(() => {
        fetch('/api/brain/collections')
            .then(r => r.json())
            .then((data: any[]) => {
                const map: Record<string, number> = {}
                data.forEach(d => { map[d.key] = d.count })
                setCounts(map)
            })
            .catch(() => { })
    }, [])

    // Global ⌘K / Ctrl+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setPaletteOpen(p => !p)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    return (
        <div className="flex h-screen bg-brain-void overflow-hidden">
            {/* Dark sidebar */}
            <BrainSidebar counts={counts} />

            {/* Main content — ice white canvas */}
            <div className="flex flex-col flex-1 overflow-hidden bg-brain-canvas">
                {/* Top bar */}
                <header className="flex items-center justify-between px-4 h-12 border-b border-brain-line bg-brain-canvas flex-shrink-0">
                    {/* Mobile sidebar label */}
                    <span className="lg:hidden font-bebas text-text text-xl tracking-widest">BRAIN</span>

                    {/* ⌘K trigger */}
                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brain-line bg-white text-muted hover:text-text hover:border-borderHi transition-all ml-auto"
                    >
                        <span className="font-mono text-[11px]">Search everything…</span>
                        <kbd className="font-mono text-[9px] bg-surface2 px-1 py-0.5 rounded text-muted2">⌘K</kbd>
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>

            {/* Command palette overlay */}
            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </div>
    )
}
