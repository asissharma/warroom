// ── FILE: components/log/LogInput.tsx ──
'use client';
import { useState } from 'react';
import type { LogType } from '@/hooks/useLog';

interface Props {
    onAdd: (text: string, type: LogType) => Promise<void>;
}

const TYPE_CONFIG: { type: LogType; emoji: string; label: string; activeColor: string }[] = [
    { type: 'win', emoji: '🏆', label: 'WIN', activeColor: 'bg-success/20 border-success text-success' },
    { type: 'skip', emoji: '⏭', label: 'SKIP', activeColor: 'bg-muted/20 border-muted text-muted2' },
    { type: 'key', emoji: '💡', label: 'KEY', activeColor: 'bg-accent/20 border-accent text-accent' },
    { type: 'block', emoji: '🚧', label: 'BLOCK', activeColor: 'bg-danger/20 border-danger text-danger' },
];

export default function LogInput({ onAdd }: Props) {
    const [text, setText] = useState('');
    const [type, setType] = useState<LogType>('key');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!text.trim() || loading) return;
        setLoading(true);
        await onAdd(text.trim(), type);
        setText('');
        setLoading(false);
    };

    return (
        <div className="bg-surface2 border border-[rgba(255,255,255,0.055)] rounded-lg p-3 mb-4 focus-within:border-accent/40 transition-colors">
            {/* Text input */}
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Log a win, skip, insight, or blocker..."
                className="w-full bg-transparent font-mono text-[12px] text-text placeholder:text-muted focus:outline-none mb-3"
            />

            {/* Type pills + LOG button */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 flex-wrap">
                    {TYPE_CONFIG.map(tc => (
                        <button
                            key={tc.type}
                            onClick={() => setType(tc.type)}
                            className={`px-2.5 py-1 font-mono text-[9px] rounded border transition-all tracking-wider ${type === tc.type ? tc.activeColor : 'border-[rgba(255,255,255,0.055)] text-muted2 hover:text-text'}`}
                        >
                            {tc.emoji} {tc.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={submit}
                    disabled={!text.trim() || loading}
                    className="bg-accent hover:bg-accent/90 text-white font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {loading ? '...' : 'LOG'}
                </button>
            </div>
        </div>
    );
}
