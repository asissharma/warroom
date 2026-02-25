'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SurvivalCard({ item }: { item: any }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-surface border border-border rounded-lg mb-3 overflow-hidden">
            <div className="p-4 flex justify-between items-center cursor-pointer select-none" onClick={() => setOpen(!open)}>
                <span className="font-display text-[18px] tracking-wide text-text">{item.area}</span>
                {open ? <ChevronUp size={16} className="text-muted2" /> : <ChevronDown size={16} className="text-muted2" />}
            </div>
            {open && (
                <div className="p-4 border-t border-border bg-s2/30">
                    <div className="mb-4">
                        <h4 className="font-mono text-[10px] text-acid uppercase mb-1">Why</h4>
                        <p className="text-[13px] text-muted2 leading-relaxed">{item.why}</p>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-mono text-[10px] text-accent uppercase mb-2">Topics</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {item.topics.map((t: string, i: number) => <li key={i} className="text-[12px] font-mono text-text">{t}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
