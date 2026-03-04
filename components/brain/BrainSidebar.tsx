'use client'
// components/brain/BrainSidebar.tsx
// Dark sidebar — each database card is its own vivid identity.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { COLLECTION_ORDER, COLLECTIONS, CollectionKey } from '@/lib/brain/collections'

const COLOR_MAP: Record<CollectionKey, { bg: string; text: string; dot: string; border: string }> = {
    questions: {
        bg: 'bg-q-muted/10 hover:bg-q-muted/20 group-hover:bg-q-muted/20',
        text: 'text-q-glow',
        dot: 'bg-q-base',
        border: 'border-l-q-base',
    },
    projects: {
        bg: 'bg-p-muted/10 hover:bg-p-muted/20',
        text: 'text-p-glow',
        dot: 'bg-p-base',
        border: 'border-l-p-base',
    },
    syllabus: {
        bg: 'bg-s-muted/10 hover:bg-s-muted/20',
        text: 'text-s-glow',
        dot: 'bg-s-base',
        border: 'border-l-s-base',
    },
    skills: {
        bg: 'bg-sk-muted/10 hover:bg-sk-muted/20',
        text: 'text-sk-glow',
        dot: 'bg-sk-base',
        border: 'border-l-sk-base',
    },
    spine: {
        bg: 'bg-sp-muted/10 hover:bg-sp-muted/20',
        text: 'text-sp-glow',
        dot: 'bg-sp-base',
        border: 'border-l-sp-base',
    },
    courses: {
        bg: 'bg-c-muted/10 hover:bg-c-muted/20',
        text: 'text-c-glow',
        dot: 'bg-c-base',
        border: 'border-l-c-base',
    },
    survival: {
        bg: 'bg-sv-muted/10 hover:bg-sv-muted/20',
        text: 'text-sv-glow',
        dot: 'bg-sv-base',
        border: 'border-l-sv-base',
    },
}

interface Props { counts?: Record<string, number> }

export default function BrainSidebar({ counts = {} }: Props) {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 h-full bg-brain-void border-r border-brain-border flex-shrink-0">
            {/* Header */}
            <div className="px-4 pt-6 pb-4 border-b border-brain-border">
                <Link href="/brain" className="block">
                    <p className="font-bebas text-white text-2xl tracking-widest leading-none">BRAIN</p>
                    <p className="font-mono text-[9px] text-white/30 tracking-[2px] mt-0.5">KNOWLEDGE WORKSPACE</p>
                </Link>
            </div>

            {/* Collection list */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                <p className="font-mono text-[8px] text-white/25 tracking-[3px] px-2 pt-2 pb-2 uppercase">
                    Databases
                </p>

                {COLLECTION_ORDER.map(key => {
                    const cfg = COLLECTIONS[key]
                    const colors = COLOR_MAP[key]
                    const isActive = pathname.startsWith(`/brain/${key}`)
                    const count = counts[key] ?? 0

                    return (
                        <Link
                            key={key}
                            href={`/brain/${key}`}
                            className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                border-l-2 ${isActive ? colors.border : 'border-l-transparent'}
                ${isActive ? colors.bg : 'hover:bg-white/5'}
              `}
                        >
                            {/* Color dot */}
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? colors.dot : 'bg-white/20'} transition-colors`} />

                            {/* Label */}
                            <span className={`font-mono text-[11px] tracking-wider flex-1 ${isActive ? colors.text : 'text-white/50 group-hover:text-white/80'} transition-colors`}>
                                {cfg.label.toUpperCase()}
                            </span>

                            {/* Count badge */}
                            <span className={`font-mono text-[9px] ${isActive ? colors.text : 'text-white/25 group-hover:text-white/40'} transition-colors`}>
                                {count.toLocaleString()}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer — back to cockpit */}
            <div className="px-3 pb-4 border-t border-brain-border pt-3">
                <Link
                    href="/today"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all font-mono text-[10px] tracking-wider"
                >
                    <span>←</span>
                    <span>BACK TO COCKPIT</span>
                </Link>
            </div>
        </aside>
    )
}
