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

    if (loading) return <div className="p-8 text-center text-muted2 font-mono text-sm">LOADING SECURE SIGNAL...</div>;
    if (error || !day) return <div className="p-8 text-center text-danger font-mono text-sm">COMMUNICATION FAILED.</div>;

    const dayN = day.dayN;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

    const isDone = (id: string) => day.completedTaskIds.includes(id);

    // Calculate dynamic RingProgress
    // We count tasks dynamically based on what's rendered
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

    return (
        <div className="max-w-3xl mx-auto pb-24 px-4 pt-8">
            <div className="flex items-center space-x-4 mb-8">
                <Timer />
                <div className="bg-surface border border-border rounded-lg p-4 flex justify-center items-center shrink-0 w-[120px]">
                    <RingProgress completed={completedCount} total={totalCount || 1} />
                </div>
            </div>
            <CommandBanner project={day.project} dayN={dayN} phase={day.phase} />

            <div className="font-mono text-[11px] text-muted2 mb-4 flex justify-between items-center">
                <span>{dateStr}</span>
                <span>↻ {carriedCount} carried · ⚡ {completedCount}/{totalCount || 1} done · 🔥 Streak: 1</span>
            </div>

            {!day.isReviewDay && (
                <>
                    <TaskCard title="Tech Track" subtitle={day.spineArea?.area} dotColor="accent">
                        <TaskItem
                            isMission
                            text={`Microtask 1: ${day.microtasksToday?.[0] || 'Review'}`}
                            duration="30M"
                            taskId={`tech_micro_0_D${dayN}`}
                            completed={isDone(`tech_micro_0_D${dayN}`)}
                            onToggle={toggleTask}
                            expandedContent={<><div className="text-accent mb-1 font-mono text-[10px] uppercase">Topic: {day.topicToday}</div><div className="text-text/80">{survivalAreasData.find((a: any) => a.area === day.spineArea?.area)?.why || 'Fundamental building block for distributed systems.'}</div></>}
                        />
                        <TaskItem
                            isMission
                            text={`Microtask 2: ${day.microtasksToday?.[1] || 'Practice'}`}
                            duration="45M"
                            taskId={`tech_micro_1_D${dayN}`}
                            completed={isDone(`tech_micro_1_D${dayN}`)}
                            onToggle={toggleTask}
                            expandedContent={<><div className="text-accent mb-1 font-mono text-[10px] uppercase">Topic: {day.topicToday}</div><div className="text-text/80">{survivalAreasData.find((a: any) => a.area === day.spineArea?.area)?.why || 'Fundamental building block for distributed systems.'}</div></>}
                        />
                        <TaskItem
                            text={`Microtask 3 (Review): ${day.microtasksToday?.[2] || 'Explain concepts purely without notes'}`}
                            taskId={`tech_micro_2_D${dayN}`}
                            completed={isDone(`tech_micro_2_D${dayN}`)}
                            onToggle={toggleTask}
                            expandedContent={<><div className="text-accent mb-1 font-mono text-[10px] uppercase">Topic: {day.topicToday}</div><div className="text-text/80">{survivalAreasData.find((a: any) => a.area === day.spineArea?.area)?.why || 'Fundamental building block for distributed systems.'}</div></>}
                        />
                    </TaskCard>

                    {day.project && (
                        <TaskCard title="Build Track" subtitle={day.project.category} dotColor="danger">
                            <TaskItem isMission text={`Build: ${day.project.name} — ${day.project.doneMeans}`} duration="90M" taskId={`build_main_D${dayN}`} completed={isDone(`build_main_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">Done Condition: {day.project.doneMeans}</div>} />
                            <TaskItem text="git commit: explain what and why" taskId={`build_commit_D${dayN}`} completed={isDone(`build_commit_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">Commit your daily progress to build a reliable history.</div>} />
                            <TaskItem text="Log the hardest part (one sentence)" taskId={`build_reflect_D${dayN}`} completed={isDone(`build_reflect_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">End-of-day reflections solidify learning and highlight architectural blind spots.</div>} />
                        </TaskCard>
                    )}

                    <TaskCard title="Mastery Gate" subtitle={`Theme: ${day.spineArea?.questionTheme || 'Any'}`} dotColor="info">
                        {day.questions && day.questions.map((q, i) => (
                            <TaskItem key={i} isMission text={`Q${q.id}: ${q.question}`} taskId={`mastery_Q${q.id}_D${dayN}`} completed={isDone(`mastery_Q${q.id}_D${dayN}`)} onToggle={toggleTask} expandedContent={<><span className="inline-block px-1.5 py-0.5 rounded bg-surface2 text-muted2 mr-2 mb-2 text-[10px] font-mono">Diff: {q.difficulty || 2}</span><span className="text-text/80 text-xs block">Theme: {q.theme}. Hint: Think about related concepts in {day.spineArea?.area}.</span></>} />
                        ))}
                    </TaskCard>

                    {day.payable && (
                        <TaskCard title="Human Track" subtitle={`${day.basicSkill?.name || 'Soft'} + ${day.payable.name}`} dotColor="success">
                            <TaskItem isMission text={`Skill: ${day.basicSkill?.name} — 15 min focus`} duration="15M" taskId={`human_skill_D${dayN}`} completed={isDone(`human_skill_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">{day.basicSkill?.microPractice}</div>} />
                            <TaskItem isMission text={`Read: '${day.payable.books?.[0]?.title || 'Book'}' - weekly exercise`} duration="30M" taskId={`human_payable_D${dayN}`} completed={isDone(`human_payable_D${dayN}`)} onToggle={toggleTask} expandedContent={<div className="text-text/80 text-xs">Core Chapter focus: {day.payable.books?.[0]?.coreChapter || 'N/A'}. {day.payable.weeklyExercise}</div>} />
                        </TaskCard>
                    )}
                </>
            )}

            {day.isReviewDay && (
                <TaskCard title="Weekly Review" subtitle="Integration Check" dotColor="warning">
                    <div className="p-4 text-[13px] text-text font-body italic leading-relaxed bg-s2 border-l-2 border-warning m-3 rounded">
                        Integration Check: review the week
                    </div>
                    <TaskItem isMission text="Review all projects built this week" duration="45M" taskId={`tech_review_1_D${dayN}`} completed={isDone(`tech_review_1_D${dayN}`)} onToggle={toggleTask} />
                    <TaskItem isMission text="Identify and fix 1 weak point in codebase" duration="60M" taskId={`tech_review_2_D${dayN}`} completed={isDone(`tech_review_2_D${dayN}`)} onToggle={toggleTask} />
                    <TaskItem isMission text="Blind test: answer the hardest 3 questions from this week" duration="30M" taskId={`tech_review_D${dayN}`} completed={isDone(`tech_review_D${dayN}`)} onToggle={toggleTask} />
                </TaskCard>
            )}

            {day.isCheckpointDay && (
                <TaskCard title="Phase Checkpoint" subtitle="Critical" badge="CRITICAL" badgeColor="bg-danger" dotColor="danger">
                    <div className="p-4 space-y-4">
                        <h4 className="text-acid font-mono text-[10px] uppercase">Self Assessment</h4>
                        <ul className="list-decimal pl-4 space-y-2 text-[13px] font-body text-text/90">
                            <li>Are you ready for the next phase?</li>
                        </ul>
                    </div>
                </TaskCard>
            )}

            <TaskCard title="End of Day" subtitle="Close the loop" dotColor="warning">
                <TaskItem text="Commit and push all code" />
                <TaskItem text="Write one entry in Log" />
                <TaskItem text="Clear desk & close tabs" />
                <div className="p-3">
                    <MarkCompleteBtn dayN={dayN} allDone={allDone} />
                </div>
            </TaskCard>
        </div>
    )
}
