// ── FILE: app/learn/page.tsx ──
import LearnNav from '@/components/learn/LearnNav';
import SyllabusShelf from '@/components/learn/SyllabusShelf';
import BriefingCard from '@/components/learn/BriefingCard';
import SkillGrid from '@/components/learn/SkillGrid';
import CourseGrid from '@/components/learn/CourseGrid';

// Direct static JSON imports — no API calls needed for Learn tab
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
const basicSkills = (skillsData.basic as string[]).map((name, i) => ({
    name: name.replace(/\\n\s*/g, ' ').replace(/\n\s*/g, ' ').trim(),
    category: '',
    microPractice: `Spend 5 minutes practicing ${name.split('\n')[0].trim()} actively today.`,
}));

const DAY_N = 1; // Static — no API needed for learn tab

export default function LearnPage() {
    return (
        <div className="content-z">
            <LearnNav />
            <div className="max-w-[760px] mx-auto px-4 pb-16">

                {/* SECTION A: CURRICULUM */}
                <section id="curriculum" className="mb-14 scroll-mt-[110px]">
                    <div className="mb-6">
                        <div className="font-bebas text-[28px] tracking-wide text-text">CURRICULUM</div>
                        <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-1">
                            10 syllabi · one active at a time · 18 days each
                        </div>
                    </div>
                    <SyllabusShelf syllabi={syllabi} dayN={DAY_N} />
                </section>

                {/* SECTION B: BRIEFINGS */}
                <section id="briefings" className="mb-14 scroll-mt-[110px]">
                    <div className="mb-6">
                        <div className="font-bebas text-[28px] tracking-wide text-text">BRIEFINGS</div>
                        <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-1">
                            7 survival areas · what separates engineers from prompt engineers in 2025
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
                </section>

                {/* SECTION C: SKILLS */}
                <section id="skills" className="mb-14 scroll-mt-[110px]">
                    <div className="mb-6">
                        <div className="font-bebas text-[28px] tracking-wide text-text">SKILLS</div>
                        <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-1">
                            100+ human skills · running quietly in the background, compounding daily
                        </div>
                    </div>
                    <SkillGrid skills={basicSkills} />
                </section>

                {/* SECTION D: COURSES */}
                <section id="courses" className="scroll-mt-[110px]">
                    <div className="mb-6">
                        <div className="font-bebas text-[28px] tracking-wide text-text">COURSES</div>
                        <div className="font-mono text-[10px] text-muted2 tracking-[2px] uppercase mt-1">
                            Free courses pipeline · curated by area
                        </div>
                    </div>
                    <CourseGrid courses={coursesData as any[]} />
                </section>

            </div>
        </div>
    );
}
