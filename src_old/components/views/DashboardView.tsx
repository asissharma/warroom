import { AppState } from '@/hooks/useLearningOS';
import TaskItem from '../TaskItem';

interface Props {
    state: AppState;
    onToggleTask: (idx: number) => void;
    onPullWork: () => void;
}

export default function DashboardView({ state, onToggleTask, onPullWork }: Props) {
    const total = state.activeTasks.length;
    const doneCount = state.activeTasks.filter(t => t.done).length;
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    return (
        <div className="animate-in fade-in duration-200 z-10 relative">
            <div className="bg-[var(--surface-glass)] backdrop-blur-[var(--glass-blur)] p-4 flex items-center justify-between border-b border-[var(--glass-border)]">
                <span className="font-mono text-[0.8rem] font-bold">DAILY</span>
                <div className="flex-1 h-2 bg-[var(--surface-alt)] rounded px-4 mx-4 overflow-hidden">
                    <div
                        className="h-full bg-[var(--gradient-primary)] transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="font-mono text-[0.8rem] font-bold text-[var(--accent-purple)]">{pct}%</span>
            </div>

            <div className="px-4 pt-4 pb-2 flex justify-between items-end">
                <h2 className="text-[1.25rem] font-sys font-bold">Queued Objectives</h2>
                <span className="font-mono text-[var(--text-muted)] text-[0.8rem]">{total - doneCount} PENDING</span>
            </div>

            <div className="px-4 py-2 flex flex-col gap-3">
                {state.activeTasks.map((t, i) => (
                    <TaskItem key={`${t.id}-${i}`} task={t} onToggle={() => onToggleTask(i)} />
                ))}
            </div>

            <button
                onClick={onPullWork}
                className="block w-[calc(100%-2rem)] mx-auto my-4 p-4 bg-[var(--surface-color)] border border-dashed border-[var(--accent-purple)] text-[var(--accent-purple)] font-sys font-bold rounded-[var(--radius-md)] text-center active:bg-[var(--surface-alt)] transition-colors"
            >
                PULL MORE WORK (+ 3Q, 1P)
            </button>
        </div>
    );
}
