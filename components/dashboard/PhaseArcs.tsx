'use client';
import { useState } from 'react';
import projectsData from '@/data/projects.json';
import { getDayN } from '@/lib/dayEngine';
import { useStore } from '@/lib/store';
import { Check } from 'lucide-react';

export default function PhaseArcs({ phases, heatmap = [] }: { phases: any[], heatmap?: any[] }) {
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const startDate = useStore(s => s.startDate);
    const currentDayN = getDayN(startDate ? new Date(startDate) : new Date());

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {phases.map((p, i) => (
                    <div
                        key={i}
                        onClick={() => setExpandedPhase(expandedPhase === p.phase ? null : p.phase)}
                        className={`bg-surface border transition-colors cursor-pointer rounded-lg p-4 ${expandedPhase === p.phase ? 'border-acid shadow-[0_0_15px_rgba(200,255,0,0.1)]' : 'border-[rgba(255,255,255,0.055)] hover:bg-s2'}`}
                    >
                        <div className="font-mono text-[10px] text-muted2 mb-2 uppercase tracking-wider">{p.phase}</div>
                        <div className="flex items-end gap-2">
                            <div className="font-bebas text-[28px] text-text leading-none">{p.daysCompleted}</div>
                            <div className="font-mono text-[10px] text-muted2 pb-[2px]">/ {p.totalDays}</div>
                        </div>
                        <div className="h-[3px] bg-surface2 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-accent a-transition" style={{ width: `${(p.daysCompleted / p.totalDays) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {expandedPhase && (
                <div className="bg-surface border border-border rounded-lg p-5 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bebas text-xl text-acid tracking-wide mb-4">{expandedPhase} PROJECTS</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {projectsData.filter((proj: any) => proj.phase === expandedPhase).map((proj: any) => {
                            const isCurrent = proj.day === currentDayN;
                            const hRecord = heatmap.find(h => h.dayN === proj.day);
                            const isCompleted = hRecord?.isComplete || proj.day < currentDayN;

                            return (
                                <div
                                    key={proj.day}
                                    className={`p-3 rounded border text-sm flex gap-3 ${isCurrent ? 'border-acid bg-acid/5' : isCompleted ? 'border-success/30 bg-success/5' : 'border-border bg-s2 opacity-60'}`}
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {isCompleted ? <Check className="w-4 h-4 text-success" /> : <div className="w-4 h-4 rounded-full border border-muted2" />}
                                    </div>
                                    <div>
                                        <div className={`font-mono text-[11px] mb-1 uppercase ${isCurrent ? 'text-acid' : isCompleted ? 'text-success' : 'text-muted2'}`}>Day {proj.day}</div>
                                        <div className={`font-body leading-tight ${isCurrent ? 'text-white' : 'text-text'}`}>{proj.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
