'use client';
import type { LogRecord } from '@/lib/types'

export default function LogEntry({ record }: { record: LogRecord }) {
    const colors = {
        win: 'text-success bg-success/10 border-success/20',
        skip: 'text-warning bg-warning/10 border-warning/20',
        key: 'text-accent bg-accent/10 border-accent/20',
        block: 'text-danger bg-danger/10 border-danger/20'
    }

    return (
        <div className="p-3 border-b border-border/40 hover:bg-white/[0.01]">
            <div className="flex justify-between items-start mb-1">
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${colors[record.type]}`}>{record.type}</span>
                <span className="text-[10px] font-mono text-muted2">{record.date}</span>
            </div>
            <div className="text-[13px] font-body text-text/90 mt-2">{record.text}</div>
        </div>
    )
}
