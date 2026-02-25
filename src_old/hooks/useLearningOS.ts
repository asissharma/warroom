import { useState, useEffect, useCallback } from 'react';
import { PROJECTS, TOPICS, QUESTIONS, BASIC_SKILLS } from '@/data/learningData';

const KEY = 'LOS_V4_STATE';

export type Task = {
    id: string;
    type: string;
    title: string;
    desc: string;
    done: boolean;
    isSrs?: boolean;
};

export type AppState = {
    start: string;
    activeTasks: Task[];
    log: any[];
    srs: Record<string, any>;
    xp: { total: number; level: number; breakdown: Record<string, number> };
    streak: { current: number; max: number; lastDate: string | null };
    qIdx: number;
    pIdx: number;
    tIdx: number;
    sIdx: number;
    payIdx: number;
    stats: { tasksDone: number; projsDone: number; qsDone: number };
    lastClear?: string;
};

const DEFAULT_STATE: AppState = {
    start: new Date().toISOString().split('T')[0],
    activeTasks: [],
    log: [],
    srs: {},
    xp: { total: 0, level: 1, breakdown: {} },
    streak: { current: 0, max: 0, lastDate: null },
    qIdx: 0,
    pIdx: 0,
    tIdx: 0,
    sIdx: 0,
    payIdx: 0,
    stats: { tasksDone: 0, projsDone: 0, qsDone: 0 }
};

export function useLearningOS() {
    const [state, setState] = useState<AppState>(DEFAULT_STATE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const raw = localStorage.getItem(KEY);
        let s: AppState = { ...DEFAULT_STATE };
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                s = { ...s, ...parsed };
            } catch (e) {
                console.error(e);
            }
        }
        setState(s);
        setIsLoaded(true);
    }, []);

    const saveState = useCallback((s: AppState) => {
        setState(s);
        localStorage.setItem(KEY, JSON.stringify(s));
    }, []);

    const getMasterItem = useCallback((id: string) => {
        if (id.startsWith('q_')) return QUESTIONS.find((x: any) => x.id === id);
        if (id.startsWith('p_')) return PROJECTS.find((x: any) => x.id === id);
        if (id.startsWith('ts_')) return TOPICS.find((x: any) => x.id === id);
        if (id.startsWith('bs_') || id.startsWith('ps_')) return BASIC_SKILLS.find((x: any) => x.id === id);
        return null;
    }, []);

    const clearCompletedTasks = useCallback((currentState: AppState) => {
        const s = { ...currentState };
        const todayStr = new Date().toISOString().split('T')[0];

        if (s.lastClear !== todayStr) {
            const now = Date.now();

            // Process done tasks
            s.activeTasks.forEach(t => {
                if (!t.done) return;
                s.log.push({ taskId: t.id, action: 'completed', timestamp: now });

                const item: any = getMasterItem(t.id);
                if (item) {
                    const xpGained = item.weight || 10;
                    const cat = item.category || item.cat || 'General';

                    s.xp.total += xpGained;
                    if (!s.xp.breakdown[cat]) s.xp.breakdown[cat] = 0;
                    s.xp.breakdown[cat] += xpGained;
                    s.xp.level = Math.floor(Math.sqrt(s.xp.total / 50)) + 1;

                    if (item.type === 'gauntlet' || item.type === 'tech_spine') {
                        let srsNode = s.srs[t.id];
                        if (!srsNode) {
                            srsNode = { intervalDays: 1, ease: 2.5 };
                        } else {
                            srsNode.intervalDays = Math.ceil(srsNode.intervalDays * srsNode.ease);
                        }
                        srsNode.nextReviewMs = now + (srsNode.intervalDays * 24 * 60 * 60 * 1000);
                        s.srs[t.id] = srsNode;
                    }
                }
            });

            s.activeTasks = s.activeTasks.filter(t => !t.done);

            if (s.streak.lastDate !== todayStr) {
                if (s.streak.lastDate) {
                    const last = new Date(s.streak.lastDate).getTime();
                    const today = new Date(todayStr).getTime();
                    const diffDays = Math.floor(Math.abs(today - last) / (1000 * 3600 * 24));
                    if (diffDays === 1) {
                        s.streak.current += 1;
                    } else {
                        s.streak.current = 1;
                    }
                } else {
                    s.streak.current += 1;
                }

                if (s.streak.current > s.streak.max) s.streak.max = s.streak.current;
                s.streak.lastDate = todayStr;
            }
            s.lastClear = todayStr;
        }
        return s;
    }, [getMasterItem]);

    const checkAndPopulateQueue = useCallback((currentState: AppState) => {
        const s = { ...currentState };
        const counts = { gauntlet: 0, project: 0, tech_spine: 0, basic_skill: 0, payable_skill: 0, srs: 0 };

        s.activeTasks.forEach(t => {
            if (!t.done) {
                if (t.isSrs) counts.srs++;
                else counts[t.type as keyof typeof counts]++;
            }
        });

        const now = Date.now();
        let updated = false;

        // 1. SRS
        const dueSrsIds = Object.keys(s.srs).filter(id => s.srs[id].nextReviewMs <= now);
        for (let id of dueSrsIds) {
            if (counts.srs >= 3) break;
            if (!s.activeTasks.some(t => t.id === id && !t.done)) {
                const item: any = getMasterItem(id);
                if (item) {
                    s.activeTasks.push({ id: item.id, type: item.type, title: item.text || item.name || item.focusArea, desc: `🧠 SRS Review • Lvl ${item.difficulty || 1}`, done: false, isSrs: true });
                    counts.srs++;
                    updated = true;
                    s.srs[id].nextReviewMs = now + (12 * 60 * 60 * 1000); // temp bump
                }
            }
        }

        // 2. Gauntlet
        while (counts.gauntlet < 5 && s.qIdx < (QUESTIONS?.length || 0)) {
            let q: any = QUESTIONS[s.qIdx];
            if (!s.srs[q.id]) {
                s.activeTasks.push({ id: q.id, type: q.type, title: q.text, desc: `${q.category} // ${q.weight} XP`, done: false });
                counts.gauntlet++; updated = true;
            }
            s.qIdx++;
        }

        // 3. Project
        while (counts.project < 1 && s.pIdx < (PROJECTS?.length || 0)) {
            let p: any = PROJECTS[s.pIdx];
            s.activeTasks.push({ id: p.id, type: p.type, title: p.name, desc: `${p.cat} // Day ${p.d} // ${p.weight} XP`, done: false });
            s.pIdx++; counts.project++; updated = true;
        }

        // 4. Tech spine
        while (counts.tech_spine < 1 && s.tIdx < (TOPICS?.length || 0)) {
            let ts: any = TOPICS[s.tIdx];
            s.activeTasks.push({ id: ts.id, type: 'tech_spine', title: ts.text, desc: ts.sub || `Module ${s.tIdx + 1}`, done: false });
            s.tIdx++; counts.tech_spine++; updated = true;
        }

        // 5. Basic Skills
        while (counts.basic_skill < 1 && s.sIdx < (BASIC_SKILLS?.filter((sk: any) => sk.id.startsWith('bs_')).length || 0)) {
            let bs: any = BASIC_SKILLS.filter((sk: any) => sk.id.startsWith('bs_'))[s.sIdx];
            s.activeTasks.push({ id: bs.id, type: 'basic_skill', title: bs.name, desc: 'Cognitive Foundation', done: false });
            s.sIdx++; counts.basic_skill++; updated = true;
        }

        // 6. Payable
        while (counts.payable_skill < 1 && s.payIdx < (BASIC_SKILLS?.filter((sk: any) => sk.id.startsWith('ps_')).length || 0)) {
            let ps: any = BASIC_SKILLS.filter((sk: any) => sk.id.startsWith('ps_'))[s.payIdx];
            s.activeTasks.push({ id: ps.id, type: 'payable_skill', title: ps.name, desc: 'High-Leverage Skill', done: false });
            s.payIdx++; counts.payable_skill++; updated = true;
        }

        return { updated, newState: s };
    }, [getMasterItem]);

    // Run initial pipeline when storage is loaded
    useEffect(() => {
        if (isLoaded) {
            let finalState = clearCompletedTasks(state);
            let { updated, newState } = checkAndPopulateQueue(finalState);
            if (updated || finalState.lastClear !== state.lastClear) {
                saveState(newState);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    const pullMoreWork = () => {
        const s = { ...state };
        for (let i = 0; i < 3; i++) {
            if (s.qIdx < (QUESTIONS?.length || 0)) {
                let q: any = QUESTIONS[s.qIdx];
                s.activeTasks.push({ id: q.id, type: q.type, title: q.text, desc: `${q.category} // ${q.weight} XP`, done: false });
                s.qIdx++;
            }
        }
        saveState(s);
    };

    const toggleTask = (index: number) => {
        const s = { ...state };
        const t = s.activeTasks[index];
        t.done = !t.done;

        if (t.done) {
            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate([10, 30, 10]);
            s.stats.tasksDone++;
            if (t.type === 'gauntlet') s.stats.qsDone++;
            if (t.type === 'project') s.stats.projsDone++;
        } else {
            s.stats.tasksDone--;
            if (t.type === 'gauntlet') s.stats.qsDone--;
            if (t.type === 'project') s.stats.projsDone--;
        }
        saveState(s);
    };

    const updateStartDate = (dateStr: string) => {
        saveState({ ...state, start: dateStr });
    };

    const nukeState = () => {
        if (confirm("Confirm extreme data wipe. This destroys queue state forever.")) {
            localStorage.removeItem(KEY);
            window.location.reload();
        }
    };

    return {
        state,
        isLoaded,
        pullMoreWork,
        toggleTask,
        updateStartDate,
        nukeState
    };
}
