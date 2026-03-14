'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Send, Loader2, Link as LinkIcon, Briefcase, Star, Search, Plus } from 'lucide-react';

export function IntelManualInput() {
    const { mutate } = useSWRConfig();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [type, setType] = useState<'concept' | 'insight' | 'resource' | 'custom'>('concept');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const res = await fetch('/api/intel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    body,
                    url: url || undefined,
                    tags: tagsArray,
                    type,
                    domain: 'manual'
                })
            });

            if (!res.ok) throw new Error('Failed to create Intel entry');

            // Reset form
            setTitle('');
            setBody('');
            setUrl('');
            setTagsInput('');
            setType('concept');

            // Revalidate Intel feed caches
            mutate(
                key => typeof key === 'string' && key.startsWith('/api/intel'),
                undefined,
                { revalidate: true }
            );

            // Optional: Show success toast here

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-6 bg-surface border border-borderHi rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-text">Add to Intel</h2>
                <p className="text-xs text-muted">Input a new concept, insight, resource, or freeform node into the universal database.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Intel Type Selector */}
                <div className="flex flex-wrap gap-2">
                    {['concept', 'insight', 'resource', 'custom'].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t as any)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border a-transition ${
                                type === t 
                                    ? t === 'concept' ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : t === 'insight' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                    : t === 'resource' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                    : 'bg-text/10 border-text/30 text-text'
                                : 'bg-surface2 border-borderLo text-muted hover:border-borderHi hover:text-text'
                            }`}
                        >
                            {t === 'concept' && <Briefcase className="w-3.5 h-3.5" />}
                            {t === 'insight' && <Star className="w-3.5 h-3.5" />}
                            {t === 'resource' && <LinkIcon className="w-3.5 h-3.5" />}
                            {t === 'custom' && <Search className="w-3.5 h-3.5" />}
                            {t}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted2 ml-1">Title</label>
                    <input
                        required value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Marwari Mandis Supply Chain Analysis"
                        className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted2 ml-1">Body (Markdown)</label>
                    <textarea
                        value={body} onChange={e => setBody(e.target.value)}
                        placeholder="Capture the core insight, mental models, or takeaways..."
                        rows={5}
                        className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-y"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="space-y-1 flex-[2]">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted2 ml-1">Tags (Comma Separated)</label>
                        <input
                            value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                            placeholder="business, supply-chain, india"
                            className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="space-y-1 flex-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted2 ml-1">URL (Optional)</label>
                        <input
                            type="url" value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-surface2 border border-borderLo rounded-xl p-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 mt-2 border-t border-borderLo flex justify-end">
                    <button
                        type="submit" disabled={submitting || !title.trim()}
                        className="flex items-center justify-center gap-2 bg-text text-bg px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm disabled:opacity-50 hover:scale-[1.02] a-transition"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Node</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
