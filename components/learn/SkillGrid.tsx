// ── FILE: components/learn/SkillGrid.tsx ──
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getDayN } from '@/lib/dayEngine';
import { Play, Check, X } from 'lucide-react';

interface Skill {
    name: string;
    category: string;
    microPractice?: string;
}

interface Props {
    skills: Skill[];
    todaySkillName?: string;
}

const CATEGORIES = [
    'ALL', 'Cognitive', 'Social', 'Leadership', 'EQ', 'Problem-Solving',
    'Negotiation', 'Time', 'Learning', 'Creativity', 'Resilience', 'Influence', 'Speaking',
];

// Derive category from skill name heuristically
function deriveCategory(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('negotiat') || n.includes('batna') || n.includes('concession')) return 'Negotiation';
    if (n.includes('lead') || n.includes('delegat') || n.includes('vision') || n.includes('inspir')) return 'Leadership';
    if (n.includes('empath') || n.includes('emotion') || n.includes('self-aware') || n.includes('rapport')) return 'EQ';
    if (n.includes('critical') || n.includes('analytical') || n.includes('problem') || n.includes('logic') || n.includes('bias')) return 'Problem-Solving';
    if (n.includes('time') || n.includes('priorit') || n.includes('schedul') || n.includes('deadline')) return 'Time';
    if (n.includes('learn') || n.includes('metacog') || n.includes('rapid skill') || n.includes('feedback')) return 'Learning';
    if (n.includes('creativ') || n.includes('divergent') || n.includes('idea') || n.includes('prototype')) return 'Creativity';
    if (n.includes('resilien') || n.includes('stress') || n.includes('adapt') || n.includes('persist') || n.includes('growth')) return 'Resilience';
    if (n.includes('influenc') || n.includes('persuasion') || n.includes('storytell') || n.includes('social-proof')) return 'Influence';
    if (n.includes('speaking') || n.includes('vocal') || n.includes('audience') || n.includes('stage')) return 'Speaking';
    if (n.includes('communicate') || n.includes('listen') || n.includes('articul') || n.includes('eye contact') || n.includes('network')) return 'Social';
    return 'Cognitive';
}

export default function SkillGrid({ skills, todaySkillName }: Props) {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('ALL');

    const startDate = useStore(s => s.startDate);
    const dayN = getDayN(startDate ? new Date(startDate) : new Date());
    const [doneToday, setDoneToday] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDoneToday(localStorage.getItem(`intel_skill_done_${dayN}`) === 'true');
        }
    }, [dayN]);

    const [practiceModalOpen, setPracticeModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timerActive && timeLeft === 0) {
            setTimerActive(false);
            finishPractice();
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startPractice = () => {
        setPracticeModalOpen(true);
        setTimeLeft(300);
        setTimerActive(true);
    };

    const finishPractice = async () => {
        setDoneToday(true);
        localStorage.setItem(`intel_skill_done_${dayN}`, 'true');
        setPracticeModalOpen(false);
        try {
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dayN, text: `Practiced: ${todaySkillName}`, type: 'win' })
            });
        } catch (e) {
            console.error(e);
        }
    };

    const normalized = useMemo(() => skills.map(s => ({
        name: s.name.replace(/\\n\s*/g, ' ').replace(/\n\s*/g, ' ').trim(),
        category: s.category || deriveCategory(s.name),
        microPractice: s.microPractice,
    })), [skills]);

    const filtered = useMemo(() => {
        return normalized.filter(s => {
            const matchesCat = catFilter === 'ALL' || s.category === catFilter;
            const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [normalized, catFilter, search]);

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="filter skills..."
                    className="bg-surface2 border border-[rgba(255,255,255,0.055)] rounded-lg px-3 py-2 font-mono text-[12px] text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors sm:w-52"
                />
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
                    {CATEGORIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setCatFilter(c)}
                            className={`px-2.5 py-1 font-mono text-[9px] rounded tracking-wider whitespace-nowrap transition-all ${catFilter === c ? 'bg-accent text-white' : 'bg-surface2 text-muted2 border border-[rgba(255,255,255,0.055)] hover:text-text'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="columns-2 sm:columns-3 gap-2 space-y-2">
                {filtered.map((skill, i) => {
                    const isToday = todaySkillName && skill.name === todaySkillName;
                    return (
                        <div
                            key={i}
                            className={`break-inside-avoid bg-surface2 rounded-lg p-3 border transition-all ${isToday ? 'border-acid' : 'border-[rgba(255,255,255,0.055)]'}`}
                        >
                            {/* Badge row */}
                            <div className="flex gap-1.5 flex-wrap mb-1.5 justify-between w-full items-start">
                                <div className="flex gap-1.5 flex-wrap">
                                    {isToday && (
                                        <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider ${doneToday ? 'bg-success/20 text-success' : 'bg-acid text-bg'}`}>
                                            {doneToday ? 'DONE TODAY ✓' : 'TODAY'}
                                        </span>
                                    )}
                                    <span className="bg-muted/30 text-muted2 font-mono text-[8px] px-1.5 py-0.5 rounded">
                                        {skill.category}
                                    </span>
                                </div>
                                {isToday && !doneToday && (
                                    <button onClick={startPractice} className="font-mono text-[9px] text-acid border border-acid/50 hover:bg-acid/10 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors mt-[1px]">
                                        <Play className="w-2.5 h-2.5 fill-acid" /> PRACTICE
                                    </button>
                                )}
                            </div>
                            <div className="font-body font-medium text-[12px] text-text leading-snug">{skill.name}</div>
                            {skill.microPractice && (
                                <div className="font-body text-[11px] text-muted2 italic mt-1 leading-relaxed">
                                    {skill.microPractice}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="font-mono text-[11px] text-muted2 text-center py-8">No skills match your filter</div>
            )}

            {/* Practice Modal */}
            {practiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-body">
                    <div className="bg-surface border border-acid/50 w-full max-w-md rounded-xl p-8 relative shadow-2xl text-center">
                        <button onClick={() => { setPracticeModalOpen(false); setTimerActive(false); }} className="absolute top-4 right-4 text-muted2 hover:text-text transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="font-mono text-[10px] text-acid tracking-[2px] uppercase mb-4">Deep Practice</div>
                        <div className="font-bebas text-2xl text-text mb-4">{todaySkillName}</div>

                        <div className="bg-s2 border border-border rounded p-4 mb-8 text-[13px] text-text/90 leading-relaxed italic block">
                            "{filtered.find(s => s.name === todaySkillName)?.microPractice || 'Focus and practice this skill intensively for 5 minutes.'}"
                        </div>

                        <div className="font-mono text-5xl text-acid tracking-widest mb-8 drop-shadow-[0_0_10px_rgba(200,255,0,0.5)]">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <button
                            onClick={() => { setTimerActive(false); finishPractice(); }}
                            className="font-mono text-[10px] text-muted2 border border-border hover:text-text hover:bg-white/5 px-4 py-2 rounded transition-colors uppercase tracking-wider"
                        >
                            Finish Early & Log
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
