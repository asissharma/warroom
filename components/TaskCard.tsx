'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    title: string;
    subtitle?: string;
    dotColor: 'accent' | 'danger' | 'success' | 'warning' | 'info';
    badge?: string;
    badgeColor?: string;
    children: React.ReactNode;
}

export default function TaskCard({ title, subtitle, dotColor, badge, badgeColor, children }: Props) {
    const [open, setOpen] = useState(true);

    const colors = {
        accent: 'bg-accent shadow-[0_0_8px_rgba(124,92,252,0.6)]',
        danger: 'bg-danger shadow-[0_0_8px_rgba(255,59,78,0.6)]',
        success: 'bg-success shadow-[0_0_8px_rgba(0,229,160,0.6)]',
        warning: 'bg-warning shadow-[0_0_8px_rgba(255,140,0,0.6)]',
        info: 'bg-info shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    };

    return (
        <div className="bg-surface border border-border rounded-lg overflow-hidden mb-3">
            <div className="flex justify-between items-center p-3 cursor-pointer select-none" onClick={() => setOpen(!open)}>
                <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${colors[dotColor]}`} />
                    <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-text">{title}</span>
                        {subtitle && <span className="font-mono text-[10px] text-muted2">{subtitle}</span>}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {badge && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded text-white ${badgeColor || 'bg-muted'}`}>
                            {badge}
                        </span>
                    )}
                    {open ? <ChevronUp size={14} className="text-muted2" /> : <ChevronDown size={14} className="text-muted2" />}
                </div>
            </div>
            {open && (
                <div className="border-t border-border overflow-hidden">
                    {children}
                </div>
            )}
        </div>
    )
}
