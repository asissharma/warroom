// ── FILE: components/learn/SkillGrid.tsx ──
'use client';
import { useState, useMemo } from 'react';

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
                            <div className="flex gap-1.5 flex-wrap mb-1.5">
                                {isToday && (
                                    <span className="bg-acid text-bg font-mono text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider">
                                        TODAY
                                    </span>
                                )}
                                <span className="bg-muted/30 text-muted2 font-mono text-[8px] px-1.5 py-0.5 rounded">
                                    {skill.category}
                                </span>
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
        </div>
    );
}
