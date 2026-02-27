// ── FILE: components/config/MissionClock.tsx ──
'use client';
import type { IUser } from '@/lib/types';

interface Props {
    user: IUser;
    onUpdate: (patch: { startDate: string }) => Promise<void>;
}

function dayN(startDate: Date): number {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
}

export default function MissionClock({ user, onUpdate }: Props) {
    const start = new Date(user.startDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const currentDay = dayN(start);
    const remaining = Math.max(0, 180 - currentDay + 1);

    return (
        <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-5 mb-4">
            <div className="font-mono text-[9px] text-muted2 tracking-[3px] uppercase mb-4">Mission Clock</div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                    <div className="font-mono text-[9px] text-muted2 uppercase tracking-[2px] mb-1">START DATE</div>
                    <div className="font-bebas text-[22px] text-text leading-none">{startStr}</div>
                </div>
                <div>
                    <div className="font-mono text-[9px] text-muted2 uppercase tracking-[2px] mb-1">CURRENT DAY</div>
                    <div className="font-bebas text-[22px] text-accent leading-none">DAY {currentDay} / 180</div>
                </div>
                <div>
                    <div className="font-mono text-[9px] text-muted2 uppercase tracking-[2px] mb-1">REMAINING</div>
                    <div className="font-bebas text-[22px] text-acid leading-none">{remaining}</div>
                </div>
            </div>

            {/* Date input */}
            <div>
                <label className="font-mono text-[10px] text-muted2 uppercase tracking-[2px] block mb-1.5">
                    Change Start Date
                </label>
                <input
                    type="date"
                    defaultValue={start.toISOString().split('T')[0]}
                    onChange={e => onUpdate({ startDate: e.target.value })}
                    className="bg-surface2 border border-[rgba(255,255,255,0.055)] rounded-lg px-3 py-2 font-mono text-[12px] text-text focus:outline-none focus:border-accent/50 transition-colors"
                />
                <div className="font-mono text-[9px] text-warning mt-2">
                    ⚠ Recalculates your Day N. All logged data preserved.
                </div>
            </div>
        </div>
    );
}
