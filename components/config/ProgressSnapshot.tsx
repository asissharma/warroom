// ── FILE: components/config/ProgressSnapshot.tsx ──
'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';

interface Stat {
    label: string;
    value: string | number;
    color?: string;
}

interface Props {
    stats: Stat[];
}

const COLOR_MAP: Record<string, string> = {
    accent: '#7c5cfc',
    success: '#00e5a0',
    acid: '#c8ff00',
    warning: '#ff8c00',
};

export default function ProgressSnapshot({ stats }: Props) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `intel-os-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // silently fail
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-[9px] text-muted2 tracking-[3px] uppercase">Progress Snapshot</div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-1.5 font-mono text-[9px] text-muted2 hover:text-text border border-[rgba(255,255,255,0.055)] hover:border-borderHi px-2.5 py-1 rounded transition-all disabled:opacity-50"
                >
                    <Download size={11} />
                    {exporting ? 'EXPORTING...' : 'EXPORT DATA'}
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface2 rounded-lg p-3">
                        <div
                            className="font-bebas text-[28px] leading-none mb-0.5"
                            style={{ color: COLOR_MAP[stat.color ?? ''] ?? '#eeeef5' }}
                        >
                            {stat.value}
                        </div>
                        <div className="font-mono text-[9px] text-muted2 uppercase tracking-[1px]">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
