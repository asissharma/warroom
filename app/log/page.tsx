// ── FILE: app/log/page.tsx ──
'use client';
import { useState, useMemo } from 'react';
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
    const [search, setSearch] = useState('');

    const stats = useMemo(() => ({
        total: records.length,
        wins: records.filter(r => r.type === 'win').length,
        keys: records.filter(r => r.type === 'key').length,
    }), [records]);

    const finalRecords = useMemo(() => {
        return records.filter(r => {
            if (filter !== 'all' && r.type !== filter) return false;
            if (search && !r.text.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [records, filter, search]);

    const grouped = useMemo(() => {
        return finalRecords.reduce((acc, r) => {
            const day = r.dayN || 0;
            if (!acc[day]) acc[day] = [];
            acc[day].push(r);
            return acc;
        }, {} as Record<number, typeof records>);
    }, [finalRecords]);

    const sortedDays = useMemo(() => Object.keys(grouped).map(Number).sort((a, b) => b - a), [grouped]);

    return (
        <div className="max-w-[700px] mx-auto px-4 pb-8 pt-6 content-z">
            <div className="flex items-baseline gap-3 mb-6">
                <div className="font-bebas text-[36px] tracking-wide">OPERATIONAL LOG</div>
                <div className="font-mono text-[10px] text-muted2 tracking-[2px]">{records.length} ENTRIES</div>
            </div>

            {/* E4c Stats row */}
            <div className="flex gap-3 mb-6">
                <div className="bg-surface2 rounded px-3 py-2 flex-1 border border-[rgba(255,255,255,0.055)] text-center">
                    <div className="font-bebas text-xl text-text">{stats.total}</div>
                    <div className="font-mono text-[9px] text-muted2 uppercase tracking-wider">Total Logs</div>
                </div>
                <div className="bg-success/10 rounded px-3 py-2 flex-1 border border-success/20 text-center">
                    <div className="font-bebas text-xl text-success">{stats.wins}</div>
                    <div className="font-mono text-[9px] text-success/80 uppercase tracking-wider">Wins</div>
                </div>
                <div className="bg-accent/10 rounded px-3 py-2 flex-1 border border-accent/20 text-center">
                    <div className="font-bebas text-xl text-accent">{stats.keys}</div>
                    <div className="font-mono text-[9px] text-accent/80 uppercase tracking-wider">Key Insights</div>
                </div>
            </div>

            {/* Input */}
            <LogInput onAdd={addLog} />

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="bg-surface2 border border-[rgba(255,255,255,0.055)] rounded-lg px-3 py-2 font-mono text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-acid/50 transition-colors sm:w-64"
                />
                <div className="flex items-center gap-2">
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
            </div>

            {/* Log feed */}
            <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center font-mono text-[11px] text-muted2 animate-pulse">Loading log entries...</div>
                ) : error ? (
                    <div className="p-8 text-center font-mono text-[11px] text-danger">{error}</div>
                ) : finalRecords.length === 0 ? (
                    <div className="p-8 text-center font-mono text-[11px] text-muted2 italic">
                        {filter === 'all' && !search ? 'No logs yet. Start typing above.' : 'No entries found matching filters.'}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {sortedDays.map(day => (
                            <div key={day} className="border-b border-[rgba(255,255,255,0.055)] last:border-b-0">
                                <div className="bg-surface2 px-4 py-1.5 border-b border-[rgba(255,255,255,0.055)] flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-acid tracking-[2px] uppercase">
                                        Day {day === 0 ? '0 (INIT)' : day}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    {grouped[day].map(r => (
                                        <LogEntry key={r._id} record={r} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
