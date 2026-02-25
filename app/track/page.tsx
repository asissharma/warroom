'use client';
import { useStore } from '@/lib/store';
import WeekGrid from '@/components/WeekGrid';
import SkillBar from '@/components/SkillBar';
import PhaseMap from '@/components/PhaseMap';

export default function Track() {
    const streak = useStore(s => s.streak);
    const tasks = useStore(s => s.tasksDone);

    return (
        <div className="max-w-[680px] mx-auto px-4 pb-16">
            <h1 className="font-display text-3xl tracking-wide mb-6">OPERATIONAL METRICS</h1>

            <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-surface border border-border rounded-lg p-4 flex flex-col justify-center items-center">
                    <span className="font-mono text-[10px] text-muted2 uppercase mb-1">Streak</span>
                    <span className="font-display text-4xl text-accent">{streak}</span>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 flex flex-col justify-center items-center">
                    <span className="font-mono text-[10px] text-muted2 uppercase mb-1">Tasks Done</span>
                    <span className="font-display text-4xl text-success">{tasks}</span>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 flex flex-col justify-center items-center">
                    <span className="font-mono text-[10px] text-muted2 uppercase mb-1">Phase</span>
                    <span className="font-display text-2xl text-acid mt-1 text-center leading-none">01</span>
                </div>
            </div>

            <div className="mb-10">
                <h2 className="font-mono text-[11px] text-muted2 uppercase tracking-widest mb-2">Weekly Consistency</h2>
                <WeekGrid />
            </div>

            <div className="mb-10">
                <h2 className="font-mono text-[11px] text-muted2 uppercase tracking-widest mb-4">Tech Spine Progress</h2>
                <div className="bg-surface border border-border p-5 rounded-lg">
                    <SkillBar label="Systems Design" barKey="s" color="bg-[#c8ff00]" />
                    <SkillBar label="Backend & APIs" barKey="b" color="bg-[#38bdf8]" />
                    <SkillBar label="Infrastructure & DevOps" barKey="d" color="bg-[#7c5cfc]" />
                    <SkillBar label="Security" barKey="t" color="bg-[#ff3b4e]" />
                    <SkillBar label="Data & ML" barKey="m" color="bg-[#ff8c00]" />
                </div>
            </div>

            <div className="mb-10">
                <h2 className="font-mono text-[11px] text-muted2 uppercase tracking-widest mb-4">PROJECT_DANCE Phases</h2>
                <PhaseMap projects={[]} />
            </div>
        </div>
    )
}
