'use client'
// components/brain/BlockEditor.tsx
// A lightweight block-based editor. Supports Text, Todos, Code, Headings, and Dividers.
// Includes a slash menu (/) and auto-save.

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckSquare, Square, GripVertical, Type, Code, Hash, Minus } from 'lucide-react'

export interface IBlock {
    id: string
    type: 'text' | 'code' | 'todo' | 'h1' | 'h2' | 'h3' | 'divider'
    content: string
    checked?: boolean
    language?: string
}

interface Props {
    collection: string
    id: string
    color: string // Tailwind text color class, e.g. text-q-base
}

// ── COMMAND MENU COMPONENT ──────────────────────────────────────────────────
function SlashMenu({ onSelect, close }: { onSelect: (type: IBlock['type']) => void; close: () => void }) {
    const items: Array<{ label: string; type: IBlock['type']; icon: React.ReactNode }> = [
        { label: 'Text', type: 'text', icon: <Type size={12} /> },
        { label: 'To-do List', type: 'todo', icon: <CheckSquare size={12} /> },
        { label: 'Heading 1', type: 'h1', icon: <Hash size={12} /> },
        { label: 'Heading 2', type: 'h2', icon: <Hash size={12} /> },
        { label: 'Heading 3', type: 'h3', icon: <Hash size={12} /> },
        { label: 'Code Block', type: 'code', icon: <Code size={12} /> },
        { label: 'Divider', type: 'divider', icon: <Minus size={12} /> },
    ]

    return (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-brain-line rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-fade-in origin-top-left">
            <p className="px-3 py-1 font-mono text-[9px] text-muted tracking-wider uppercase mb-1">Turn into...</p>
            {items.map(it => (
                <button
                    key={it.type}
                    onClick={() => onSelect(it.type)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface2 transition-colors"
                >
                    <span className="text-muted">{it.icon}</span>
                    <span className="font-body text-[13px] text-text">{it.label}</span>
                </button>
            ))}
        </div>
    )
}

// ── MAIN EDITOR ─────────────────────────────────────────────────────────────
export default function BlockEditor({ collection, id, color }: Props) {
    const [blocks, setBlocks] = useState<IBlock[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeBlock, setActiveBlock] = useState<string | null>(null)
    const [showSlash, setShowSlash] = useState<string | null>(null) // Which block ID is showing the slash menu

    const saveTimeout = useRef<NodeJS.Timeout | null>(null)

    // Track refs for focusing
    const refs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

    // Auto-resize textareas
    const adjustHeight = (el: HTMLTextAreaElement | null) => {
        if (!el) return
        el.style.height = 'auto'
        el.style.height = el.scrollHeight + 'px'
    }

    // Initialize API
    useEffect(() => {
        fetch(`/api/brain/${collection}/${id}/notes`)
            .then(r => r.json())
            .then(data => {
                const initial = data.blocks?.length > 0 ? data.blocks : [{ id: crypto.randomUUID(), type: 'text', content: '' }]
                setBlocks(initial)
                setLoading(false)
                // Adjust height of all on mount
                setTimeout(() => Object.values(refs.current).forEach(adjustHeight), 50)
            })
            .catch(() => setLoading(false))
    }, [collection, id])

    // Auto-save
    const triggerSave = useCallback((newBlocks: IBlock[]) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        setSaving(true)
        saveTimeout.current = setTimeout(async () => {
            await fetch(`/api/brain/${collection}/${id}/notes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks: newBlocks })
            })
            setSaving(false)
        }, 800)
    }, [collection, id])

    const updateBlocks = (updater: (prev: IBlock[]) => IBlock[]) => {
        setBlocks(prev => {
            const next = updater(prev)
            triggerSave(next)
            return next
        })
    }

    const handleChange = (blockId: string, val: string) => {
        updateBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content: val } : b))
        if (val === '/') setShowSlash(blockId)
        else if (showSlash === blockId) setShowSlash(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, blockId: string) => {
        const b = blocks[index]

        // Handle Slash command
        if (showSlash === blockId) {
            if (e.key === 'Escape') {
                setShowSlash(null)
                e.preventDefault()
                return
            }
        }

        // Enter: Add new block below (unless Shift+Enter)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            // If slash menu is open, don't hijack enter
            if (showSlash === blockId) return

            const newId = crypto.randomUUID()
            updateBlocks(prev => {
                const arr = [...prev]
                arr.splice(index + 1, 0, { id: newId, type: 'text', content: '' })
                return arr
            })
            setTimeout(() => refs.current[newId]?.focus(), 10)
        }

        // Backspace: Delete block if empty
        if (e.key === 'Backspace' && b.content === '') {
            e.preventDefault()
            setShowSlash(null)
            if (index > 0) {
                updateBlocks(prev => prev.filter(b => b.id !== blockId))
                const prevId = blocks[index - 1].id
                setTimeout(() => {
                    const el = refs.current[prevId]
                    if (el) { el.focus(); el.selectionStart = el.value.length; el.selectionEnd = el.value.length }
                }, 10)
            }
        }

        // Up arrow: focus previous
        if (e.key === 'ArrowUp' && index > 0) {
            const el = e.currentTarget
            // Only move if cursor is at start of line
            if (el.selectionStart === 0) {
                e.preventDefault()
                refs.current[blocks[index - 1].id]?.focus()
            }
        }

        // Down arrow: focus next
        if (e.key === 'ArrowDown' && index < blocks.length - 1) {
            const el = e.currentTarget
            if (el.selectionStart === el.value.length) {
                e.preventDefault()
                refs.current[blocks[index + 1].id]?.focus()
            }
        }
    }

    const turnInto = (blockId: string, type: IBlock['type']) => {
        updateBlocks(prev => prev.map(b => b.id === blockId ? { ...b, type, content: '' } : b))
        setShowSlash(null)
        setTimeout(() => {
            const el = refs.current[blockId]
            if (el) { el.focus(); adjustHeight(el) }
        }, 10)
    }

    const setChecked = (blockId: string, checked: boolean) => {
        updateBlocks(prev => prev.map(b => b.id === blockId ? { ...b, checked } : b))
    }

    if (loading) {
        return (
            <div className="py-12 flex justify-center">
                <div className={`w-5 h-5 border-2 border-brain-line rounded-full animate-spin border-t-current ${color}`} />
            </div>
        )
    }

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <span className="font-bebas text-xl text-text tracking-wider">NOTES / BLOCKS</span>
                <span className={`font-mono text-[9px] tracking-[2px] ${saving ? 'opacity-50' : 'opacity-100'} transition-opacity ${color}`}>
                    {saving ? 'SAVING...' : 'SAVED'}
                </span>
            </div>

            <div className="space-y-1">
                {blocks.map((block, index) => {
                    // Type-specific styles
                    let inputClass = "w-full outline-none bg-transparent resize-none font-body text-text placeholder:text-muted2/50"
                    if (block.type === 'h1') inputClass += " text-3xl font-semibold leading-tight my-4"
                    else if (block.type === 'h2') inputClass += " text-2xl font-semibold leading-snug mt-4 mb-2"
                    else if (block.type === 'h3') inputClass += " text-xl font-medium leading-relaxed mt-2"
                    else if (block.type === 'code') inputClass += " font-mono text-sm bg-surface2 p-3 rounded-lg border border-brain-line"
                    else if (block.type === 'todo') inputClass += ` text-[14px] leading-relaxed ${block.checked ? 'line-through text-muted' : ''}`
                    else if (block.type === 'divider') inputClass += " hidden" // Divider handled custom
                    else inputClass += " text-[15px] leading-relaxed"

                    return (
                        <div
                            key={block.id}
                            className="relative group flex items-start gap-2 -ml-6 pl-6 pr-4 hover:bg-white/40 rounded transition-colors"
                            onMouseEnter={() => setActiveBlock(block.id)}
                            onMouseLeave={() => setActiveBlock(null)}
                        >
                            {/* Drag Handle Dummy */}
                            <div className={`mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted2 cursor-grab absolute left-1`}>
                                <GripVertical size={14} />
                            </div>

                            {/* Todo Checkbox */}
                            {block.type === 'todo' && (
                                <button
                                    onClick={() => setChecked(block.id, !block.checked)}
                                    className={`mt-1.5 text-muted hover:${color} transition-colors mr-1`}
                                >
                                    {block.checked ? <CheckSquare size={16} /> : <Square size={16} />}
                                </button>
                            )}

                            {/* Main Input / Content */}
                            <div className="flex-1 relative">
                                {block.type === 'divider' ? (
                                    <div className="w-full h-px bg-brain-line my-4 relative">
                                        <button onClick={() => turnInto(block.id, 'text')} className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded text-[8px] font-mono text-muted opacity-0 group-hover:opacity-100">x</button>
                                    </div>
                                ) : (
                                    <textarea
                                        ref={el => { refs.current[block.id] = el }}
                                        value={block.content}
                                        onChange={e => {
                                            handleChange(block.id, e.target.value)
                                            adjustHeight(e.target)
                                        }}
                                        onKeyDown={e => handleKeyDown(e, index, block.id)}
                                        placeholder={block.type === 'text' ? "Type '/' for commands" : `Type ${block.type}...`}
                                        className={inputClass}
                                        rows={1}
                                        spellCheck={false}
                                    />
                                )}

                                {/* Slash Menu Overlay */}
                                {showSlash === block.id && (
                                    <SlashMenu onSelect={(t) => turnInto(block.id, t)} close={() => setShowSlash(null)} />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Empty state click-catcher */}
            {blocks.length === 0 && (
                <button
                    onClick={() => {
                        const newId = crypto.randomUUID()
                        updateBlocks(() => [{ id: newId, type: 'text', content: '' }])
                        setTimeout(() => refs.current[newId]?.focus(), 10)
                    }}
                    className="mt-4 font-mono text-[11px] text-muted hover:text-text transition-colors"
                >
                    + Add Block
                </button>
            )}
        </div>
    )
}
