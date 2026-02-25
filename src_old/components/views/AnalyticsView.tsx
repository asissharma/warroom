import { AppState } from '@/hooks/useLearningOS';
import { QUESTIONS, PROJECTS, TOPICS, BASIC_SKILLS } from '@/data/learningData';
import RadarChart from '../RadarChart';

interface Props { state: AppState; }

export default function AnalyticsView({ state }: Props) {
    const masterTotal = QUESTIONS.length + PROJECTS.length + TOPICS.length + BASIC_SKILLS.length;
    const pct = masterTotal === 0 ? 0 : Math.min(100, Math.round((state.stats.tasksDone / masterTotal) * 100));

    return (
        <div className="p-6 animate-in fade-in duration-200 z-10 relative">
            <div className="bg-[var(--surface-color)] border border-[var(--border-light)] rounded-[var(--radius-md)] p-6 mb-8 text-center shadow-[var(--shadow-sm)]">
                <h3 className="font-mono text-[var(--accent-purple)] text-[0.9rem] tracking-[2px] font-bold">COGNITIVE PROFILE</h3>
                <RadarChart breakdown={state.xp.breakdown} />
            </div>

            <div className="bg-[var(--gradient-primary)] text-white border-0 rounded-[var(--radius-md)] p-6 mb-4 shadow-[var(--glass-shadow)]">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-white/80 text-[0.85rem] uppercase font-semibold mb-2">Current Streak</div>
                        <div className="text-white text-3xl font-sys font-bold">{state.streak.current} Days</div>
                    </div>
                    <div className="text-right">
                        <div className="text-white/80 text-[0.85rem] uppercase font-semibold mb-2">Max Streak</div>
                        <div className="text-white/90 text-2xl font-sys font-bold">{state.streak.max} Days</div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-light)] rounded-[var(--radius-md)] p-6 mt-4 shadow-[var(--shadow-sm)]">
                <div className="text-[0.85rem] text-[var(--text-muted)] uppercase font-semibold mb-2">Overall Protocol Progress</div>
                <div className="flex justify-between items-end mb-2">
                    <div className="text-[2rem] font-sys font-bold text-[var(--accent-purple)]">{pct}%</div>
                    <div className="font-mono text-[var(--text-muted)]">Lvl {state.xp.level} - {state.xp.total} XP</div>
                </div>
                <div className="h-3 bg-[var(--surface-alt)] rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-[var(--gradient-primary)]" style={{ width: `${pct}%` }} />
                </div>
            </div>

            <div className="flex flex-wrap mt-4 gap-4">
                <div className="flex-1 min-w-[140px] bg-[var(--surface-color)] border border-[var(--border-light)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)]">
                    <div className="text-[0.85rem] text-[var(--text-muted)] uppercase font-semibold mb-2">Gauntlet Cleared</div>
                    <div className="text-[2rem] font-sys font-bold text-[var(--accent-purple)]">{state.stats.qsDone}</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-[var(--surface-color)] border border-[var(--border-light)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)]">
                    <div className="text-[0.85rem] text-[var(--text-muted)] uppercase font-semibold mb-2">Projects Shipped</div>
                    <div className="text-[2rem] font-sys font-bold text-[var(--accent-purple)]">{state.stats.projsDone}</div>
                </div>
            </div>
        </div>
    );
}
