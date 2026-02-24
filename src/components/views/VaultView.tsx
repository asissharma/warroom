import { useState } from 'react';
import { PROJECTS, TECH_SPINE, QUESTIONS, BASIC_SKILLS, PAYABLE_SKILLS } from '@/data/learningData';
import { AppState } from '@/hooks/useLearningOS';

interface Props {
    state: AppState;
}

export default function VaultView({ state }: Props) {
    const [activeTab, setActiveTab] = useState<'proj' | 'spine' | 'qs' | 'skills'>('proj');

    const checkStatus = (id: string, idx: number, storedIdx: number) => {
        const isDone = idx < storedIdx && !state.activeTasks.some(t => t.id === id && !t.done);
        const isActive = state.activeTasks.some(t => t.id === id && !t.done);
        return { isDone, isActive };
    };

    const getStatusColor = (isDone: boolean, isActive: boolean) =>
        isDone ? 'text-[var(--accent-green)]' : (isActive ? 'text-[var(--accent-purple)]' : 'text-[var(--text-muted)]');
    const getStatusBox = (isDone: boolean, isActive: boolean) =>
        isDone ? '[ ✓ ]' : (isActive ? '[ O ]' : '[   ]');

    const renderRow = (isDone: boolean, isActive: boolean, meta: string, text: string, isLast = false) => (
        <div className={`relative py-4 pl-6 flex gap-4 items-start vault-row ${isLast ? 'last' : ''}`}>
            <div className={`absolute left-[5px] top-0 w-[2px] z-1 ${isLast ? 'bottom-[50%] bg-gradient-to-b from-[var(--surface-alt)] to-transparent' : 'bottom-0 bg-[var(--surface-alt)]'}`} />

            <div className={`relative z-10 font-mono font-bold text-[0.75rem] -ml-[32px] bg-[var(--surface-color)] px-1.5 py-1 rounded-md shadow-[0_0_10px_currentColor] border border-current inline-flex items-center justify-center ${getStatusColor(isDone, isActive)}`}>
                {getStatusBox(isDone, isActive)}
            </div>

            <div className="flex-1 text-[0.85rem] leading-snug -mt-[2px]">
                <div className="text-[0.7rem] text-[var(--text-muted)] mb-1 font-semibold tracking-wide">{meta}</div>
                {isDone ? <s className="text-[var(--text-muted)]">{text}</s> : (isActive ? <strong>{text}</strong> : <span className="text-[var(--text-muted)]">{text}</span>)}
            </div>
        </div>
    );

    return (
        <div className="animate-in p-0 fade-in duration-200 z-10 relative">
            <div className="sticky top-0 bg-[var(--surface-glass)] backdrop-blur-[var(--glass-blur)] flex border-b border-[var(--glass-border)] z-[5] shadow-[var(--glass-shadow)]">
                {[
                    { id: 'proj', label: '150 Projects' },
                    { id: 'spine', label: 'Tech Spine' },
                    { id: 'qs', label: 'Gauntlet' },
                    { id: 'skills', label: 'Skills' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex-1 py-3 text-center text-[0.8rem] font-semibold border-b-2 transition-colors ${activeTab === t.id ? 'text-[var(--accent-purple)] border-[var(--accent-purple)]' : 'text-[var(--text-muted)] border-transparent'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="p-6 relative">
                {activeTab === 'proj' && PROJECTS.map((p, idx) => {
                    const { isDone, isActive } = checkStatus(p.id, idx, state.pIdx);
                    return <div key={p.id}>{renderRow(isDone, isActive, `${p.ph} // ${p.cat} // Day ${p.d}`, p.name, idx === PROJECTS.length - 1)}</div>;
                })}

                {activeTab === 'spine' && TECH_SPINE.map((ts, idx) => {
                    const { isDone, isActive } = checkStatus(ts.id, idx, state.tIdx);
                    return <div key={ts.id}>{renderRow(isDone, isActive, `Module ${idx + 1}`, ts.focusArea, idx === TECH_SPINE.length - 1)}</div>;
                })}

                {activeTab === 'qs' && (
                    <>
                        <p className="text-[var(--text-muted)] mb-4 text-[0.8rem]">Showing next 100 questions. Keep pulling to unlock more.</p>
                        {QUESTIONS.slice(Math.max(0, state.qIdx - 10), Math.min(QUESTIONS.length, state.qIdx + 110)).map((q, idx) => {
                            const actualIdx = Math.max(0, state.qIdx - 10) + idx;
                            const { isDone, isActive } = checkStatus(q.id, actualIdx, state.qIdx);
                            return <div key={q.id}>{renderRow(isDone, isActive, `Question ${actualIdx + 1} // ${q.weight} XP`, q.text, actualIdx === QUESTIONS.length - 1)}</div>;
                        })}
                    </>
                )}

                {activeTab === 'skills' && (
                    <>
                        <h4 className="mb-2 font-sys font-bold">Foundation Skills</h4>
                        {BASIC_SKILLS.map((s, idx) => (
                            <div key={s.id} className="relative py-4 pl-6 flex gap-4 items-start">
                                <div className={`absolute left-[5px] top-0 w-[2px] bg-[var(--surface-alt)] z-1 bottom-0`} />
                                <div className="text-[0.85rem] text-[var(--text-muted)]">#{idx + 1} {s.name}</div>
                            </div>
                        ))}
                        <h4 className="mt-4 mb-2 font-sys font-bold">Leverage Skills</h4>
                        {PAYABLE_SKILLS.map((s, idx) => (
                            <div key={s.id} className="relative py-4 pl-6 flex gap-4 items-start">
                                <div className={`absolute left-[5px] top-0 w-[2px] bg-[var(--surface-alt)] z-1 ${idx === PAYABLE_SKILLS.length - 1 ? 'bottom-[50%] bg-gradient-to-b from-[var(--surface-alt)] to-transparent' : 'bottom-0'}`} />
                                <div className="text-[0.85rem] text-[var(--text-muted)]">#{idx + 1} {s.name}</div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
