// ── FILE: app/log/page.tsx ──
'use client';
import { useLog, type LogType } from '@/hooks/useLog';
import LogInput from '@/components/log/LogInput';
import LogEntry from '@/components/log/LogEntry';
import { Filter } from 'lucide-react';

const FILTER_OPTS: { value: LogType | 'all'; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'win', label: '🏆 WIN' },
    { value: 'skip', label: '⏭ SKIP' },
    { value: 'key', label: '💡 KEY' },
    { value: 'block', label: '🚧 BLOCK' },
];

export default function LogPage() {
    const { records, loading, error, filter, setFilter, addLog } = useLog();

    return (
        <div className="max-w-[700px] mx-auto px-4 pb-8 pt-6 content-z">
            <div className="flex items-baseline gap-3 mb-6">
                <div className="font-bebas text-[36px] tracking-wide">OPERATIONAL LOG</div>
                <div className="font-mono text-[10px] text-muted2 tracking-[2px]">{records.length} ENTRIES</div>
            </div>

            {/* Input */}
            <LogInput onAdd={addLog} />

            {/* Filter row */}
            <div className="flex items-center gap-2 mb-4">
                <Filter size={12} className="text-muted2" />
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {FILTER_OPTS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={`px-2.5 py-1 font-mono text-[9px] rounded tracking-wider whitespace-nowrap transition-all ${filter === opt.value ? 'bg-accent text-white' : 'bg-surface2 text-muted2 border border-[rgba(255,255,255,0.055)] hover:text-text'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log feed */}
            <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center font-mono text-[11px] text-muted2 animate-pulse">Loading log entries...</div>
                ) : error ? (
                    <div className="p-8 text-center font-mono text-[11px] text-danger">{error}</div>
                ) : records.length === 0 ? (
                    <div className="p-8 text-center font-mono text-[11px] text-muted2 italic">
                        {filter === 'all' ? 'No logs yet. Start typing above.' : `No ${filter} entries found.`}
                    </div>
                ) : (
                    records.map(r => <LogEntry key={r._id} record={r} />)
                )}
            </div>
        </div>
    );
}
