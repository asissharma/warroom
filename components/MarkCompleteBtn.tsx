'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function MarkCompleteBtn({ dayN }: { dayN: number }) {
    const [done, setDone] = useState(false);
    const mark = useStore(s => s.markDayDone);
    const add = useStore(s => s.addRecord);
    const streak = useStore(s => s.streak);

    const click = () => {
        if (done) return;
        const today = new Date().toISOString().split('T')[0];
        mark(today);
        add({ id: Date.now().toString(), text: `Day ${dayN} complete ✓ — streak: ${streak + 1}`, type: 'win', date: new Date().toLocaleString() });
        setDone(true);
    }

    if (done) {
        return (
            <button className="w-full mt-4 p-3 rounded-lg bg-success text-[#07070a] font-display text-lg tracking-wide flex justify-center items-center pointer-events-none">
                ✓ DAY {dayN} COMPLETE · STREAK: {streak + 1}
            </button>
        )
    }

    return (
        <button onClick={click} className="w-full mt-4 p-3 rounded-lg border border-border bg-s2 hover:bg-white/5 text-text font-display text-lg tracking-wide transition-colors">
            MARK DAY {dayN} COMPLETE
        </button>
    )
}
