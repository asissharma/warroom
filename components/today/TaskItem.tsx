'use client';
import { Check } from 'lucide-react';

export default function TaskItem({
    isMission,
    text,
    duration,
    taskId,
    completed = false,
    onToggle
}: {
    isMission?: boolean,
    text: string,
    duration?: string,
    taskId?: string,
    completed?: boolean,
    onToggle?: (id: string, state: boolean) => void
}) {
    return (
        <div
            className="flex items-start p-3 border-b border-border last:border-0 hover:bg-s2 transition-colors group cursor-pointer"
            onClick={() => taskId && onToggle && onToggle(taskId, !completed)}
        >
            <div className={`mt-0.5 mr-3 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${completed ? 'bg-acid border-acid' : 'border-muted2 group-hover:border-acid'}`}>
                {completed && <Check className="w-3 h-3 text-black stroke-[3]" />}
            </div>
            <div className={`flex-1 ${completed ? 'opacity-50 line-through' : ''}`}>
                {isMission && <div className="text-accent text-[9px] uppercase font-mono tracking-widest mb-1">Mission</div>}
                <div className="text-text text-sm font-body leading-snug">{text}</div>
            </div>
            {duration && <div className="text-muted2 text-[10px] font-mono ml-4 shrink-0">{duration}</div>}
        </div>
    );
}
