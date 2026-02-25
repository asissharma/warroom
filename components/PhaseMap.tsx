'use client';
import type { Project } from '@/lib/types';

export default function PhaseMap({ projects }: { projects: Project[] }) {
    // Aggregate projects by phase roughly
    const phases = ['Foundation', 'Distributed', 'Cloud', 'Security', 'ML/AI', 'Advanced Frontend', 'Final Polish', 'Integration'];

    return (
        <div className="flex flex-col space-y-2 mt-4">
            {phases.map((p, i) => {
                // Just mock visual state for now
                const state = i === 0 ? 'ACTIVE' : i < 0 ? 'DONE' : 'LOCKED';
                const color = state === 'ACTIVE' ? 'border-accent text-accent' : state === 'DONE' ? 'border-success text-success' : 'border-border text-muted';

                return (
                    <div key={p} className={`border p-3 rounded-lg flex justify-between items-center ${color}`}>
                        <div className="flex flex-col">
                            <span className="font-display text-[16px] tracking-wider mb-1">{p}</span>
                            <span className="font-mono text-[9px] opacity-70">PHASE 0{i + 1}</span>
                        </div>
                        <div className={`text-[9px] font-mono px-2 py-0.5 rounded border ${color}`}>
                            {state}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
