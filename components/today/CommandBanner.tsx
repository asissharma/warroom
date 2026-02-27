export default function CommandBanner({ project, dayN, phase }: { project: any, dayN: number, phase: string }) {
    return (
        <div className="bg-surface border border-border p-4 rounded-lg mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-text max-w-[200px] text-lg font-mono tracking-tight uppercase">Day {dayN}</h2>
                <div className="text-muted2 text-xs uppercase tracking-wider">{phase}</div>
            </div>
            {project && (
                <div className="text-right">
                    <div className="text-acid text-xs uppercase font-mono">Active Project</div>
                    <div className="text-text font-body text-sm truncate">{project.name}</div>
                </div>
            )}
        </div>
    );
}
