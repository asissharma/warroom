// ── FILE: components/learn/SyllabusShelf.tsx ──
'use client';
import { useState } from 'react';
import type { PayableSyllabus } from '@/lib/types';
import SyllabusBook from './SyllabusBook';
import SyllabusPanel from './SyllabusPanel';

interface Props {
    syllabi: PayableSyllabus[];
    dayN: number;
    topicToday?: string;
}

const BOOK_COLORS = [
    '#7c5cfc', '#ff3b4e', '#c8ff00', '#00e5a0', '#ff8c00',
    '#38bdf8', '#a855f7', '#f43f5e', '#f59e0b', '#10b981',
];

export default function SyllabusShelf({ syllabi, dayN, topicToday }: Props) {
    const [selected, setSelected] = useState<number | null>(null);

    const handleClick = (id: number) => {
        setSelected(prev => prev === id ? null : id);
    };

    const selectedSyllabus = syllabi.find(s => s.id === selected);

    return (
        <div>
            {/* Shelf label */}
            <div className="font-mono text-[9px] text-muted2 tracking-[3px] uppercase mb-4">
                A LIBRARY OF THINGS WORTH BUILDING
            </div>

            {/* Horizontal shelf */}
            <div
                className="flex gap-3 overflow-x-auto pb-4 no-scrollbar"
                style={{
                    scrollSnapType: 'x mandatory',
                    perspective: '800px',
                }}
            >
                {/* Shelf base */}
                <div className="relative flex items-end gap-3">
                    {syllabi.map((syl, i) => {
                        const isActive = dayN >= syl.dayStart && dayN <= syl.dayEnd;
                        const isSelected = selected === syl.id;
                        const color = BOOK_COLORS[i % BOOK_COLORS.length];

                        return (
                            <SyllabusBook
                                key={syl.id}
                                syllabus={syl}
                                isActive={isActive}
                                isSelected={isSelected}
                                color={color}
                                dayN={dayN}
                                onClick={() => handleClick(syl.id)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Shelf floor */}
            <div className="h-[2px] bg-gradient-to-r from-muted/40 via-muted2/20 to-transparent rounded mb-2" />

            {/* Panel */}
            {selectedSyllabus && (
                <SyllabusPanel
                    syllabus={selectedSyllabus}
                    isActive={dayN >= selectedSyllabus.dayStart && dayN <= selectedSyllabus.dayEnd}
                    color={BOOK_COLORS[syllabi.indexOf(selectedSyllabus) % BOOK_COLORS.length]}
                    dayN={dayN}
                    topicToday={topicToday}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
