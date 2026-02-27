// ── FILE: components/learn/CourseGrid.tsx ──
'use client';
import { useState, useMemo, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Course } from '@/lib/types';

interface Props {
    courses: Course[];
}

const FILTERS = ['ALL', 'ML/AI', 'Cloud', 'Security', 'Foundation', 'Data'];

export default function CourseGrid({ courses }: Props) {
    const [filter, setFilter] = useState('ALL');
    const [courseStates, setCourseStates] = useState<Record<string, string>>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const loaded: Record<string, string> = {};
        courses.forEach(c => {
            if (c.url) {
                const s = localStorage.getItem(`intel_course_status_${c.url}`);
                if (s) loaded[c.url] = s;
            }
        });
        setCourseStates(loaded);
    }, [courses]);

    const setStatus = (url: string, status: string | null) => {
        const next = { ...courseStates };
        if (status) {
            next[url] = status;
            localStorage.setItem(`intel_course_status_${url}`, status);
        } else {
            delete next[url];
            localStorage.removeItem(`intel_course_status_${url}`);
        }
        setCourseStates(next);
    };

    const getStatus = (url?: string) => url ? courseStates[url] : undefined;

    const startedCount = Object.values(courseStates).filter(s => s === 'started').length;
    const completedCount = Object.values(courseStates).filter(s => s === 'completed').length;
    const remainingCount = courses.length - startedCount - completedCount;

    const filtered = useMemo(() => {
        if (filter === 'ALL') return courses;
        return courses.filter(c =>
            c.area?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [courses, filter]);

    return (
        <div>
            {/* Filter pills & Stats */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2.5 py-1 font-mono text-[9px] rounded tracking-wider whitespace-nowrap transition-all ${filter === f ? 'bg-acid text-bg font-bold' : 'bg-surface2 text-muted2 border border-[rgba(255,255,255,0.055)] hover:text-text'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="font-mono text-[10px] text-muted2 flex items-center gap-3 shrink-0">
                    <span><span className="text-accent">{startedCount}</span> STARTED</span>
                    <span><span className="text-success">{completedCount}</span> COMPLETED</span>
                    <span><span className="text-text">{remainingCount}</span> TO EXPLORE</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((course, i) => {
                    const status = getStatus(course.url);
                    const isStarted = status === 'started';
                    const isComplete = status === 'completed';

                    return (
                        <div key={i} className={`bg-surface border rounded-lg p-4 flex flex-col gap-2 transition-colors ${isStarted ? 'border-accent shadow-[0_0_10px_rgba(200,255,0,0.1)]' : isComplete ? 'border-success/30 bg-success/5' : 'border-[rgba(255,255,255,0.055)]'}`}>
                            {/* Area badge */}
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-[9px] text-muted2 uppercase tracking-wider self-start bg-surface2 px-2 py-0.5 rounded">
                                    {course.area}
                                </span>
                                {isStarted && <span className="font-mono text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded tracking-widest border border-accent/20">IN PROGRESS</span>}
                                {isComplete && <span className="font-mono text-[9px] text-success bg-success/10 px-1.5 py-0.5 rounded tracking-widest border border-success/20">✓ DONE</span>}
                            </div>

                            <div className={`font-body font-semibold text-[13px] leading-snug flex-1 ${isComplete ? 'text-muted2 line-through' : 'text-text'}`}>{course.name}</div>

                            <div className="flex items-center justify-between">
                                <div className="font-mono text-[10px] text-muted2">{course.provider}</div>
                                {course.estimatedHours && (
                                    <span className="font-mono text-[9px] text-muted2">{course.estimatedHours}h</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[rgba(255,255,255,0.055)]">
                                {course.url && (
                                    <>
                                        <button onClick={() => setStatus(course.url!, isStarted ? null : 'started')} className={`font-mono text-[9px] px-2 py-1 rounded transition-colors ${isStarted ? 'bg-accent text-black font-bold' : 'text-muted2 hover:text-accent hover:bg-surface2'}`}>STARTED</button>
                                        <button onClick={() => setStatus(course.url!, isComplete ? null : 'completed')} className={`font-mono text-[9px] px-2 py-1 rounded transition-colors ${isComplete ? 'bg-success text-black font-bold' : 'text-muted2 hover:text-success hover:bg-surface2'}`}>COMPLETED</button>
                                        <div className="flex-1" />
                                        <a
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 font-mono text-[10px] text-text hover:text-acid transition-colors"
                                        >
                                            OPEN <ExternalLink size={10} />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="font-mono text-[11px] text-muted2 text-center py-8">No courses match</div>
            )}
        </div>
    );
}
