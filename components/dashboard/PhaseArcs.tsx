export default function PhaseArcs({ phases }: { phases: any[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {phases.map((p, i) => (
                <div key={i} className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-4">
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
    );
}
