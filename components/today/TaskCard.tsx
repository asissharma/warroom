export default function TaskCard({ title, subtitle, badge, badgeColor, dotColor, compact, children }: any) {
    const colorMap: Record<string, string> = {
        accent: 'bg-accent',
        danger: 'bg-danger',
        info: 'bg-info',
        success: 'bg-success',
        warning: 'bg-warning'
    };
    const dotClass = colorMap[dotColor] || 'bg-text';

    return (
        <div className={compact ? 'relative shrink-0' : 'mb-6 relative'}>
            <div className={`flex items-center justify-between ${compact ? 'mb-1.5' : 'mb-2'}`}>
                <div className="flex items-center gap-2">
                    <div className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ${dotClass}`} />
                    <h3 className={`text-text font-mono uppercase tracking-wide ${compact ? 'text-[10px]' : 'text-sm'}`}>{title}</h3>
                    {subtitle && <span className="text-muted2 font-mono text-[9px] uppercase hidden sm:block truncate max-w-[120px]">{subtitle}</span>}
                </div>
                {badge && <div className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase text-black ${badgeColor}`}>{badge}</div>}
            </div>
            <div className={`bg-surface border border-border rounded-lg overflow-hidden shadow-sm ${compact ? '' : 'ml-4'}`}>
                {children}
            </div>
        </div>
    );
}
