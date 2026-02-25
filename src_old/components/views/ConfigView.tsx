import { useState } from 'react';
import { AppState } from '@/hooks/useLearningOS';

interface Props {
    state: AppState;
    onSaveStart: (date: string) => void;
    onNuke: () => void;
}

export default function ConfigView({ state, onSaveStart, onNuke }: Props) {
    const [dateStr, setDateStr] = useState(state.start);

    return (
        <div className="p-6 animate-in fade-in duration-200 z-10 relative">
            <h2 className="mb-6 text-[1.5rem] font-sys font-bold">Configuration</h2>

            <label className="block text-[0.85rem] text-[var(--text-muted)] mb-2 font-semibold">
                Cohort Start Date (Day 1)
            </label>
            <input
                type="date"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="w-full p-3 border border-[var(--border-light)] rounded-lg font-mono bg-[var(--surface-alt)] mb-4 text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
            />

            <button
                onClick={() => onSaveStart(dateStr)}
                className="block w-full py-4 bg-[var(--accent-purple)] text-white font-sys font-bold rounded-[var(--radius-md)] border-none active:scale-[0.98] transition-transform"
            >
                Save Start Date
            </button>

            <div className="mt-12 pt-6 border-t border-dashed border-[var(--border-light)]">
                <label className="text-[#e74c3c] text-[0.85rem] font-bold mb-2 block">
                    DANGER ZONE
                </label>
                <p className="text-[var(--text-muted)] text-[0.85rem] mb-4">
                    Wiping state permanently destroys all active queues, stats, and history.
                </p>
                <button
                    onClick={onNuke}
                    className="block w-full py-4 bg-transparent text-[#e74c3c] border border-[#e74c3c] font-sys font-bold rounded-[var(--radius-md)] active:bg-[#e74c3c20] transition-colors"
                >
                    Nuke Local State
                </button>
            </div>
        </div>
    );
}
