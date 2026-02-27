// ── FILE: components/learn/SyllabusBook.tsx ──
'use client';
import type { PayableSyllabus } from '@/lib/types';

interface Props {
    syllabus: PayableSyllabus;
    isActive: boolean;
    isSelected: boolean;
    color: string;
    onClick: () => void;
    dayN: number;
}

export default function SyllabusBook({ syllabus, isActive, isSelected, color, onClick, dayN }: Props) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 rounded-sm relative flex flex-col justify-between items-center overflow-hidden cursor-pointer"
            style={{
                width: '64px',
                height: isActive ? '220px' : '200px',
                backgroundColor: color,
                boxShadow: isActive
                    ? `0 0 20px ${color}60, 0 4px 12px rgba(0,0,0,0.4)`
                    : isSelected
                        ? `0 8px 24px rgba(0,0,0,0.5)`
                        : '0 4px 8px rgba(0,0,0,0.3)',
                transform: isSelected
                    ? 'translateY(-12px)'
                    : 'translateY(0)',
                transition: 'all 0.2s ease',
                scrollSnapAlign: 'start',
            }}
            title={syllabus.name}
        >
            {/* Spine text */}
            <div className="flex-1 flex items-center justify-center px-1 w-full">
                <span
                    className="font-bebas text-[13px] tracking-[1px] text-white/90 pointer-events-none"
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        maxHeight: '170px',
                    }}
                >
                    {syllabus.name}
                </span>
            </div>

            {/* Bottom: day range + active label */}
            <div className="w-full px-1 pb-2 text-center">
                <div className="font-mono text-[8px] text-white/60 leading-tight">
                    D{syllabus.dayStart}–{syllabus.dayEnd}
                </div>
                {isActive && (
                    <div className="font-mono text-[7px] text-white/80 tracking-wider mt-0.5">ACTIVE</div>
                )}
            </div>

            {/* Hover tilt effect overlay */}
            <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }}
            />
        </button>
    );
}
