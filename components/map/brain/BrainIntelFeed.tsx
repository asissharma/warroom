import { Target, AlignLeft, AlertTriangle } from 'lucide-react'

export default function BrainIntelFeed({ intelFeed }: { intelFeed?: any[] }) {
    if (!intelFeed || intelFeed.length === 0) {
        return (
            <div className="p-6 text-center text-muted border border-borderLo border-dashed rounded-2xl bg-surface2/20">
                <Target className="w-6 h-6 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No intel logs for this topic.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Raw Intel Logs
            </h3>

            <div className="space-y-4">
                {intelFeed.map((entry: any) => (
                    <div key={entry._id} className="bg-surface border border-borderLo rounded-xl p-4 shadow-sm a-transition hover:border-accent/30">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-sm font-bold text-text leading-tight">{entry.title}</h4>
                            <div className="text-[10px] font-mono text-muted shrink-0 text-right">
                                <div>D{entry.dayN}</div>
                                <div>{entry.timeSpentMins}m</div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-3 pt-3 border-t border-borderLo/50 text-xs">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted2 mb-1">Learned</div>
                                <p className="text-muted leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">{entry.what}</p>
                            </div>

                            {entry.blockers && (
                                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Blocker</div>
                                    <p className="text-red-400 leading-relaxed">{entry.blockers}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
