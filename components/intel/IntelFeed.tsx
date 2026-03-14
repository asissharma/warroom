'use client';

import { useIntelFeed } from '@/hooks/useIntelFeed';
import { Target, Loader2, BookOpen, Layers, Star, Plus, CheckCircle, Flame, Shield, Briefcase, Zap } from 'lucide-react';

export function IntelFeed() {
    const { feed, isLoading, error } = useIntelFeed({ limit: 50 });

    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'task': return <CheckCircle className="w-4 h-4 text-orange-400" />
            case 'build': return <Layers className="w-4 h-4 text-blue-400" />
            case 'question': return <BookOpen className="w-4 h-4 text-purple-400" />
            case 'skill': return <Zap className="w-4 h-4 text-white" />
            case 'survival': return <Shield className="w-4 h-4 text-red-500" />
            case 'log': return <Flame className="w-4 h-4 text-yellow-400" />
            case 'concept': return <Briefcase className="w-4 h-4 text-green-400" />
            case 'insight': return <Star className="w-4 h-4 text-cyan-400" />
            default: return <Target className="w-4 h-4 text-gray-400" />
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-12 px-6 text-center text-red-500 border border-red-500/20 border-dashed rounded-2xl bg-red-500/5">
                <p className="text-sm font-bold">Failed to load feed</p>
                <p className="text-xs mt-1 text-red-500/70">{error}</p>
            </div>
        )
    }

    if (feed.length === 0) {
        return (
            <div className="py-12 text-center text-muted border border-borderLo border-dashed rounded-2xl bg-surface2/20">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No intel recorded yet.</p>
                <p className="text-xs mt-1">Universal intelligence is empty. Complete a task or log something.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 relative mt-6">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-borderLo/50 hidden sm:block pointer-events-none" />

            {feed.map((node) => (
                <div key={node._id as any} className="relative flex gap-4 w-full group">
                    <div className="hidden sm:flex mt-4 w-12 shrink-0 items-start justify-center relative z-10">
                        <div className="flex items-center justify-center bg-surface border border-borderHi rounded-full p-2 ring-4 ring-bg group-hover:border-accent/40 a-transition">
                            {getIconForType(node.type)}
                        </div>
                    </div>

                    <div className="flex-1 bg-surface border border-borderHi hover:border-accent/30 rounded-2xl p-4 sm:p-5 shadow-sm a-transition group-hover:shadow-md">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-borderLo bg-surface2 text-muted">
                                        {node.type}
                                    </span>
                                    {node.dayN && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-accent/20 bg-accent/5 text-accent">
                                            Day {node.dayN}
                                        </span>
                                    )}
                                    {node.domain && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-purple-500/20 bg-purple-500/5 text-purple-400">
                                            {node.domain}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-text leading-tight">{node.title}</h3>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-xs font-mono text-muted2">{new Date(node.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {node.body && (
                            <div className="text-sm mt-3 pt-3 border-t border-borderLo/50">
                                <p className="text-muted leading-relaxed whitespace-pre-wrap">{node.body}</p>
                            </div>
                        )}

                        {node.tags && node.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {node.tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-mono text-muted2 bg-bg px-1.5 py-0.5 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {node.connections && node.connections.length > 0 && (
                             <div className="mt-3 text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                                 <Plus className="w-3 h-3 text-accent" /> {node.connections.length} Connections
                             </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
