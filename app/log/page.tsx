'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import LogEntry from '@/components/LogEntry';

export default function Log() {
    const records = useStore(s => s.records);
    const addRecord = useStore(s => s.addRecord);
    const [text, setText] = useState('');
    const [type, setType] = useState<'win' | 'skip' | 'key' | 'block'>('key');

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;
        addRecord({ id: Date.now().toString(), text, type, date: new Date().toLocaleString() });
        setText('');
    }

    return (
        <div className="max-w-[680px] mx-auto px-4 pb-16 h-[calc(100vh-80px)] flex flex-col">
            <h1 className="font-display text-3xl tracking-wide mb-6 shrink-0">OPERATIONAL LOG</h1>

            <form onSubmit={submit} className="bg-surface border border-border p-3 rounded-xl mb-6 flex flex-col sm:flex-row gap-3 shrink-0 focus-within:border-accent/50 transition-colors">
                <div className="flex space-x-2">
                    {['key', 'win', 'block', 'skip'].map(t => (
                        <button key={t} type="button" onClick={() => setType(t as any)}
                            className={`text-[10px] font-mono uppercase px-2 py-1 rounded border transition-colors ${type === t ? 'border-accent text-accent bg-accent/10' : 'border-transparent text-muted2 hover:bg-s2'}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex-1 flex space-x-2">
                    <input
                        type="text" value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="Log an observation, win, or blocker..."
                        className="flex-1 bg-transparent border-none text-[13px] font-body text-text focus:outline-none placeholder:text-muted"
                    />
                    <button type="submit" className="bg-text text-bg hover:bg-white text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors font-bold tracking-wide">
                        LOG
                    </button>
                </div>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-surface border border-border rounded-xl">
                {records.length === 0 ? (
                    <div className="p-8 text-center text-[13px] text-muted2 font-mono italic">No logs found. Start typing above.</div>
                ) : (
                    records.map(r => <LogEntry key={r.id} record={r} />)
                )}
            </div>
        </div>
    )
}
