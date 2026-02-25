'use client';
import { useState } from 'react';
import survivalAreas from '@/data/survival-areas.json';
import courses from '@/data/courses.json';
import SurvivalCard from '@/components/SurvivalCard';
import CourseCard from '@/components/CourseCard';

export default function Learn() {
    const [filter, setFilter] = useState('ALL');

    const tags = ['ALL', 'ML/AI', 'Cloud', 'Security', 'Foundation', 'Data'];

    const filteredCourses = filter === 'ALL'
        ? courses
        : courses.filter((c: any) => c.area && c.area.toUpperCase().includes(filter.toUpperCase()));

    return (
        <div className="max-w-[760px] mx-auto px-4 pb-16">
            <h1 className="font-display text-3xl tracking-wide mb-8">KNOWLEDGE BASE</h1>

            <div className="mb-12">
                <h2 className="font-mono text-[11px] text-accent uppercase tracking-widest mb-4">7 Survival Areas</h2>
                <div>
                    {survivalAreas.map((sa: any) => <SurvivalCard key={sa.id} item={sa} />)}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-mono text-[11px] text-acid uppercase tracking-widest">Free Courses Pipeline</h2>
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {tags.map(t => (
                            <button
                                key={t} onClick={() => setFilter(t)}
                                className={`text-[9px] font-mono px-2 py-1 rounded transition-colors whitespace-nowrap ${filter === t ? 'bg-acid text-[#07070a]' : 'bg-surface text-muted2 border border-border hover:text-text'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredCourses.map((c: any, i: number) => <CourseCard key={i} course={c} />)}
                </div>
            </div>
        </div>
    )
}
