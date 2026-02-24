import { Task } from '@/hooks/useLearningOS';

interface TaskItemProps {
    task: Task;
    onToggle: () => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
    let tag = 'MISSING';
    let tagClass = '';

    if (task.type === 'gauntlet') { tag = 'GAUNTLET'; tagClass = 'bg-[#74b9ff33] text-[#0984e3] border-[#74b9ff66]'; }
    if (task.type === 'project') { tag = 'EXECUTION'; tagClass = 'bg-[#a29bfe33] text-[#6c5ce7] border-[#a29bfe66]'; }
    if (task.type === 'tech_spine') { tag = 'TECH SPINE'; tagClass = 'bg-[#55efc433] text-[#00b894] border-[#55efc466]'; }
    if (task.type === 'basic_skill') { tag = 'COGNITION'; tagClass = 'bg-[#ffeaa74d] text-[#d63031] border-[#ffeaa780]'; }
    if (task.type === 'payable_skill') { tag = 'LEVERAGE'; tagClass = 'bg-[#fab1a033] text-[#d63031] border-[#fab1a066]'; }
    if (task.isSrs) { tag = 'SRS REVIEW'; tagClass = 'bg-[#a29bfe33] text-[#6c5ce7] border-[#a29bfe66]'; }

    return (
        <div
            onClick={onToggle}
            className={`bg-[var(--surface-glass)] backdrop-blur-[20px] border border-[var(--glass-border)] rounded-[var(--radius-md)] p-4 flex items-start gap-4 shadow-[var(--glass-shadow)] transition-all cursor-pointer active:scale-[0.98] ${task.done ? 'bg-[var(--surface-alt)] border-transparent shadow-none opacity-[0.65]' : ''
                }`}
        >
            <div className="flex-1 overflow-hidden">
                <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-wide mb-1.5 px-2 py-0.5 rounded-[4px] border ${tagClass}`}>
                    {tag}
                </span>
                <div className={`text-[0.95rem] font-semibold mb-[0.2rem] leading-tight ${task.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                    {task.title}
                </div>
                <div className="text-[0.8rem] text-[var(--text-muted)]">{task.desc}</div>
            </div>

            <div className={`w-[26px] h-[26px] shrink-0 rounded-lg border-2 mt-0.5 transition-all flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ${task.done
                    ? 'bg-[var(--gradient-success)] border-none'
                    : 'bg-[var(--surface-alt)] border-[var(--glass-border)]'
                }`}>
                {task.done && <span className="text-white font-[800] text-[14px]">✓</span>}
            </div>
        </div>
    );
}
