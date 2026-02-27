// ── FILE: components/learn/CourseGrid.tsx ──
'use client';
import { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Course } from '@/lib/types';

interface Props {
    courses: Course[];
}

const FILTERS = ['ALL', 'ML/AI', 'Cloud', 'Security', 'Foundation', 'Data'];

export default function CourseGrid({ courses }: Props) {
    const [filter, setFilter] = useState('ALL');

    const filtered = useMemo(() => {
        if (filter === 'ALL') return courses;
        return courses.filter(c =>
            c.area?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [courses, filter]);

    return (
        <div>
            {/* Filter pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
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

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((course, i) => (
                    <div key={i} className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-4 flex flex-col gap-2">
                        {/* Area badge */}
                        <span className="font-mono text-[9px] text-muted2 uppercase tracking-wider self-start bg-surface2 px-2 py-0.5 rounded">
                            {course.area}
                        </span>

                        <div className="font-body font-semibold text-[13px] text-text leading-snug flex-1">{course.name}</div>

                        <div className="flex items-center justify-between">
                            <div className="font-mono text-[10px] text-muted2">{course.provider}</div>
                            {course.estimatedHours && (
                                <span className="font-mono text-[9px] text-muted2">{course.estimatedHours}h</span>
                            )}
                        </div>

                        {course.url && (
                            <a
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 font-mono text-[10px] text-acid hover:text-acid/80 transition-colors mt-1"
                            >
                                OPEN COURSE
                                <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="font-mono text-[11px] text-muted2 text-center py-8">No courses match</div>
            )}
        </div>
    );
}
