export default function Heatmap({ cells }: { cells: any[] }) {
    return (
        <div className="flex flex-wrap gap-1">
            {cells.map((c, i) => (
                <div
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 a-transition rounded-[2px] ${c.isComplete ? 'bg-success hover:bg-success/80' : 'bg-surface2 hover:bg-surface2/80'}`}
                    title={`Day ${c.dayN}: ${c.isComplete ? 'Complete' : 'Incomplete'}`}
                />
            ))}
        </div>
    );
}
