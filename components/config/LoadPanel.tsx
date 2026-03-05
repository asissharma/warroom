// ── FILE: components/config/LoadPanel.tsx ──
'use client';

interface Props {
    questionsPerDay: 8 | 9;
    onUpdate: (qpd: 8 | 9) => Promise<void>;
}

export default function LoadPanel({ questionsPerDay, onUpdate }: Props) {
    return (
        <div className="glass-panel p-6 mb-5">
            <div className="font-mono text-[9px] text-muted2 tracking-[3px] uppercase mb-1">Daily Question Load</div>
            <div className="font-body text-[12px] text-muted2 mb-4">Choose your mastery gate intensity.</div>

            <div className="flex gap-3">
                {([8, 9] as const).map(n => (
                    <button
                        key={n}
                        onClick={() => onUpdate(n)}
                        className={`flex-1 py-3 rounded-xl font-bebas text-[20px] tracking-wider a-transition ${questionsPerDay === n ? 'bg-accent/20 text-accent border border-accent/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'border border-borderLo text-muted2 hover:text-text hover:border-borderHi'}`}
                    >
                        {n} QUESTIONS
                    </button>
                ))}
            </div>

            <div className="font-mono text-[9px] text-muted2 mt-3">
                Takes effect from tomorrow&apos;s session.
            </div>
        </div>
    );
}
