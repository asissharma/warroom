'use client';

import { useIntelClusters } from '@/hooks/useIntelClusters';
import { Target, Loader2, ArrowRight } from 'lucide-react';

export function IntelClusters() {
    const { tags, clusters, isLoading, error } = useIntelClusters(20);

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
                <p className="text-sm font-bold">Failed to load clusters</p>
                <p className="text-xs mt-1 text-red-500/70">{error}</p>
            </div>
        )
    }

    if (tags.length === 0) {
        return (
            <div className="py-12 text-center text-muted border border-borderLo border-dashed rounded-2xl bg-surface2/20">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No clusters recorded yet.</p>
                <p className="text-xs mt-1">Nodes are currently unlinked visually. Complete tasks to auto-generate tags.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 relative mt-6 max-w-2xl mx-auto">
            {tags.map((tagObj) => {
                const nodes = clusters[tagObj.tag] || [];
                if (nodes.length === 0) return null;

                return (
                    <div key={tagObj.tag} className="border border-borderHi rounded-2xl p-5 bg-surface shadow-sm relative overflow-hidden group">
                        {/* subtle bg accent on hover */}
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg flex items-center gap-2 font-bold uppercase tracking-widest text-text">
                                <span className="text-accent">#</span>{tagObj.tag}
                            </h3>
                            <div className="text-xs font-mono bg-borderLo text-muted2 px-2 py-1 rounded-md">
                                {tagObj.count} NODES
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {nodes.slice(0, 5).map(node => (
                                <div key={node._id as any} className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg hover:bg-surface2 transition-colors cursor-default">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                        node.type === 'concept' ? 'bg-green-400' :
                                        node.type === 'task' ? 'bg-orange-400' :
                                        node.type === 'build' ? 'bg-blue-400' :
                                        node.type === 'log' ? 'bg-yellow-400' :
                                        node.type === 'insight' ? 'bg-cyan-400' : 'bg-gray-400'
                                    }`} />
                                    <span className="flex-1 truncate text-muted2 hover:text-text a-transition">
                                        {node.title}
                                    </span>
                                    <span className="shrink-0 text-[10px] font-mono opacity-50 uppercase tracking-wider hidden sm:block">
                                        {node.type}
                                    </span>
                                </div>
                            ))}
                            {nodes.length > 5 && (
                                <div className="text-xs text-accent text-center mt-2 flex items-center justify-center gap-1 opacity-70 cursor-pointer hover:opacity-100 a-transition">
                                    View {nodes.length - 5} more <ArrowRight className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
