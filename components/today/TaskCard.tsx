export default function TaskCard({ title, subtitle, badge, badgeColor, dotColor, children }: any) {
    const colorMap: Record<string, string> = {
        accent: 'bg-accent',
        danger: 'bg-danger',
        info: 'bg-info',
        success: 'bg-success',
        warning: 'bg-warning'
    };
    const dotClass = colorMap[dotColor] || 'bg-text';

    return (
        <div className="mb-6 relative">
            <div className="flex items-end justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                    <h3 className="text-text text-sm font-mono uppercase tracking-wide">{title}</h3>
                </div>
                {badge && <div className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase text-black ${badgeColor}`}>{badge}</div>}
            </div>
            {subtitle && <div className="text-muted2 text-xs font-mono uppercase mb-3 ml-4">{subtitle}</div>}
            <div className="bg-surface border border-border rounded-lg overflow-hidden ml-4">
                {children}
            </div>
        </div>
    );
}
