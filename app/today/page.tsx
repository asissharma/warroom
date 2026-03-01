'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useDay } from '@/hooks/useDay';
import { getDayN } from '@/lib/dayEngine';
import survivalAreasData from '@/data/survival-areas.json';
import CommandBanner from '@/components/today/CommandBanner';
import TaskCard from '@/components/today/TaskCard';
import TaskItem from '@/components/today/TaskItem';
import MarkCompleteBtn from '@/components/today/MarkCompleteButton';

// ── Phase definitions (mirrors dayEngine.ts) ─────────────────────
const PHASES = [
    { name: 'Foundation', dayStart: 1, dayEnd: 30 },
    { name: 'Distributed', dayStart: 31, dayEnd: 50 },
    { name: 'Cloud', dayStart: 51, dayEnd: 70 },
    { name: 'Security', dayStart: 71, dayEnd: 90 },
    { name: 'ML/AI', dayStart: 91, dayEnd: 110 },
    { name: 'Frontend', dayStart: 111, dayEnd: 130 },
    { name: 'Mastery', dayStart: 131, dayEnd: 140 },
    { name: 'Capstone', dayStart: 141, dayEnd: 180 },
];

function getPhaseProgress(dayN: number) {
    const phase = PHASES.find(p => dayN >= p.dayStart && dayN <= p.dayEnd)
        ?? PHASES[PHASES.length - 1];
    const dayInPhase = dayN - phase.dayStart + 1;
    const totalDays = phase.dayEnd - phase.dayStart + 1;
    const phasePct = Math.round((dayInPhase / totalDays) * 100);
    return { phaseName: phase.name, dayInPhase, totalDays, phasePct };
}

// Duration badge helper — maps task type to a human-readable tag
function durationBadge(type: 'tech1' | 'tech2' | 'tech3' | 'build' | 'commit' | 'reflect' | 'mastery' | 'skill' | 'payable' | 'review1' | 'review2' | 'review3') {
    const map: Record<string, string> = {
        tech1: '30M',
        tech2: '45M',
        tech3: '15M',
        build: 'DEEP',
        commit: '5M',
        reflect: '5M',
        mastery: '20M',
        skill: '15M',
        payable: '30M',
        review1: '45M',
        review2: '60M',
        review3: '30M',
    };
    return map[type] ?? '';
}

// Difficulty band label for Mastery Gate
function difficultyBand(dayN: number): string {
    if (dayN <= 60) return 'Easy · Foundational';
    if (dayN <= 120) return 'Medium · Applied';
    return 'Hard · Advanced Design';
}

// Unique microtask verb labels so MT1/MT2/MT3 don't all say the same thing
const MT_VERBS = ['Read & understand', 'Implement a prototype of', 'Review & test'];

export default function Today() {
    const [mounted, setMounted] = useState(false);
    const startDate = useStore(s => s.startDate);
    const setStartDate = useStore(s => s.setStartDate);

    useEffect(() => {
        setMounted(true);
        if (!startDate) {
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [startDate, setStartDate]);

    const startStr = startDate || new Date().toISOString().split('T')[0];
    const startObj = new Date(startStr);
    getDayN(startObj); // keep import usage

    const { data: day, loading, error, toggleTask } = useDay();

    if (!mounted) return null;

    if (loading) return (
        <div className="h-[100dvh] flex items-center justify-center">
            <div className="text-muted2 font-mono text-sm animate-pulse">LOADING SECURE SIGNAL...</div>
        </div>
    );
    if (error || !day) return (
        <div className="h-[100dvh] flex items-center justify-center">
            <div className="text-danger font-mono text-sm">COMMUNICATION FAILED.</div>
        </div>
    );

    const dayN = day.dayN;
    const { phaseName, dayInPhase, totalDays, phasePct } = getPhaseProgress(dayN);

    const isDone = (id: string) => day.completedTaskIds.includes(id);

    let allTaskIds: string[] = [];
    if (!day.isReviewDay) {
        allTaskIds = [
            `tech_micro_0_D${dayN}`,
            `tech_micro_1_D${dayN}`,
            `tech_micro_2_D${dayN}`,
        ];
        if (day.project) {
            allTaskIds.push(`build_main_D${dayN}`, `build_commit_D${dayN}`, `build_reflect_D${dayN}`);
        }
        day.questions.forEach((q) => {
            allTaskIds.push(`mastery_Q${q.id}_D${dayN}`);
        });
        if (day.payable) {
            allTaskIds.push(`human_skill_D${dayN}`, `human_payable_D${dayN}`);
        }
    } else {
        allTaskIds = [
            `tech_review_1_D${dayN}`,
            `tech_review_2_D${dayN}`,
            `tech_review_D${dayN}`
        ];
    }

    const totalCount = allTaskIds.length;
    const completedCount = day.completedTaskIds.filter(id => allTaskIds.includes(id)).length;
    const carriedCount = day.carriedTasks?.length || 0;
    const allDone = totalCount > 0 && completedCount === totalCount;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const whyFor = (area?: string) =>
        (survivalAreasData as any[]).find(a => a.area === area)?.why || 'Fundamental building block for distributed systems.';

    // Build unique microtask text for each slot
    const topicToday = day.topicToday || 'Topic';
    const spineAreaName = day.spineArea?.area || phaseName;
    const microtaskTexts = [
        `${MT_VERBS[0]}: ${topicToday}`,
        `${MT_VERBS[1]}: ${topicToday}`,
        `${MT_VERBS[2]}: ${topicToday} in context of ${spineAreaName}`,
    ];

    // Overall 180-day progress
    const overallPct = Math.round((dayN / 180) * 100);

    return (
        /* ── Cockpit Shell ── */
        <div className="h-[100dvh] overflow-hidden flex flex-col content-z">

            {/* ── UNIFIED HEADER ── */}
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-borderHi bg-surface shadow-sm z-10">

                {/* Row 1: Brand + Day badge + completion count + CTA */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bebas text-lg tracking-widest text-text shrink-0">INTEL·OS</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] bg-bg px-2 py-1 rounded shrink-0">
                            <span className="text-accent font-bold">D{dayN}</span>
                            <span className="text-muted2">·</span>
                            <span className="text-text/70 uppercase">{phaseName}</span>
                        </div>
                        {carriedCount > 0 && (
                            <span className="text-warning font-mono text-[9px] shrink-0">↻ {carriedCount}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="font-mono text-[10px] text-text bg-bg px-2 py-1 rounded border border-border">
                            <span className={pct === 100 ? 'text-success font-bold' : ''}>
                                ⚡ {completedCount}/{totalCount}
                            </span>
                        </div>
                        <div className="w-[110px]">
                            <MarkCompleteBtn dayN={dayN} allDone={allDone} />
                        </div>
                    </div>
                </div>

                {/* Row 2: Phase progress bar */}
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[9px] text-muted2 uppercase tracking-wider">
                            {phaseName} · Day {dayInPhase} of {totalDays}
                        </span>
                        <span className="font-mono text-[9px] text-muted2">
                            {overallPct}% of 180-day journey
                        </span>
                    </div>
                    {/* Phase bar */}
                    <div className="relative h-1.5 bg-surface2 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${phasePct}%` }}
                        />
                    </div>
                </div>

                {/* Row 3: Command Banner */}
                <CommandBanner project={day.project} dayN={dayN} phase={day.phase} />
            </div>

            {/* ── MAIN SCROLL AREA ── */}
            <div className="flex-1 overflow-hidden flex flex-col px-4 py-3 min-h-0 bg-bg">
                <div className="flex-1 overflow-y-auto scrollbar-thin pb-24 pr-2 -mr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                        {/* ── LEFT COL: Tech Track + Mastery Gate ── */}
                        <div className="flex flex-col gap-4">
                            {!day.isReviewDay ? (
                                <>
                                    {/* TECH TRACK */}
                                    <TaskCard
                                        title="Tech Track"
                                        subtitle={spineAreaName}
                                        dotColor="accent"
                                        compact
                                    >
                                        <TaskItem
                                            isMission
                                            text={microtaskTexts[0]}
                                            duration={durationBadge('tech1')}
                                            taskId={`tech_micro_0_D${dayN}`}
                                            completed={isDone(`tech_micro_0_D${dayN}`)}
                                            onToggle={toggleTask}
                                            expandedContent={
                                                <>
                                                    <div className="text-accent mb-1 font-mono text-[10px] uppercase">
                                                        Area: {spineAreaName}
                                                    </div>
                                                    <div className="text-text/80">{whyFor(spineAreaName)}</div>
                                                </>
                                            }
                                        />
                                        <TaskItem
                                            isMission
                                            text={microtaskTexts[1]}
                                            duration={durationBadge('tech2')}
                                            taskId={`tech_micro_1_D${dayN}`}
                                            completed={isDone(`tech_micro_1_D${dayN}`)}
                                            onToggle={toggleTask}
                                            expandedContent={
                                                <>
                                                    <div className="text-accent mb-1 font-mono text-[10px] uppercase">
                                                        Focus: Build something that works, not something perfect.
                                                    </div>
                                                    <div className="text-text/80">{whyFor(spineAreaName)}</div>
                                                </>
                                            }
                                        />
                                        <TaskItem
                                            text={microtaskTexts[2]}
                                            duration={durationBadge('tech3')}
                                            taskId={`tech_micro_2_D${dayN}`}
                                            completed={isDone(`tech_micro_2_D${dayN}`)}
                                            onToggle={toggleTask}
                                            expandedContent={
                                                <>
                                                    <div className="text-accent mb-1 font-mono text-[10px] uppercase">
                                                        Consolidate what you built today.
                                                    </div>
                                                    <div className="text-text/80">Add a comment, write a test, or explain the concept aloud.</div>
                                                </>
                                            }
                                        />
                                    </TaskCard>

                                    {/* MASTERY GATE */}
                                    <TaskCard
                                        title="Mastery Gate"
                                        subtitle={difficultyBand(dayN)}
                                        dotColor="info"
                                        compact
                                    >
                                        {day.questions?.map((q, i) => (
                                            <TaskItem
                                                key={q.id}
                                                isMission
                                                text={`Q${q.id}: ${q.question}`}
                                                duration={durationBadge('mastery')}
                                                taskId={`mastery_Q${q.id}_D${dayN}`}
                                                completed={isDone(`mastery_Q${q.id}_D${dayN}`)}
                                                onToggle={toggleTask}
                                                expandedContent={
                                                    <>
                                                        <span className={`inline-block px-1.5 py-0.5 rounded mr-2 mb-2 text-[10px] font-mono ${q.difficulty === 1 ? 'bg-success/20 text-success' :
                                                            q.difficulty === 2 ? 'bg-warning/20 text-warning' :
                                                                'bg-danger/20 text-danger'
                                                            }`}>
                                                            {q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard'}
                                                        </span>
                                                        <span className="text-text/80 text-xs block">
                                                            Theme: {q.theme}. Answer from memory, no looking up.
                                                        </span>
                                                    </>
                                                }
                                            />
                                        ))}
                                    </TaskCard>
                                </>
                            ) : (
                                /* REVIEW DAY */
                                <TaskCard title="Weekly Review" subtitle="Integration Check" dotColor="warning" compact>
                                    <TaskItem
                                        isMission
                                        text="Review all projects built this week"
                                        duration={durationBadge('review1')}
                                        taskId={`tech_review_1_D${dayN}`}
                                        completed={isDone(`tech_review_1_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={<div className="text-text/80 text-xs">Pick the weakest build. Make it shippable.</div>}
                                    />
                                    <TaskItem
                                        isMission
                                        text="Fix 1 weak point in your codebase"
                                        duration={durationBadge('review2')}
                                        taskId={`tech_review_2_D${dayN}`}
                                        completed={isDone(`tech_review_2_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={<div className="text-text/80 text-xs">One fix fully done &gt; five fixes started.</div>}
                                    />
                                    <TaskItem
                                        isMission
                                        text="Answer your 3 hardest questions cold — no hints"
                                        duration={durationBadge('review3')}
                                        taskId={`tech_review_D${dayN}`}
                                        completed={isDone(`tech_review_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={<div className="text-text/80 text-xs">Write 3 sentences: what's stronger, what's still pretend.</div>}
                                    />
                                </TaskCard>
                            )}
                        </div>

                        {/* ── RIGHT COL: Build Track + Human Track ── */}
                        <div className="flex flex-col gap-4">

                            {/* BUILD TRACK */}
                            {day.project && (
                                <TaskCard title="Build Track" subtitle={day.project.category} dotColor="danger" compact>
                                    <TaskItem
                                        isMission
                                        text={`Build: ${day.project.name}`}
                                        duration={durationBadge('build')}
                                        taskId={`build_main_D${dayN}`}
                                        completed={isDone(`build_main_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={
                                            <div className="text-text/80 text-xs">
                                                <span className="font-mono text-[9px] text-accent uppercase block mb-1">Done means:</span>
                                                {day.project.doneMeans}
                                            </div>
                                        }
                                    />
                                    <TaskItem
                                        text="git commit — explain what and why in the message"
                                        duration={durationBadge('commit')}
                                        taskId={`build_commit_D${dayN}`}
                                        completed={isDone(`build_commit_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={<div className="text-text/80 text-xs">Your commit message should describe the intent, not just the action.</div>}
                                    />
                                    <TaskItem
                                        text="Log the hardest part in one sentence"
                                        duration={durationBadge('reflect')}
                                        taskId={`build_reflect_D${dayN}`}
                                        completed={isDone(`build_reflect_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={<div className="text-text/80 text-xs">One honest sentence. No fluff. This compounds into weekly insights.</div>}
                                    />
                                </TaskCard>
                            )}

                            {/* HUMAN TRACK */}
                            {day.payable && (
                                <TaskCard title="Human Track" subtitle="Basic Skill + Payable" dotColor="success" compact>
                                    <TaskItem
                                        isMission
                                        text={`Basic Skill: ${day.basicSkill?.name}`}
                                        duration={durationBadge('skill')}
                                        taskId={`human_skill_D${dayN}`}
                                        completed={isDone(`human_skill_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={
                                            <div className="text-text/80 text-xs">
                                                <span className="font-mono text-[9px] text-success uppercase block mb-1">Micro-practice:</span>
                                                {day.basicSkill?.microPractice}
                                            </div>
                                        }
                                    />
                                    <TaskItem
                                        isMission
                                        text={`Payable: ${day.payable.name} — ${day.payable.books?.[0]?.title || 'Read 10 pages'}`}
                                        duration={durationBadge('payable')}
                                        taskId={`human_payable_D${dayN}`}
                                        completed={isDone(`human_payable_D${dayN}`)}
                                        onToggle={toggleTask}
                                        expandedContent={
                                            <div className="text-text/80 text-xs">
                                                <span className="font-mono text-[9px] text-success uppercase block mb-1">Weekly exercise:</span>
                                                {day.payable.weeklyExercise}
                                            </div>
                                        }
                                    />
                                </TaskCard>
                            )}

                            {/* PHASE CHECKPOINT */}
                            {day.isCheckpointDay && (
                                <TaskCard
                                    title="Phase Checkpoint"
                                    subtitle="Critical self-assessment"
                                    badge="CRITICAL"
                                    badgeColor="bg-danger"
                                    dotColor="danger"
                                    compact
                                >
                                    <div className="p-3 space-y-2 text-[12px] font-body text-text/90">
                                        <div className="text-acid font-mono text-[9px] uppercase tracking-wider mb-2">
                                            End of {phaseName} Phase
                                        </div>
                                        <p>What can you build today that you couldn't 30 days ago?</p>
                                        <p>What still feels like theory with no hands-on proof?</p>
                                        <p>What did you compress or skip that will hurt you later?</p>
                                    </div>
                                </TaskCard>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
