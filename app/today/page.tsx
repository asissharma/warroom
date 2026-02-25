'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getDayN, getDayData, getQuestionsForDay } from '@/lib/getDayData';
import CommandBanner from '@/components/CommandBanner';
import Timer from '@/components/Timer';
import RingProgress from '@/components/RingProgress';
import TaskCard from '@/components/TaskCard';
import TaskItem from '@/components/TaskItem';
import MarkCompleteBtn from '@/components/MarkCompleteBtn';

export default function Today() {
    const [mounted, setMounted] = useState(false);
    const startDate = useStore(s => s.startDate);
    const setStartDate = useStore(s => s.setStartDate);

    useEffect(() => {
        if (!startDate) {
            setStartDate(new Date().toISOString().split('T')[0]);
        }
        setMounted(true);
    }, [startDate, setStartDate]);

    if (!mounted) return null;

    const realStart = startDate || new Date().toISOString().split('T')[0];
    const dayN = getDayN(realStart);
    const day = getDayData(dayN);
    const questions = getQuestionsForDay(dayN);

    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

    return (
        <div className="max-w-[680px] mx-auto px-4 pb-16">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent text-white font-display text-xl px-3 py-1 rounded-md tracking-wider">
                        DAY {dayN}/180
                    </div>
                    <div className="font-mono text-[11px] text-muted2">{dateStr}</div>
                </div>
                <div className="font-mono text-[11px] text-text bg-surface border border-border px-2 py-1 rounded uppercase">
                    {day.phase}
                </div>
            </div>

            <div className="flex h-1.5 w-full bg-s2 rounded-full mb-6 overflow-hidden space-x-0.5">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`flex-1 ${i === 0 ? 'bg-success' : i === 1 ? 'bg-accent border-r border-accent' : 'bg-transparent border border-borderHi'}`} />
                ))}
            </div>

            <CommandBanner project={day.project} dayN={dayN} phase={day.phase} />

            <div className="flex items-center space-x-4 mb-8">
                <Timer />
                <div className="bg-surface border border-border rounded-lg p-4 flex justify-center items-center shrink-0 w-[120px]">
                    <RingProgress completed={45} total={100} />
                </div>
            </div>

            {!day.reviewDay && (
                <>
                    <TaskCard title="Tech Track" subtitle={day.spineArea?.area} dotColor="accent">
                        <TaskItem isMission text={`Topic: ${day.spineArea?.topicToday}`} duration="30M" />
                        <TaskItem isMission text={`Task: ${day.spineArea?.microtaskToday}`} duration="45M" />
                        <TaskItem text={`Review: ${day.spineArea?.topicToday} — explain without notes`} />
                    </TaskCard>

                    {day.project && (
                        <TaskCard title="Build Track" subtitle={day.project.category} dotColor="danger">
                            <TaskItem isMission text={`Build: ${day.project.name} — ${day.project.doneMeans}`} duration="90M" />
                            <TaskItem text="git commit: explain what and why" />
                            <TaskItem text="Log the hardest part (one sentence)" />
                        </TaskCard>
                    )}

                    <TaskCard title="Mastery Gate" subtitle={`Theme: ${day.questionTheme || 'Any'}`} dotColor="info">
                        {questions.map((q, i) => (
                            <TaskItem key={i} isMission text={`Q${q.id}: ${q.question}`} />
                        ))}
                        <div className="p-3 text-[10px] text-muted2 font-mono italic">
                            Solve offline or mentally. Ensure absolute clarity.
                        </div>
                    </TaskCard>

                    {day.payable && (
                        <TaskCard title="Human Track" subtitle={`${day.basicSkill || 'Soft'} + ${day.payable.name}`} dotColor="success">
                            <TaskItem isMission text={`Skill: ${day.basicSkill} — 15 min focus`} duration="15M" />
                            <TaskItem isMission text={`Read: '${day.payable.book}' - ${day.payable.dailyTask}`} duration="30M" />
                        </TaskCard>
                    )}
                </>
            )}

            {day.reviewDay && (
                <TaskCard title="Weekly Review" subtitle="Integration Check" dotColor="warning">
                    <div className="p-4 text-[13px] text-text font-body italic leading-relaxed bg-s2 border-l-2 border-warning m-3 rounded">
                        {day.reviewNote}
                    </div>
                    <TaskItem isMission text="Review all projects built this week" duration="45M" />
                    <TaskItem isMission text="Identify and fix 1 weak point in codebase" duration="60M" />
                    <TaskItem isMission text="Blind test: answer the hardest 3 questions from this week" duration="30M" />
                </TaskCard>
            )}

            {day.checkpointDay && day.checkpointNote && (
                <TaskCard title="Phase Checkpoint" subtitle={day.checkpointNote.phaseCompleted} badge="CRITICAL" badgeColor="bg-danger" dotColor="danger">
                    <div className="p-4 space-y-4">
                        <h4 className="text-acid font-mono text-[10px] uppercase">Self Assessment</h4>
                        <ul className="list-decimal pl-4 space-y-2 text-[13px] font-body text-text/90">
                            {day.checkpointNote.selfAssessQuestions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                </TaskCard>
            )}

            <TaskCard title="End of Day" subtitle="Close the loop" dotColor="warning">
                <TaskItem text="Commit and push all code" />
                <TaskItem text="Write one entry in Log" />
                <TaskItem text="Clear desk & close tabs" />
                <div className="p-3">
                    <MarkCompleteBtn dayN={dayN} />
                </div>
            </TaskCard>
        </div>
    )
}
