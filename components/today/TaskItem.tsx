'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';

export default function TaskItem({
    isMission,
    text,
    duration,
    taskId,
    completed = false,
    onToggle,
    expandedContent
}: {
    isMission?: boolean,
    text: string,
    duration?: string,
    taskId?: string,
    completed?: boolean,
    onToggle?: (id: string, state: boolean) => void,
    expandedContent?: React.ReactNode
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-b border-border last:border-0 hover:bg-s2 transition-colors group">
            <div
                className="flex items-start p-3 cursor-pointer"
                onClick={() => expandedContent && setIsExpanded(!isExpanded)}
            >
                <div
                    className={`mt-0.5 mr-3 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${completed ? 'bg-acid border-acid' : 'border-muted2 group-hover:border-acid'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (taskId && onToggle) onToggle(taskId, !completed);
                    }}
                >
                    {completed && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </div>
                <div className={`flex-1 ${completed ? 'opacity-50 line-through transition-opacity duration-300' : ''}`}>
                    {isMission && <div className="text-accent text-[9px] uppercase font-mono tracking-widest mb-1">Mission</div>}
                    <div className="text-text text-sm font-body leading-snug">{text}</div>

                    {isExpanded && expandedContent && (
                        <div className="mt-3 pt-3 border-t border-border/50 text-sm font-body text-muted2 no-underline opacity-100 animate-in fade-in slide-in-from-top-2 duration-200">
                            {expandedContent}
                        </div>
                    )}
                </div>
                {duration && <div className="text-muted2 text-[10px] font-mono ml-4 shrink-0 mt-0.5">{duration}</div>}

                {expandedContent && (
                    <div className="ml-2 mt-0.5 text-muted2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <svg className={`w-3 h-3 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
