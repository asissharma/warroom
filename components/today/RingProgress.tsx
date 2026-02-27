export default function RingProgress({ completed, total }: { completed: number, total: number }) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius; // 138.23
    const strokeDashoffset = circumference - (completed / total) * circumference;
    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r={radius} className="stroke-border fill-transparent" strokeWidth="4" />
                <circle cx="32" cy="32" r={radius} className="stroke-acid fill-transparent" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className="absolute text-text text-xs font-mono">{Math.round((completed / total) * 100)}%</div>
        </div>
    );
}
