'use client';
import { useStore } from '@/lib/store';
import type { SkillBars } from '@/lib/types';

export default function SkillBar({ label, barKey, color }: { label: string, barKey: keyof SkillBars, color: string }) {
    const val = useStore(s => s.bars[barKey]);
    const lvl = useStore(s => s.lvls[barKey]);
    const bump = useStore(s => s.bumpSkill);

    return (
        <div className="mb-4 cursor-pointer group" onClick={() => bump(barKey, 5)}>
            <div className="flex justify-between items-end mb-1 font-mono text-[10px]">
                <div className="text-text group-hover:text-white transition-colors uppercase tracking-wider">{label}</div>
                <div className="text-muted2">LVL <span className="text-text font-bold">{lvl}</span> <span className="opacity-50 mx-1">·</span> {val}%</div>
            </div>
            <div className="h-[5px] w-full bg-s2 rounded-full overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-300`} style={{ width: `${val}%` }} />
            </div>
        </div>
    )
}
