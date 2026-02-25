'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
    text: string;
    duration?: string;
    source?: string;
    isMission?: boolean;
}

export default function TaskItem({ text, duration, source, isMission }: Props) {
    const [done, setDone] = useState(false);
    const inc = useStore(s => s.incrementTasks);

    const toggle = () => {
        if (!done) inc(1);
        else inc(-1);
        setDone(!done);
    };

    return (
        <div className={`p-3 border-b border-border/50 flex items-start space-x-3 hover:bg-white/[0.02] transition-colors cursor-pointer select-none ${isMission ? 'border-l-[3px] border-l-accent bg-accent/[0.02]' : ''}`} onClick={toggle}>
            <div className={`mt-0.5 w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center rounded-[4px] border transition-colors ${done ? 'bg-success border-success' : 'border-muted'}`}>
                {done && <Check size={12} className="text-[#07070a]" strokeWidth={3} />}
            </div>
            <div className="flex-1 flex flex-col justify-start">
                <span className={`text-[13px] font-mono transition-colors ${done ? 'text-muted2 line-through' : 'text-text'}`}>
                    {text}
                </span>
                {(duration || source || isMission) && (
                    <div className="flex items-center space-x-2 mt-2">
                        {duration && <span className="text-[9px] font-mono bg-acid/10 text-acid px-1.5 py-0.5 rounded uppercase">{duration}</span>}
                        {source && <span className="text-[9px] font-mono text-muted2 uppercase">{source}</span>}
                        {isMission && <span className="text-[9px] font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase">MISSION</span>}
                    </div>
                )}
            </div>
        </div>
    )
}
