import { Flame } from 'lucide-react'

export default function ProgressView({ stats }: { stats: any }) {
    if (!stats) return null
    return (
        <div className="space-y-4">
            <div className="bg-surface border border-borderHi rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
                <Flame className="w-8 h-8 text-orange-500" />
                <div className="text-4xl font-black">{stats.currentStreak}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted">Current Streak</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                    <div className="text-2xl font-black text-text mb-1">{stats.daysCompleted}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Days Executed</div>
                </div>
                <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                    <div className="text-2xl font-black text-text mb-1">{stats.totalTasksDone}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Tasks Cleared</div>
                </div>
                <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                    <div className="text-2xl font-black text-text mb-1">{stats.longestStreak}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Longest Streak</div>
                </div>
                <div className="bg-surface border border-borderLo rounded-2xl p-5 text-center">
                    <div className="text-2xl font-black text-text mb-1 text-accent">{stats.phaseProgress?.phaseName || 'Unknown'}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Current Phase</div>
                </div>
            </div>

            {/* Digest sections to be added later */}
        </div>
    )
}
