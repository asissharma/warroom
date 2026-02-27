// ── FILE: components/learn/LearnNav.tsx ──
'use client';
import { useEffect, useState } from 'react';

const SECTIONS = [
    { id: 'curriculum', label: 'CURRICULUM' },
    { id: 'briefings', label: 'BRIEFINGS' },
    { id: 'skills', label: 'SKILLS' },
    { id: 'courses', label: 'COURSES' },
];

export default function LearnNav() {
    const [active, setActive] = useState('curriculum');

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActive(id); },
                { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    return (
        <div className="sticky top-[52px] z-40 backdrop-blur-xl bg-bg/90 border-b border-[rgba(255,255,255,0.055)] mb-6">
            <div className="max-w-[760px] mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar py-2">
                {SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`px-3 py-1.5 font-mono text-[10px] tracking-[2px] rounded-lg whitespace-nowrap transition-all ${active === s.id ? 'bg-accent text-white' : 'text-muted2 hover:text-text'}`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
