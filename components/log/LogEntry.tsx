// ── FILE: components/log/LogEntry.tsx ──
import type { LogRecord } from '@/hooks/useLog';

interface Props {
    record: LogRecord;
}

const TYPE_CONFIG: Record<string, { emoji: string; borderColor: string; badgeClass: string }> = {
    win: { emoji: '🏆', borderColor: '#00e5a0', badgeClass: 'bg-success/20 text-success' },
    skip: { emoji: '⏭', borderColor: '#3d3d55', badgeClass: 'bg-muted/20 text-muted2' },
    key: { emoji: '💡', borderColor: '#7c5cfc', badgeClass: 'bg-accent/20 text-accent' },
    block: { emoji: '🚧', borderColor: '#ff3b4e', badgeClass: 'bg-danger/20 text-danger' },
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.round(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
}

export default function LogEntry({ record }: Props) {
    const cfg = TYPE_CONFIG[record.type] ?? TYPE_CONFIG.key;

    return (
        <div
            className="flex gap-3 p-3 border-b border-[rgba(255,255,255,0.055)] last:border-b-0 animate-in slide-in-from-top-2 fade-in duration-200"
            style={{ borderLeftWidth: '3px', borderLeftColor: cfg.borderColor }}
        >
            {/* Icon */}
            <span className="text-[18px] shrink-0 leading-none mt-0.5">{cfg.emoji}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="font-body text-[13px] text-text leading-relaxed">{record.text}</div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider ${cfg.badgeClass}`}>
                        {record.type}
                    </span>
                    <span className="font-mono text-[9px] text-muted2">{timeAgo(record.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}
