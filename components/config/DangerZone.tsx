// ── FILE: components/config/DangerZone.tsx ──
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    carryForwardCount: number;
    onClearCarry: () => Promise<void>;
    onReset: () => Promise<void>;
}

export default function DangerZone({ carryForwardCount, onClearCarry, onReset }: Props) {
    const [resetInput, setResetInput] = useState('');
    const [clearLoading, setClearLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const router = useRouter();

    const handleClear = async () => {
        if (!carryForwardCount) return;
        setClearLoading(true);
        await onClearCarry();
        setClearLoading(false);
    };

    const handleReset = async () => {
        if (resetInput !== 'RESET') return;
        setResetLoading(true);
        await onReset();
        router.push('/today');
        router.refresh();
    };

    return (
        <div className="glass-panel border-danger/30 p-6">
            <div className="font-mono text-[9px] text-danger tracking-[3px] uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse-dot" />
                DANGER ZONE
            </div>

            {/* Clear carry-forwards */}
            <div className="mb-6 pb-6 border-b border-[rgba(255,255,255,0.055)]">
                <div className="font-body font-semibold text-[14px] text-text mb-1">CLEAR CARRY-FORWARDS</div>
                <div className="font-mono text-[11px] text-muted2 mb-3">
                    Remove the {carryForwardCount} task{carryForwardCount !== 1 ? 's' : ''} currently being carried. Cannot be undone.
                </div>
                <button
                    onClick={handleClear}
                    disabled={!carryForwardCount || clearLoading}
                    className="font-mono text-[10px] tracking-wider px-4 py-2 rounded border border-danger/40 text-danger hover:bg-danger/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {clearLoading ? 'CLEARING...' : `CLEAR ${carryForwardCount} TASK${carryForwardCount !== 1 ? 'S' : ''}`}
                </button>
            </div>

            {/* Reset all progress */}
            <div>
                <div className="font-body font-semibold text-[14px] text-text mb-1">RESET ALL PROGRESS</div>
                <div className="font-mono text-[11px] text-muted2 mb-3">
                    Deletes all records. Start date preserved.
                </div>
                <div className="flex gap-2">
                    <input
                        value={resetInput}
                        onChange={e => setResetInput(e.target.value)}
                        placeholder="Type RESET to confirm"
                        className="flex-1 bg-surface2 border border-[rgba(255,255,255,0.055)] rounded-lg px-3 py-2 font-mono text-[11px] text-text placeholder:text-muted focus:outline-none focus:border-danger/50 transition-colors"
                    />
                    <button
                        onClick={handleReset}
                        disabled={resetInput !== 'RESET' || resetLoading}
                        className="font-mono text-[10px] tracking-wider px-4 py-2 rounded bg-danger/20 text-danger hover:bg-danger/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {resetLoading ? 'RESETTING...' : "RESET — I'M SURE"}
                    </button>
                </div>
            </div>
        </div>
    );
}
