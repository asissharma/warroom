'use client';
import { useStore } from '@/lib/store';

export default function MarkCompleteButton({ dayN }: { dayN: number }) {
    const markDayDone = useStore(s => s.markDayDone);

    const toggleDone = () => {
        markDayDone(new Date().toISOString().split('T')[0]);
    };

    return (
        <button
            onClick={toggleDone}
            className="w-full py-2 bg-acid text-black font-mono text-xs uppercase tracking-widest rounded hover:bg-acid/90 transition-colors"
        >
            Mark Day {dayN} Complete
        </button>
    );
}
