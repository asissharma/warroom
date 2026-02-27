import { getPhaseForDay, getProjectForDay } from '@/lib/dayEngine';

export default function Heatmap({ cells }: { cells: any[] }) {
    return (
        <div className="flex flex-wrap gap-1">
            {cells.map((c, i) => {
                const phase = getPhaseForDay(c.dayN);
                const project = getProjectForDay(c.dayN);
                return (
                    <div
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 a-transition rounded-[2px] relative group cursor-help ${c.isComplete ? 'bg-success hover:bg-success/80 shadow-[0_0_5px_rgba(0,255,100,0.2)]' : 'bg-surface2 hover:bg-surface2/80'}`}
                    >
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-s2 border border-border text-text text-[10px] font-mono p-2 rounded pointer-events-none z-50 bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-2xl block w-max hidden lg:block">
                            <span className="text-acid">Day {c.dayN}</span> · {c.date} · {phase}
                            {project && ` · ${project.name}`} · {c.taskCount} tasks
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
