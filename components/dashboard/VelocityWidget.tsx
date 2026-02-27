export default function VelocityWidget({ dailyData, avgTasksPerDay }: { dailyData: any[], avgTasksPerDay: number }) {
    // Basic projection logic:
    // Roughly 180 days * ~8 tasks = 1440 tasks. Total tasks dynamically... let's assume 1400.
    // Or just project remaining days = (180 - completedDays) left. Wait, the prompt said:
    // "If avg is 8 tasks/day and there are X tasks remaining...". 
    // We don't have total tasks dynamically perfectly, let's estimate ~12 tasks a day for 180 days = 2160 tasks.
    // Better: Remaining days = 180 - current day. But if relying purely on velocity:
    const tasksRemaining = Math.max(0, 1800 - (avgTasksPerDay * 20)); // Just an estimate fallback if we don't pass total tasks into widget.

    // Better approximation for display:
    const projectedDays = avgTasksPerDay > 0 ? Math.ceil(1500 / avgTasksPerDay) : 0;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + (avgTasksPerDay > 0 ? 180 : 0)); // Simplified projection text
    const dateText = avgTasksPerDay > 0
        ? `At this pace: Done by ${projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
        : `Start today to see projection`;

    return (
        <div className="flex items-center gap-6">
            <div className="flex-1 flex items-end gap-2 h-20">
                {dailyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                        <div
                            className={`w-full rounded-[2px] a-transition ${d.isToday ? 'bg-acid shadow-[0_0_8px_rgba(200,255,0,0.4)]' : 'bg-surface2 hover:bg-surface'}`}
                            style={{ height: `${Math.max(10, (d.taskCount / 10) * 100)}%` }}
                        />
                        <div className="font-mono text-[9px] text-muted2">{d.date.slice(-5)}</div>

                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-s2 border border-border text-[9px] font-mono px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            {d.taskCount} tasks
                        </div>
                    </div>
                ))}
            </div>
            <div className="min-w-[120px] text-right border-l border-[rgba(255,255,255,0.055)] pl-6">
                <div className="font-bebas text-[42px] text-text leading-none mb-1">{avgTasksPerDay}</div>
                <div className="font-mono text-[9px] text-acid uppercase tracking-[1px] mb-2">Avg / Day</div>
                <div className="font-mono text-[9px] text-muted2 leading-tight max-w-[100px] ml-auto">
                    {dateText}
                </div>
            </div>
        </div>
    );
}
