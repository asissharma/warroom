export default function CommandBanner({ project, dayN, phase }: { project: any, dayN: number, phase: string }) {
    return (
        <div className="bg-gradient-to-r from-acid/10 to-accent/10 border border-border border-l-[3px] border-l-acid p-3 rounded-lg relative overflow-hidden">
            {/* 2px top gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-acid to-accent"></div>

            <div className="flex justify-between items-center relative z-10">
                <div>
                    <h2 className="text-acid text-lg font-mono tracking-tight uppercase">▶ MISSION — DAY {dayN}</h2>
                    <div className="text-muted2 text-xs uppercase tracking-wider">{phase}</div>
                </div>
                {project && (
                    <div className="text-right">
                        <div className="text-text/70 text-xs uppercase font-mono">ACTIVE PROJECT</div>
                        <div className="text-text font-bebas text-2xl truncate mt-1">{project.name}</div>
                        {project.doneMeans && (
                            <div className="text-muted2 text-[10px] font-mono mt-1">DONE: {project.doneMeans}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
