'use client';

import { useState, useMemo } from 'react';
import { useBrainStore } from '@/store/brainStore';
import { useDay } from '@/hooks/useDay';
import { getSurvivalForDay } from '@/lib/dayEngine';
import projectsData from '@/data/projects.json';
import techSpineData from '@/data/tech-spine.json';
import skillsData from '@/data/skills.json';
import survivalData from '@/data/survival-areas.json';
import questionsData from '@/data/questions.json';
import {
    ChevronDown, ChevronRight, Layers, Compass, Book, BookOpen,
    AlertTriangle, User, GraduationCap, ExternalLink, Zap,
    Target, CheckCircle, HelpCircle, DollarSign, FolderKanban,
    Loader2
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

/* ── Phase definitions ──────────────────────────────────── */
const PHASES = [
    { name: 'Foundation', dayStart: 1, dayEnd: 30, color: '#4FC3F7', gradient: 'from-blue-500/10 to-blue-600/5' },
    { name: 'Distributed', dayStart: 31, dayEnd: 50, color: '#FF6B35', gradient: 'from-orange-500/10 to-orange-600/5' },
    { name: 'Cloud', dayStart: 51, dayEnd: 70, color: '#39FF14', gradient: 'from-green-500/10 to-green-600/5' },
    { name: 'Security', dayStart: 71, dayEnd: 90, color: '#FF4444', gradient: 'from-red-500/10 to-red-600/5' },
    { name: 'ML/AI', dayStart: 91, dayEnd: 110, color: '#CE93D8', gradient: 'from-purple-500/10 to-purple-600/5' },
    { name: 'Frontend', dayStart: 111, dayEnd: 130, color: '#00E5FF', gradient: 'from-cyan-500/10 to-cyan-600/5' },
    { name: 'Mastery', dayStart: 131, dayEnd: 140, color: '#FFD700', gradient: 'from-yellow-500/10 to-yellow-600/5' },
    { name: 'Capstone', dayStart: 141, dayEnd: 180, color: '#FF6B9D', gradient: 'from-pink-500/10 to-pink-600/5' },
];

/* ── Precomputed data grouped by phase ──────────────────── */
interface SpineArea {
    id: number;
    area: string;
    phase: string;
    dayStart: number;
    dayEnd: number;
    topics: string[];
    topicKeys: string[];
    microtasks: string[];
    resource: string;
    resourceUrl: string;
}

interface Project {
    day: number;
    phase: string;
    category: string;
    name: string;
    doneMeans: string;
}

function getSpinesForPhase(phaseName: string): SpineArea[] {
    return (techSpineData as SpineArea[]).filter(s => s.phase === phaseName);
}

function getProjectsForPhase(dayStart: number, dayEnd: number): Project[] {
    return (projectsData as Project[]).filter(p => p.day >= dayStart && p.day <= dayEnd);
}

function getSurvivalAreas() {
    return (survivalData as any[]);
}

function getBasicSkillCategories() {
    const basic = ((skillsData as any).basic || []) as any[];
    const categories: Record<string, any[]> = {};
    basic.forEach(s => {
        const cat = s.category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
    });
    return categories;
}

function getPayableSkills() {
    return ((skillsData as any).payable || []) as any[];
}

function getQuestionsByTheme(): Record<string, any[]> {
    const themes: Record<string, any[]> = {};
    (questionsData as any[]).forEach(q => {
        const t = q.theme || 'General';
        if (!themes[t]) themes[t] = [];
        themes[t].push(q);
    });
    return themes;
}

function getAllProjectsByCategory(): Record<string, any[]> {
    const cats: Record<string, any[]> = {};
    (projectsData as any[]).forEach(p => {
        const c = p.category || 'General';
        if (!cats[c]) cats[c] = [];
        cats[c].push(p);
    });
    return cats;
}

/* ── Sub-components ─────────────────────────────────────── */

function SpineCard({ spine }: { spine: SpineArea }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-borderLo rounded-xl overflow-hidden transition-all duration-200 hover:border-borderHi">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface2/50 transition-colors"
            >
                <Compass className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text truncate">{spine.area}</div>
                    <div className="text-[10px] text-muted uppercase tracking-widest">
                        Day {spine.dayStart}–{spine.dayEnd} · {spine.topics.length} topics
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-borderLo bg-bg/50 p-3 space-y-3">
                    {/* Topics */}
                    <div>
                        <div className="text-[9px] text-muted uppercase tracking-[0.2em] mb-1.5 font-bold">Topics</div>
                        <div className="flex flex-wrap gap-1.5">
                            {spine.topics.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] rounded-full border border-teal-500/20 font-medium">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Microtasks */}
                    {spine.microtasks?.length > 0 && (
                        <div>
                            <div className="text-[9px] text-muted uppercase tracking-[0.2em] mb-1.5 font-bold">Drills</div>
                            <ul className="space-y-1">
                                {spine.microtasks.slice(0, 3).map((mt, i) => (
                                    <li key={i} className="text-[11px] text-text/70 flex gap-2">
                                        <Target className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{mt}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Resource */}
                    {spine.resource && (
                        <a href={spine.resourceUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] text-accent hover:text-text transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            {spine.resource}
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

function ProjectsGrid({ projects }: { projects: Project[] }) {
    const [show, setShow] = useState(false);
    if (projects.length === 0) return null;

    // Group by category
    const byCategory: Record<string, Project[]> = {};
    projects.forEach(p => {
        if (!byCategory[p.category]) byCategory[p.category] = [];
        byCategory[p.category].push(p);
    });

    return (
        <div className="border border-borderLo rounded-xl overflow-hidden">
            <button
                onClick={() => setShow(!show)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface2/50 transition-colors"
            >
                <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text">Projects</div>
                    <div className="text-[10px] text-muted uppercase tracking-widest">
                        {projects.length} builds · {Object.keys(byCategory).length} categories
                    </div>
                </div>
                {show ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {show && (
                <div className="border-t border-borderLo bg-bg/50 p-3 space-y-3">
                    {Object.entries(byCategory).map(([cat, projs]) => (
                        <div key={cat}>
                            <div className="text-[9px] text-blue-400/70 uppercase tracking-[0.2em] mb-1 font-bold">{cat}</div>
                            <div className="grid grid-cols-1 gap-1">
                                {projs.map(p => (
                                    <div key={p.day} className="flex items-start gap-2 text-[11px] p-1.5 rounded-lg hover:bg-surface2/50 transition-colors">
                                        <span className="text-muted font-mono text-[9px] mt-0.5 shrink-0 w-6 text-right">D{p.day}</span>
                                        <div className="min-w-0">
                                            <div className="text-text font-medium truncate">{p.name}</div>
                                            <div className="text-muted/60 text-[9px] line-clamp-1">{p.doneMeans}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SurvivalSection() {
    const [open, setOpen] = useState(false);
    const { data: dayData } = useDay();
    const areas = getSurvivalAreas();

    const weekFocus = useMemo(() => {
        if (!dayData?.dayN) return null;
        const dayN = dayData.dayN;
        const weekStart = Math.max(1, dayN - ((dayN - 1) % 7));
        const weekEnd = weekStart + 6;
        
        const counts: Record<string, { count: number, area: string, urgency: string }> = {};
        for (let d = weekStart; d <= weekEnd; d++) {
            const survival = getSurvivalForDay(d);
            if (!counts[survival.area]) {
                counts[survival.area] = { count: 0, area: survival.area, urgency: survival.urgency };
            }
            counts[survival.area].count++;
        }

        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 2);
    }, [dayData?.dayN]);

    const phaseName = dayData?.phase || 'Unknown';
    const weekStart = dayData?.dayN ? Math.max(1, dayData.dayN - ((dayData.dayN - 1) % 7)) : 0;
    const weekEnd = weekStart + 6;

    return (
        <div className="border border-red-500/20 rounded-xl overflow-hidden bg-red-500/5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-500/10 transition-colors"
            >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text">Survival Areas</div>
                    <div className="text-[10px] text-red-400/70 uppercase tracking-widest">{areas.length} critical domains</div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-red-500/20 p-3 space-y-4">
                    {/* This Week's Focus Callout */}
                    {weekFocus && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">This Week's Focus</span>
                                <span className="text-[9px] text-muted/60 font-mono">Days {weekStart}–{weekEnd} · {phaseName}</span>
                            </div>
                            <div className="space-y-1.5">
                                {weekFocus.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-red-500/50" />
                                        <span className="text-xs font-bold text-text">{f.area}</span>
                                        <span className="text-[10px] text-muted/50">— {f.count} drills in rotation</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                        {areas.map((area: any) => (
                            <div key={area.id} className="p-2.5 border border-borderLo/50 rounded-xl bg-bg/50 hover:border-borderLo transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                                        area.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>{area.urgency}</span>
                                    <span className="font-bold text-xs text-text">{area.area}</span>
                                </div>
                                <p className="text-[10px] text-muted/70 leading-relaxed line-clamp-2">{area.why}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SkillsSection() {
    const [open, setOpen] = useState(false);
    const categories = useMemo(() => getBasicSkillCategories(), []);
    const totalSkills = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set([Object.keys(categories)[0]]));

    const toggleCat = (cat: string) => {
        const next = new Set(expandedCats);
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
        setExpandedCats(next);
    };

    return (
        <div className="border border-amber-500/20 rounded-xl overflow-hidden bg-amber-500/5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-amber-500/10 transition-colors"
            >
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text">Human Skills</div>
                    <div className="text-[10px] text-amber-400/70 uppercase tracking-widest">
                        {totalSkills} skills · {Object.keys(categories).length} categories
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-amber-500/20 p-3 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Total Mastered</div>
                            <div className="text-xl font-black text-text">0</div>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest">In Rotation</div>
                            <div className="text-xl font-black text-text">{totalSkills}</div>
                        </div>
                    </div>

                    {Object.entries(categories).map(([cat, skills]) => {
                        const isExpanded = expandedCats.has(cat);
                        return (
                            <div key={cat} className="space-y-1 group/cat">
                                <button 
                                    onClick={() => toggleCat(cat)}
                                    className="w-full flex items-center justify-between py-1.5 px-1 rounded hover:bg-amber-500/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1 h-3 rounded-full transition-all ${isExpanded ? 'bg-amber-400' : 'bg-muted/20'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${isExpanded ? 'text-amber-400' : 'text-text/40 group-hover/cat:text-text/60'}`}>
                                            {cat}
                                        </span>
                                        <span className="text-[9px] text-muted/30 font-mono">[{skills.length}]</span>
                                    </div>
                                    {isExpanded ? <ChevronDown className="w-3 h-3 text-muted/50" /> : <ChevronRight className="w-3 h-3 text-muted/50" />}
                                </button>
                                
                                {isExpanded && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {skills.map((s: any) => (
                                            <div key={s.id} className="group/item flex flex-col gap-1 text-[11px] text-text/70 p-2.5 rounded-lg bg-bg/50 border border-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all leading-tight relative overflow-hidden">
                                                <div className="font-bold text-text/90 group-hover/item:text-amber-400 transition-colors">{s.name}</div>
                                                <div className="text-[9px] text-muted/60 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    {s.dailyDrill ? `Drill: ${s.dailyDrill.slice(0, 40)}...` : 'Mastery required'}
                                                </div>
                                                <div className="absolute top-0 right-0 p-1 opacity-10 group-hover/item:opacity-30">
                                                    <Zap className="w-3 h-3 text-amber-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function QuestionsSection() {
    const [open, setOpen] = useState(false);
    const themes = useMemo(() => getQuestionsByTheme(), []);
    const totalQ = Object.values(themes).reduce((s, a) => s + a.length, 0);

    return (
        <div className="border border-violet-500/20 rounded-xl overflow-hidden bg-violet-500/5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-violet-500/10 transition-colors"
            >
                <HelpCircle className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text">Interview Questions</div>
                    <div className="text-[10px] text-violet-400/70 uppercase tracking-widest">
                        {totalQ} questions · {Object.keys(themes).length} themes
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-violet-500/20 p-3 space-y-3 max-h-[500px] overflow-y-auto">
                    {Object.entries(themes).map(([theme, qs]) => (
                        <ThemeBlock key={theme} theme={theme} questions={qs} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ThemeBlock({ theme, questions }: { theme: string; questions: any[] }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left hover:bg-surface2/30 rounded-lg px-1 py-0.5 transition-colors">
                {open ? <ChevronDown className="w-3 h-3 text-muted" /> : <ChevronRight className="w-3 h-3 text-muted" />}
                <span className="text-[10px] text-violet-400/70 uppercase tracking-[0.15em] font-bold">{theme}</span>
                <span className="text-[9px] text-muted ml-auto font-mono">{questions.length}</span>
            </button>
            {open && (
                <div className="pl-5 mt-1 space-y-1">
                    {questions.map(q => (
                        <div key={q.id} className="text-[11px] text-text/70 p-1.5 rounded-md bg-bg/50 hover:bg-surface2/50 transition-colors leading-snug">
                            <span className="text-muted font-mono text-[9px] mr-1.5">Q{q.id}</span>
                            {q.question}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PayableSkillsSection() {
    const [open, setOpen] = useState(false);
    const payable = useMemo(() => getPayableSkills(), []);

    return (
        <div className="border border-emerald-500/20 rounded-xl overflow-hidden bg-emerald-500/5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-emerald-500/10 transition-colors"
            >
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text">Deep Dive Skills</div>
                    <div className="text-[10px] text-emerald-400/70 uppercase tracking-widest">
                        {payable.length} modules · book-based
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-emerald-500/20 p-3 space-y-2 max-h-[500px] overflow-y-auto">
                    {payable.map((sk: any) => (
                        <PayableCard key={sk.id} skill={sk} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PayableCard({ skill }: { skill: any }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-borderLo rounded-xl overflow-hidden transition-all duration-200 hover:border-borderHi">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface2/50 transition-colors"
            >
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text truncate">{skill.name}</div>
                    <div className="text-[10px] text-muted uppercase tracking-widest">
                        Day {skill.dayStart}–{skill.dayEnd} · {skill.coreBooks?.length || 0} books
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-borderLo bg-bg/50 p-3 space-y-3">
                    {/* Books */}
                    {skill.coreBooks?.length > 0 && (
                        <div>
                            <div className="text-[9px] text-muted uppercase tracking-[0.2em] mb-1.5 font-bold">Core Books</div>
                            <div className="space-y-1">
                                {skill.coreBooks.map((b: string, i: number) => (
                                    <div key={i} className="text-[11px] text-text/80 flex gap-2 items-start">
                                        <BookOpen className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Weekly Goal */}
                    {skill.weeklyGoal && (
                        <div>
                            <div className="text-[9px] text-muted uppercase tracking-[0.2em] mb-1 font-bold">Weekly Goal</div>
                            <p className="text-[11px] text-text/70 leading-snug">{skill.weeklyGoal}</p>
                        </div>
                    )}

                    {/* Chapter Map */}
                    {skill.chapterMap && (
                        <div>
                            <div className="text-[9px] text-muted uppercase tracking-[0.2em] mb-1.5 font-bold">Chapter Map</div>
                            <div className="space-y-1">
                                {Object.entries(skill.chapterMap).map(([week, desc]) => (
                                    <div key={week} className="flex gap-2 text-[10px]">
                                        <span className="text-emerald-400 font-mono shrink-0 w-5 text-right">W{week}</span>
                                        <span className="text-text/60 leading-snug">{desc as string}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function GlobalProjectsSection() {
    const [open, setOpen] = useState(false);
    const cats = useMemo(() => getAllProjectsByCategory(), []);
    const totalProjects = Object.values(cats).reduce((s, a) => s + a.length, 0);

    return (
        <div className="border border-blue-500/20 rounded-xl overflow-hidden bg-blue-500/5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-blue-500/10 transition-colors"
            >
                <FolderKanban className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text">All Projects</div>
                    <div className="text-[10px] text-blue-400/70 uppercase tracking-widest">
                        {totalProjects} builds · {Object.keys(cats).length} categories
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-blue-500/20 p-3 space-y-3 max-h-[500px] overflow-y-auto">
                    {Object.entries(cats).map(([cat, projs]) => (
                        <div key={cat}>
                            <div className="text-[9px] text-blue-400/70 uppercase tracking-[0.2em] mb-1 font-bold">{cat}</div>
                            <div className="grid grid-cols-1 gap-1">
                                {projs.map((p: any) => (
                                    <div key={`${p.day}-${p.name}`} className="flex items-start gap-2 text-[11px] p-1.5 rounded-lg hover:bg-surface2/50 transition-colors">
                                        <span className="text-muted font-mono text-[9px] mt-0.5 shrink-0 w-6 text-right">D{p.day}</span>
                                        <div className="min-w-0">
                                            <div className="text-text font-medium truncate">{p.name}</div>
                                            <div className="text-muted/60 text-[9px] line-clamp-1">{p.doneMeans}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Phase Card ─────────────────────────────────────────── */
function CoursesSection() {
    const [open, setOpen] = useState(false);
    const { data: courses, isLoading } = useSWR('/api/courses', fetcher);

    const grouped = useMemo(() => {
        if (!courses) return {};
        // If courses is an object with an error or something, handle it
        const coursesArray = Array.isArray(courses) ? courses : [];
        return coursesArray.reduce((acc: any, course: any) => {
            const provider = course.provider || 'Other';
            if (!acc[provider]) acc[provider] = [];
            acc[provider].push(course);
            return acc;
        }, {});
    }, [courses]);

    const providersCount = Object.keys(grouped).length;

    return (
        <div className="border border-amber-500/20 rounded-xl overflow-hidden bg-amber-500/5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-amber-500/10 transition-colors"
            >
                <Book className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text uppercase tracking-tight">Recommended Courses</div>
                    <div className="text-[10px] text-amber-400/70 uppercase tracking-widest">
                        {Array.isArray(courses) ? courses.length : 0} courses · {providersCount} providers
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-amber-500/20 p-4 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-xs text-muted/50 p-2 justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            Synthesizing curriculum...
                        </div>
                    ) : Object.entries(grouped).map(([provider, items]: [string, any]) => (
                        <div key={provider} className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <span className="h-px flex-1 bg-amber-500/10" />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 leading-none">{provider}</div>
                                <span className="h-px flex-1 bg-amber-500/10" />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {items.map((course: any) => (
                                    <a
                                        key={course.id}
                                        href={course.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block group p-3 rounded-xl bg-bg/60 border border-amber-500/10 hover:border-amber-400/40 hover:bg-amber-500/[0.02] transition-all relative overflow-hidden shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <BookOpen className="w-3 h-3 text-amber-400/60" />
                                                    <div className="text-xs font-bold text-text/90 group-hover:text-text transition-colors truncate">
                                                        {course.name}
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-muted/60 flex items-center gap-3 font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Compass className="w-2.5 h-2.5" />
                                                        Week {course.weekRecommended}
                                                    </span>
                                                    {course.estimatedHours > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Target className="w-2.5 h-2.5" />
                                                            {course.estimatedHours}h effort
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-surface border border-borderLo p-1.5 rounded-lg group-hover:border-amber-400/30 transition-all">
                                                <ExternalLink className="w-3 h-3 text-muted/50 group-hover:text-amber-400" />
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PhaseCard({ phase, index }: { phase: typeof PHASES[number]; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const spines = useMemo(() => getSpinesForPhase(phase.name), [phase.name]);
    const projects = useMemo(() => getProjectsForPhase(phase.dayStart, phase.dayEnd), [phase.dayStart, phase.dayEnd]);
    const days = phase.dayEnd - phase.dayStart + 1;

    return (
        <div className={`rounded-2xl border border-borderLo overflow-hidden transition-all duration-300 bg-gradient-to-br ${phase.gradient}`}>
            {/* Phase header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-4 text-left group hover:bg-surface/30 transition-colors"
            >
                {/* Phase number badge */}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                    style={{ backgroundColor: phase.color + '20', color: phase.color }}
                >
                    {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-black text-base text-text tracking-tight">{phase.name}</div>
                    <div className="flex items-center gap-3 text-[10px] text-muted uppercase tracking-widest mt-0.5">
                        <span>Day {phase.dayStart}–{phase.dayEnd}</span>
                        <span>·</span>
                        <span>{days} days</span>
                        <span>·</span>
                        <span>{spines.length} areas</span>
                        <span>·</span>
                        <span>{projects.length} projects</span>
                    </div>
                </div>

                {/* Progress bar placeholder */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="w-24 h-1.5 bg-bg/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ backgroundColor: phase.color, width: '0%' }} />
                    </div>
                    <span className="text-[10px] text-muted font-mono">0%</span>
                </div>

                {expanded ? <ChevronDown className="w-5 h-5 text-muted shrink-0" /> : <ChevronRight className="w-5 h-5 text-muted shrink-0" />}
            </button>

            {/* Phase content — progressive disclosure */}
            {expanded && (
                <div className="border-t border-borderLo p-4 space-y-3">
                    {/* Tech Spine Areas */}
                    {spines.length > 0 && (
                        <div>
                            <div className="text-[9px] text-muted uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-2">
                                <Compass className="w-3 h-3 text-teal-400" />
                                Tech Spine Areas
                            </div>
                            <div className="space-y-2">
                                {spines.map(s => <SpineCard key={s.id} spine={s} />)}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    <ProjectsGrid projects={projects} />
                </div>
            )}
        </div>
    );
}

/* ── Main Brain Canvas ──────────────────────────────────── */
export function WorkCanvas({ active }: { active: boolean }) {
    if (!active) return null;

    return (
        <div className="absolute inset-0 z-40 bg-bg overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-text">
                        180-DAY CURRICULUM
                    </h1>
                    <p className="text-sm text-muted">
                        8 phases · 26 spine areas · 150+ projects · 120 human skills · 10 deep-dive modules · 6 survival domains · 133+ questions
                    </p>
                </div>

                {/* Cross-cutting sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SurvivalSection />
                    <SkillsSection />
                    <QuestionsSection />
                    <PayableSkillsSection />
                    <CoursesSection />
                </div>

                {/* Global Projects overview */}
                <div>
                    <GlobalProjectsSection />
                </div>

                {/* Phase timeline */}
                <div className="space-y-3">
                    <div className="text-[9px] text-muted uppercase tracking-[0.2em] font-bold flex items-center gap-2 px-1">
                        <Zap className="w-3 h-3 text-accent" />
                        Phase Timeline
                    </div>
                    {PHASES.map((phase, i) => (
                        <PhaseCard key={phase.name} phase={phase} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
