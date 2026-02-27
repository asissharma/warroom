export default function VelocityWidget({ dailyData, avgTasksPerDay }: { dailyData: any[], avgTasksPerDay: number }) {
    return (
        <div className="flex items-center gap-6">
            <div className="flex-1 flex items-end gap-2 h-20">
                {dailyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <div
                            className={`w-full rounded-[2px] a-transition ${d.isToday ? 'bg-acid' : 'bg-surface2'}`}
                            style={{ height: `${Math.max(10, (d.taskCount / 10) * 100)}%` }}
                        />
                        <div className="font-mono text-[9px] text-muted2">{d.date.slice(-5)}</div>
                    </div>
                ))}
            </div>
            <div className="min-w-[80px] text-right border-l border-[rgba(255,255,255,0.055)] pl-6">
                <div className="font-bebas text-[42px] text-text leading-none mb-1">{avgTasksPerDay}</div>
                <div className="font-mono text-[9px] text-muted2 uppercase tracking-[1px]">Avg / Day</div>
            </div>
        </div>
    );
}
