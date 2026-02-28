'use client';
import { useState } from 'react';
import SyllabusShelf from '@/components/learn/SyllabusShelf';
import BriefingCard from '@/components/learn/BriefingCard';
import SkillGrid from '@/components/learn/SkillGrid';
import CourseGrid from '@/components/learn/CourseGrid';

import skillsData from '@/data/skills.json';
import survivalAreas from '@/data/survival-areas.json';
import coursesData from '@/data/courses.json';

// Map payable data to PayableSyllabus shape
const syllabi = (skillsData.payable as Array<{
    name: string; dayStart: number; dayEnd: number;
    coreBooks?: string[];
}>).map((s, i) => ({
    id: i + 1,
    name: s.name,
    dayStart: s.dayStart,
    dayEnd: s.dayEnd,
    description: `Master ${s.name} through curated books, exercises, and daily practice.`,
    books: (s.coreBooks ?? []).map((title, bi) => ({
        title,
        author: '',
        downloaded: bi === 0,
        coreChapter: 'Chapter 1',
    })),
    podcasts: [],
    weeklyExercise: `Practice one ${s.name} scenario with a partner or in writing.`,
    capstone: `Apply ${s.name} in a real situation this month.`,
}));

// Map basic skills strings to skill objects
const basicSkills = (skillsData.basic as string[]).map((name) => ({
    name: name.replace(/\\n\s*/g, ' ').replace(/\n\s*/g, ' ').trim(),
    category: '',
    microPractice: `Spend 5 minutes practicing ${name.split('\n')[0].trim()} actively today.`,
}));

const DAY_N = 1;

const TABS = [
    { id: 'curriculum', label: 'CURRICULUM', emoji: '📚' },
    { id: 'briefings', label: 'BRIEFINGS', emoji: '⚡' },
    { id: 'skills', label: 'SKILLS', emoji: '🧠' },
    { id: 'courses', label: 'COURSES', emoji: '🎓' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function LearnPage() {
    const [activeTab, setActiveTab] = useState<TabId>('curriculum');

    return (
        /* ── Panel Shell ── full viewport, nothing outer-scrolls */
        <div className="h-[100dvh] overflow-hidden flex flex-col content-z">

            {/* ── TAB STRIP ── */}
            <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-[rgba(255,255,255,0.055)] bg-surface/60 backdrop-blur-sm">
                <span className="font-bebas text-lg tracking-widest text-text mr-4">LEARN</span>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 font-mono text-[10px] tracking-[2px] rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === tab.id
                                ? 'bg-accent text-white shadow-[0_0_12px_rgba(124,92,252,0.4)]'
                                : 'text-muted2 hover:text-text hover:bg-surface2'
                            }`}
                    >
                        <span className="hidden sm:block">{tab.emoji}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── PANEL CONTENT ── fills the rest */}
            <div className="flex-1 overflow-hidden min-h-0">

                {/* CURRICULUM */}
                {activeTab === 'curriculum' && (
                    <div className="h-full overflow-y-auto px-4 py-4">
                        <div className="max-w-[760px] mx-auto">
                            <div className="mb-4">
                                <div className="font-bebas text-[24px] tracking-wide text-text leading-none">CURRICULUM</div>
                                <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-0.5">
                                    10 syllabi · one active at a time · 18 days each
                                </div>
                            </div>
                            <SyllabusShelf syllabi={syllabi} dayN={DAY_N} />
                        </div>
                    </div>
                )}

                {/* BRIEFINGS */}
                {activeTab === 'briefings' && (
                    <div className="h-full overflow-y-auto px-4 py-4">
                        <div className="max-w-[760px] mx-auto">
                            <div className="mb-4">
                                <div className="font-bebas text-[24px] tracking-wide text-text leading-none">BRIEFINGS</div>
                                <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-0.5">
                                    7 survival areas · what separates engineers from prompt engineers
                                </div>
                            </div>
                            <div>
                                {(survivalAreas as Array<{
                                    id: number; area: string; urgency?: string; why: string;
                                    topics: string[]; resources: unknown[]; spineConnection?: string;
                                }>).map(sa => (
                                    <BriefingCard
                                        key={sa.id}
                                        area={{
                                            id: sa.id,
                                            area: sa.area,
                                            urgency: (sa.urgency ?? 'MEDIUM') as 'CRITICAL' | 'HIGH' | 'MEDIUM',
                                            why: sa.why,
                                            topics: sa.topics,
                                            resources: (sa.resources as unknown[]).map(r =>
                                                typeof r === 'string'
                                                    ? { name: r, author: '', free: true, url: null }
                                                    : r as { name: string; author: string; free: boolean; url: string | null }
                                            ),
                                            spineConnection: sa.spineConnection ?? '',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SKILLS */}
                {activeTab === 'skills' && (
                    <div className="h-full overflow-y-auto px-4 py-4">
                        <div className="max-w-[760px] mx-auto">
                            <div className="mb-4">
                                <div className="font-bebas text-[24px] tracking-wide text-text leading-none">SKILLS</div>
                                <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-0.5">
                                    100+ human skills · running quietly in the background, compounding daily
                                </div>
                            </div>
                            <SkillGrid skills={basicSkills} />
                        </div>
                    </div>
                )}

                {/* COURSES */}
                {activeTab === 'courses' && (
                    <div className="h-full overflow-y-auto px-4 py-4">
                        <div className="max-w-[760px] mx-auto">
                            <div className="mb-4">
                                <div className="font-bebas text-[24px] tracking-wide text-text leading-none">COURSES</div>
                                <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-0.5">
                                    Free courses pipeline · curated by area
                                </div>
                            </div>
                            <CourseGrid courses={coursesData as any[]} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
