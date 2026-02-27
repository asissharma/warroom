// ── FILE: components/learn/BriefingCard.tsx ──
'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import type { SurvivalArea } from '@/lib/types';

interface Props {
    area: SurvivalArea;
}

const urgencyStyle: Record<string, { pill: string; label: string }> = {
    CRITICAL: { pill: 'bg-danger/20 text-danger', label: 'CRITICAL' },
    HIGH: { pill: 'bg-warning/20 text-warning', label: 'HIGH' },
    MEDIUM: { pill: 'bg-info/20 text-info', label: 'MEDIUM' },
};

export default function BriefingCard({ area }: Props) {
    const [open, setOpen] = useState(false);
    const urgency = urgencyStyle[area.urgency] ?? urgencyStyle.MEDIUM;

    const [studiedTopics, setStudiedTopics] = useState<boolean[]>([]);

    useEffect(() => {
        if (!area.topics) return;
        const loaded = area.topics.map((_, i) =>
            localStorage.getItem(`intel_topic_studied_${area.id}_${i}`) === 'true'
        );
        setStudiedTopics(loaded);
    }, [area]);

    const toggleTopic = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const next = [...studiedTopics];
        next[index] = !next[index];
        setStudiedTopics(next);
        localStorage.setItem(`intel_topic_studied_${area.id}_${index}`, next[index].toString());
    };

    const studiedCount = studiedTopics.filter(Boolean).length;
    const totalTopics = area.topics?.length || 0;
    const isBriefed = totalTopics > 0 && studiedCount === totalTopics;

    // Normalise resources — the JSON has just strings, not objects
    const resources = area.resources?.map((r: unknown) =>
        typeof r === 'string' ? { name: r, url: null, free: true } : r as { name: string; url: string | null; free: boolean }
    ) ?? [];

    return (
        <div className={`bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg overflow-hidden mb-3 transition-all ${open ? 'border-borderHi' : ''}`}>
            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
            >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded shrink-0 mt-0.5 ${urgency.pill}`}>
                        {urgency.label}
                    </span>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-body font-semibold text-[15px] text-text">{area.area}</span>
                            {isBriefed ? (
                                <span className="font-mono text-[9px] bg-success/10 text-success px-1.5 py-0.5 rounded tracking-wider border border-success/20">✓ BRIEFED</span>
                            ) : (
                                totalTopics > 0 && <span className="font-mono text-[9px] text-muted2">{studiedCount}/{totalTopics} studied</span>
                            )}
                        </div>
                        <div className="font-body text-[12px] text-muted2 mt-0.5 leading-relaxed">{area.why}</div>
                    </div>
                </div>
                <ChevronRight
                    size={16}
                    className="text-muted2 shrink-0 mt-0.5 ml-2 transition-transform duration-200"
                    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
            </button>

            {/* Body */}
            <div
                style={{
                    maxHeight: open ? '800px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out',
                }}
            >
                <div className="px-4 pb-4 space-y-4">
                    {/* Topics */}
                    {area.topics?.length > 0 && (
                        <div>
                            <div className="font-mono text-[9px] text-muted2 tracking-[2px] uppercase mb-2">TOPICS</div>
                            <div className="space-y-1">
                                {area.topics.map((t, i) => {
                                    const isDone = studiedTopics[i];
                                    return (
                                        <div key={i} className="flex items-start gap-2 group/topic cursor-pointer p-1 -mx-1 hover:bg-white/5 rounded transition-colors" onClick={(e) => toggleTopic(e, i)}>
                                            <div
                                                className={`shrink-0 mt-1 w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center transition-colors ${isDone ? 'bg-success border-success' : 'border-muted2 bg-transparent'}`}
                                            >
                                                {isDone && <Check className="w-3 h-3 text-black stroke-[3]" />}
                                            </div>
                                            <span className={`font-mono text-[12px] flex-1 ${isDone ? 'text-text/30 line-through transition-all' : 'text-text/80'}`}>{t}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    {resources.length > 0 && (
                        <div>
                            <div className="font-mono text-[9px] text-muted2 tracking-[2px] uppercase mb-2">RESOURCES</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {resources.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                                            style={{ backgroundColor: r.free ? '#00e5a0' : '#3d3d55' }}
                                        />
                                        {r.url ? (
                                            <a
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-[11px] text-info hover:text-info/80 transition-colors"
                                            >
                                                {r.name}
                                            </a>
                                        ) : (
                                            <span className="font-mono text-[11px] text-text/80">{r.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spine connection */}
                    {area.spineConnection && (
                        <div className="font-mono text-[10px] text-muted2 border-t border-[rgba(255,255,255,0.055)] pt-3">
                            CONNECTS TO: {area.spineConnection}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
