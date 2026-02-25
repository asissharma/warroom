'use client';

export default function RingProgress({ completed, total }: { completed: number, total: number }) {
    const pct = Math.round((completed / total) * 100) || 0;
    const c = 138.2;
    const offset = c - (pct / 100) * c;

    return (
        <div className="relative w-[58px] h-[58px] flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 58 58">
                <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c5cfc" />
                        <stop offset="100%" stopColor="#c8ff00" />
                    </linearGradient>
                </defs>
                <circle cx="29" cy="29" r="22" className="stroke-border" strokeWidth="4" fill="none" />
                <circle cx="29" cy="29" r="22" stroke="url(#ringGrad)" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-500 ease-out" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display text-[13px] text-text">
                {pct}%
            </div>
        </div>
    )
}
