// ── FILE: components/learn/SyllabusPanel.tsx ──
'use client';
import { useState, useEffect } from 'react';
import type { PayableSyllabus } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

function BookProgress({ syllabusName, bookTitle }: { syllabusName: string, bookTitle: string }) {
    const key = `intel_book_progress_${syllabusName}_${bookTitle}`;
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem(key);
        if (stored) setProgress(Number(stored));
    }, [key]);

    const increment = () => {
        const next = progress >= 100 ? 0 : progress + 10;
        setProgress(next);
        localStorage.setItem(key, next.toString());
    };

    if (progress >= 100) {
        return <span className="font-mono text-[10px] text-success cursor-pointer bg-success/10 px-1.5 py-0.5 rounded" onClick={increment}>✓ READ</span>;
    }

    const filledCount = Math.floor(progress / 10);
    const bar = '█'.repeat(filledCount) + '░'.repeat(10 - filledCount);

    return (
        <span
            onClick={increment}
            className="font-mono text-[9px] text-muted2 hover:text-acid cursor-pointer transition-colors"
        >
            [{bar}] {progress}%
        </span>
    );
}

interface Props {
    syllabus: PayableSyllabus;
    isActive: boolean;
    color: string;
    dayN: number;
    topicToday?: string;
    onClose: () => void;
}

export default function SyllabusPanel({ syllabus, isActive, color, dayN, topicToday, onClose }: Props) {
    return (
        <div
            className="bg-surface border border-borderHi rounded-lg overflow-hidden mt-4"
            style={{
                borderTopWidth: '4px',
                borderTopColor: color,
                animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="font-bebas text-[20px] text-text tracking-wide">{syllabus.name}</div>
                        <div className="font-mono text-[10px] text-muted2 mt-0.5">
                            DAYS {syllabus.dayStart}–{syllabus.dayEnd}
                            {isActive && (
                                <span className="ml-2 text-acid">[ACTIVE]</span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="font-mono text-[10px] text-muted2 hover:text-text transition-colors">
                        ✕
                    </button>
                </div>

                {syllabus.description && (
                    <div className="font-body text-[12px] text-muted2 mb-4 leading-relaxed">{syllabus.description}</div>
                )}

                {/* Today's focus — only if active */}
                {isActive && topicToday && (
                    <div className="bg-acid/10 border border-acid/30 rounded-lg p-3 mb-4">
                        <div className="font-mono text-[9px] text-acid tracking-[2px] uppercase mb-1">TODAY&apos;S FOCUS</div>
                        <div className="font-body text-[12px] text-text">{topicToday}</div>
                        <div className="font-mono text-[10px] text-muted2 mt-1">
                            Open &quot;{syllabus.books?.[0]?.title ?? 'your book'}&quot;, focus on Chapter 1.
                        </div>
                    </div>
                )}

                {/* Books */}
                {syllabus.books && syllabus.books.length > 0 && (
                    <div className="mb-4">
                        <div className="font-mono text-[9px] text-muted2 tracking-[2px] uppercase mb-2 flex items-center gap-2">
                            BOOKS
                            <div className="h-px flex-1 bg-[rgba(255,255,255,0.055)]" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {syllabus.books.map((book, i) => {
                                return (
                                    <div key={i} className="bg-surface2 rounded-lg p-3">
                                        <div className="flex items-start gap-2 justify-between">
                                            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0 ${book.downloaded ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted2'}`}>
                                                {book.downloaded ? '✓ IN LIBRARY' : 'GET IT ↗'}
                                            </span>
                                            <BookProgress syllabusName={syllabus.name} bookTitle={book.title} />
                                        </div>
                                        <div className="font-body font-medium text-[12px] text-text mt-1">{book.title}</div>
                                        {book.author && (
                                            <div className="font-mono text-[10px] text-muted2">{book.author}</div>
                                        )}
                                        {book.coreChapter && (
                                            <div className="font-mono text-[10px] text-muted2 mt-1 italic">Focus: {book.coreChapter}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Podcasts */}
                {syllabus.podcasts && syllabus.podcasts.length > 0 && (
                    <div className="mb-4">
                        <div className="font-mono text-[9px] text-muted2 tracking-[2px] uppercase mb-2 flex items-center gap-2">
                            PODCASTS
                            <div className="h-px flex-1 bg-[rgba(255,255,255,0.055)]" />
                        </div>
                        <div className="space-y-1">
                            {syllabus.podcasts.map((p, i) => (
                                <div key={i} className="font-mono text-[11px] text-text/80">- {p}</div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekly Exercise */}
                {syllabus.weeklyExercise && (
                    <div className="mb-4">
                        <div className="font-mono text-[9px] text-muted2 tracking-[2px] uppercase mb-2 flex items-center gap-2">
                            WEEKLY EXERCISE
                            <div className="h-px flex-1 bg-[rgba(255,255,255,0.055)]" />
                        </div>
                        <div className="font-body text-[12px] text-text/80">{syllabus.weeklyExercise}</div>
                    </div>
                )}

                {/* Capstone */}
                {syllabus.capstone && (
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                        <div className="font-mono text-[9px] text-accent tracking-[2px] uppercase mb-1">CAPSTONE</div>
                        <div className="font-body text-[12px] text-text">◈ {syllabus.capstone}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
