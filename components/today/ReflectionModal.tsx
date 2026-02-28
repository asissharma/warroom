// ── FILE: components/today/ReflectionModal.tsx ──
'use client';
import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

export default function ReflectionModal({
    dayN,
    onClose,
    onComplete
}: {
    dayN: number,
    onClose: () => void,
    onComplete: () => void
}) {
    const [buildText, setBuildText] = useState('');
    const [hardText, setHardText] = useState('');
    const [clickText, setClickText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!buildText.trim() || !hardText.trim()) return;
        setSubmitting(true);
        try {
            const logs = [
                { type: 'key', text: `Built: ${buildText}` },
                { type: 'block', text: `Hardest part: ${hardText}` },
            ];
            if (clickText.trim()) {
                logs.push({ type: 'win', text: `Clicked: ${clickText}` });
            }

            for (const log of logs) {
                await fetch('/api/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dayN, text: log.text, type: log.type })
                });
            }
            setSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 2500);
        } catch (e) {
            console.error(e);
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-body">
            <div className="bg-surface border border-border w-full max-w-lg rounded-xl p-6 relative overflow-hidden shadow-2xl">
                {!success && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-muted2 hover:text-text transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}

                {success ? (
                    <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 stroke-[3]" />
                        </div>
                        <h2 className="text-3xl font-bebas tracking-wide mb-2 text-text">DAY {dayN} SECURED</h2>
                        <p className="text-acid font-mono text-xs uppercase tracking-widest mt-4 animate-pulse">Logs committed to system</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <h2 className="text-acid font-mono tracking-tight uppercase text-lg mb-1 shadow-acid">Close The Loop</h2>
                            <p className="text-muted2 text-xs font-mono uppercase">Reflect on Day {dayN} execution</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-muted2 mb-2">What did you actually build today? <span className="text-danger">*</span></label>
                                <textarea
                                    className="w-full bg-s2 border border-border rounded p-3 text-sm font-body text-text focus:border-acid focus:outline-none transition-colors resize-none h-20"
                                    value={buildText}
                                    onChange={e => setBuildText(e.target.value)}
                                    placeholder="e.g., Integrated the notification service with Redis..."
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-muted2 mb-2">One thing that was harder than expected: <span className="text-danger">*</span></label>
                                <textarea
                                    className="w-full bg-s2 border border-border rounded p-3 text-sm font-body text-text focus:border-acid focus:outline-none transition-colors resize-none h-20"
                                    value={hardText}
                                    onChange={e => setHardText(e.target.value)}
                                    placeholder="e.g., Understanding the exact signature of the payload..."
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-muted2 mb-2">One thing that clicked: <span className="text-muted2 ml-1 opacity-50">(optional)</span></label>
                                <textarea
                                    className="w-full bg-s2 border border-border rounded p-3 text-sm font-body text-text focus:border-acid focus:outline-none transition-colors resize-none h-20"
                                    value={clickText}
                                    onChange={e => setClickText(e.target.value)}
                                    placeholder="e.g., Decorators finally make sense as higher-order functions..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!buildText.trim() || !hardText.trim() || submitting}
                            className="w-full py-3 bg-acid text-black font-mono text-sm uppercase tracking-widest rounded hover:bg-acid/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : 'CLOSE THE DAY →'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
