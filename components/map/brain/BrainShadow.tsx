import { Activity, Sparkles, Loader2 } from 'lucide-react'

export default function BrainShadow({ shadow }: { shadow?: any }) {
    if (!shadow) {
        return (
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50" />
                <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-1">Shadow Analysis Pending</h3>
                        <p className="text-xs text-accent/70 max-w-[200px] mx-auto leading-relaxed">Intelligence engine requires more entries to synthesize a profile.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50" />

            <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between border-b border-accent/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Shadow Insight
                    </h3>
                    <div className="text-[10px] font-mono text-accent/50 uppercase tracking-widest flex items-center gap-1.5 border border-accent/10 px-2 py-0.5 rounded-full bg-accent/5">
                        <Activity className="w-3 h-3" /> Synthesized
                    </div>
                </div>

                <div>
                    <p className="text-sm leading-relaxed text-text font-medium">{shadow.rawSummary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-success/70 mb-2">Grasped</div>
                        <ul className="space-y-1.5 flex flex-col">
                            {shadow.keyConcepts?.map((c: string, i: number) => (
                                <li key={i} className="text-xs text-text/80 flex items-start gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-success/50 before:mt-1.5 before:shrink-0">{c}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 mb-2">Fragile</div>
                        <ul className="space-y-1.5 flex flex-col">
                            {shadow.weakSpots?.map((w: string, i: number) => (
                                <li key={i} className="text-xs text-red-300/80 flex items-start gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-red-500/50 before:mt-1.5 before:shrink-0">{w}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
