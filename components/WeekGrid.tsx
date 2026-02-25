'use client';
import { useStore } from '@/lib/store';

export default function WeekGrid() {
    const doneDays = useStore(s => s.doneDays);
    const dStrings = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay() - 1; // Simplistic

    return (
        <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-border mt-4">
            {dStrings.map((d, i) => {
                const isToday = i === (today < 0 ? 6 : today);
                // fake done state for visual
                const isDone = Math.random() > 0.6;

                return (
                    <div key={i} className={`flex flex-col items-center justify-center w-8 h-10 rounded border ${isToday ? 'border-accent bg-accent/10' : 'border-border bg-s2'} ${isDone && !isToday ? 'border-success bg-success/10 text-success' : 'text-muted2'}`}>
                        <span className="font-mono text-[10px] mb-1">{d}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-success' : isToday ? 'bg-accent' : 'bg-transparent'}`} />
                    </div>
                )
            })}
        </div>
    )
}
