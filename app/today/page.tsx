'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useDay } from '@/hooks/useDay';
import { getDayN, buildDayPayload } from '@/lib/dayEngine';
import survivalAreasData from '@/data/survival-areas.json';
import CommandBanner from '@/components/today/CommandBanner';
import Timer from '@/components/today/Timer';
import RingProgress from '@/components/today/RingProgress';
import TaskCard from '@/components/today/TaskCard';
import TaskItem from '@/components/today/TaskItem';
import MarkCompleteBtn from '@/components/today/MarkCompleteButton';

export default function Today() {
    const [mounted, setMounted] = useState(false);
    const startDate = useStore(s => s.startDate);
    const setStartDate = useStore(s => s.setStartDate);
    const doneDays = useStore(s => s.doneDays);

    useEffect(() => {
        setMounted(true);
        if (!startDate) {
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [startDate, setStartDate]);

    const startStr = startDate || new Date().toISOString().split('T')[0];
    const startObj = new Date(startStr);
    const calculatedDayN = getDayN(startObj);
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
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();

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

    return (
        /* ── Cockpit Shell ── fixed full-viewport, nothing outer-scrolls */
        <div className="h-[100dvh] overflow-hidden flex flex-col content-z">

            {/* ── UNIFIED HEADER: Status + Command Banner + Actions ── */}
            <div className="shrink-0 px-4 pt-4 pb-2 border-b border-borderHi bg-surface shadow-sm z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <span className="font-bebas text-lg tracking-widest text-text">INTEL·OS</span>
                        <div className="flex items-center gap-2 font-mono text-[10px] bg-bg px-2 py-1 rounded">
                            <span className="text-accent font-bold">DAY {dayN}</span>
                            <span className="text-muted2">· {day.phase?.toUpperCase()}</span>
                        </div>
                        {carriedCount > 0 && <span className="text-warning font-mono text-[10px]">↻ {carriedCount} carried</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="font-mono text-[10px] text-text bg-bg px-2 py-1 rounded border border-border">
                            <span className={pct === 100 ? 'text-success font-bold' : ''}>⚡ {completedCount}/{totalCount}</span>
                        </div>
                        <div className="w-[120px]">
                            <MarkCompleteBtn dayN={dayN} allDone={allDone} />
                        </div>
                    </div>
                </div>
                <CommandBanner project={day.project} dayN={dayN} phase={day.phase} />
            </div>

            {/* ── MAIN GRID ── fills remaining space */}
            <div className="flex-1 overflow-hidden flex flex-col px-4 py-3 min-h-0 bg-bg">

                {/* TASK GRID: 1 Scrollable Container holding 2 columns */}
                <div className="flex-1 overflow-y-auto scrollbar-thin pb-24 pr-2 -mr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                        {/* LEFT TASK COL: Tech + Mastery */}
                        <div className="flex flex-col gap-4">
                            {!day.isReviewDay ? (
                                <>
                                    <TaskCard title="Tech Track" subtitle={day.spineArea?.area} dotColor="accent" compact>
                                        <TaskItem
                                            isMission
                                            text={`MT1: ${day.microtasksToday?.[0] || 'Review'}`}
                                            duration="30M"
                                            taskId={`tech_micro_0_D${dayN}`}
                                            completed={isDone(`tech_micro_0_D${dayN}`)}
                                            onToggle={toggleTask}
                                            expandedContent={<><div className="text-accent mb-1 font-mono text-[10px] uppercase">Topic: {day.topicToday}</div><div className="text-text/80">{whyFor(day.spineArea?.area)}</div></>}
                                        />
                                        <TaskItem
                                            isMission
                                            text={`MT2: ${day.microtasksToday?.[1] || 'Practice'}`}
                                            duration="45M"
                                            taskId={`tech_micro_1_D${dayN}`}
                                            completed={isDone(`tech_micro_1_D${dayN}`)}
                                            onToggle={toggleTask}
                                            expandedContent={<><div className="text-accent mb-1 font-mono text-[10px] uppercase">Topic: {day.topicToday}</div><div className="text-text/80">{whyFor(day.spineArea?.area)}</div></>}
                                        />
                                        <TaskItem
                                            text={`MT3: ${day.microtasksToday?.[2] || 'Review'}`}
                                            taskId={`tech_micro_2_D${dayN}`}
                                            completed={isDone(`tech_micro_2_D${dayN}`)}
                                            onToggle={toggleTask}
                                            expandedContent={<><div className="text-accent mb-1 font-mono text-[10px] uppercase">Topic: {day.topicToday}</div><div className="text-text/80">{whyFor(day.spineArea?.area)}</div></>}
                                        />
                                    </TaskCard>

                                    <TaskCard title="Mastery Gate" subtitle={`Theme: ${day.spineArea?.questionTheme || 'Any'}`} dotColor="info" compact>
                                        {day.questions?.map((q, i) => (
                                            <TaskItem
                                                key={i}
                                                isMission
                                                text={`Q${q.id}: ${q.question}`}
                                                taskId={`mastery_Q${q.id}_D${dayN}`}
                                                completed={isDone(`mastery_Q${q.id}_D${dayN}`)}
                                                onToggle={toggleTask}
                                                expandedContent={<><span className="inline-block px-1.5 py-0.5 rounded bg-surface2 text-muted2 mr-2 mb-2 text-[10px] font-mono">Diff: {q.difficulty || 2}</span><span className="text-text/80 text-xs block">Theme: {q.theme}. Think about {day.spineArea?.area}.</span></>}
                                            />
                                        ))}
                                    </TaskCard>
                                </>
                            ) : (
                                <TaskCard title="Weekly Review" subtitle="Integration Check" dotColor="warning" compact>
                                    <TaskItem isMission text="Review all projects built this week" duration="45M" taskId={`tech_review_1_D${dayN}`} completed={isDone(`tech_review_1_D${dayN}`)} onToggle={toggleTask} />
                                    <TaskItem isMission text="Fix 1 weak point in codebase" duration="60M" taskId={`tech_review_2_D${dayN}`} completed={isDone(`tech_review_2_D${dayN}`)} onToggle={toggleTask} />
                                    <TaskItem isMission text="Blind test: answer hardest 3 Qs" duration="30M" taskId={`tech_review_D${dayN}`} completed={isDone(`tech_review_D${dayN}`)} onToggle={toggleTask} />
                                </TaskCard>
                            )}
                        </div>

                        {/* RIGHT TASK COL: Build + Human */}
                        <div className="flex flex-col gap-4">
                            {day.project && (
                                <TaskCard title="Build Track" subtitle={day.project.category} dotColor="danger" compact>
                                    <TaskItem isMission text={`Build: ${day.project.name}`} duration="90M" taskId={`build_main_D${dayN}`} completed={isDone(`build_main_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">Done: {day.project.doneMeans}</div>} />
                                    <TaskItem text="git commit: explain what and why" taskId={`build_commit_D${dayN}`} completed={isDone(`build_commit_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">Commit your daily progress to build a reliable history.</div>} />
                                    <TaskItem text="Log the hardest part (one sentence)" taskId={`build_reflect_D${dayN}`} completed={isDone(`build_reflect_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">End-of-day reflections solidify learning.</div>} />
                                </TaskCard>
                            )}

                            {day.payable && (
                                <TaskCard title="Human Track" subtitle={`Basic + Payable`} dotColor="success" compact>
                                    <TaskItem isMission text={`Basic Skill: ${day.basicSkill?.name} — 15 min`} duration="15M" taskId={`human_skill_D${dayN}`} completed={isDone(`human_skill_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">{day.basicSkill?.microPractice}</div>} />
                                    <TaskItem isMission text={`Payable Skill: Read '${day.payable.books?.[0]?.title || 'Book'}'`} duration="30M" taskId={`human_payable_D${dayN}`} completed={isDone(`human_payable_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">Core Chapter: {day.payable.books?.[0]?.coreChapter || 'N/A'}. {day.payable.weeklyExercise}</div>} />
                                </TaskCard>
                            )}

                            {day.isCheckpointDay && (
                                <TaskCard title="Phase Checkpoint" subtitle="Critical" badge="CRITICAL" badgeColor="bg-danger" dotColor="danger" compact>
                                    <div className="p-3 space-y-2 text-[12px] font-body text-text/90">
                                        <div className="text-acid font-mono text-[9px] uppercase tracking-wider mb-2">Self Assessment</div>
                                        <p>Are you ready for the next phase?</p>
                                        <p>Can you explain everything from memory?</p>
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
