'use client';

import { useState, useEffect, useRef } from 'react';
import { useDay } from '@/hooks/useDay';
import { Loader2, Send } from 'lucide-react';

export function QuickCapture() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: dayData } = useDay();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setStatus('idle');
                if (!isOpen) {
                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || status === 'loading') return;

        setStatus('loading');
        try {
            const res = await fetch('/api/intel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'insight',
                    title: input.trim(),
                    source: 'quick-capture',
                    dayN: dayData?.dayN || 0,
                    phase: dayData?.phase || 'Unknown'
                })
            });

            if (!res.ok) throw new Error('Failed to log insight');

            setStatus('success');
            setInput('');
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
            }, 1000);
        } catch (err) {
            console.error('Quick capture error:', err);
            setStatus('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[560px] z-[9999] px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-surface2/90 backdrop-blur-xl border-2 border-accent/20 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={status === 'success' ? '✓ Logged to Brain' : 'What did you just learn or realize?'}
                        className={`flex-1 bg-transparent border-none focus:ring-0 text-text placeholder:text-muted/50 text-base py-1 ${status === 'success' ? 'text-success font-bold' : ''}`}
                        disabled={status === 'loading' || status === 'success'}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || status === 'loading' || status === 'success'}
                        className={`p-2 rounded-lg transition-colors ${
                            status === 'success' 
                                ? 'bg-success/20 text-success' 
                                : status === 'loading'
                                    ? 'bg-accent/10 text-accent/50 cursor-not-allowed'
                                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                        }`}
                    >
                        {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : status === 'success' ? (
                            <Send className="w-5 h-5 opacity-0" /> // Hidden during success text
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
            <div className="mt-2 text-center">
                <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-mono">Press ESC to dismiss</span>
            </div>
        </div>
    );
}
