import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Inline types — these are legacy; prefer the API-backed hooks (useSkills, useLog, etc.)
interface LogRecord {
    _id: string;
    dayN: number;
    text: string;
    type: 'win' | 'skip' | 'key' | 'block';
    createdAt: string;
}

interface SkillBars {
    t: number;
    b: number;
    s: number;
    m: number;
    d: number;
}

interface State {
    startDate: string;
    streak: number;
    tasksDone: number;
    doneDays: string[];
    records: LogRecord[];
    bars: SkillBars;
    lvls: SkillBars;
    setStartDate: (d: string) => void;
    markDayDone: (date: string) => void;
    bumpSkill: (key: keyof SkillBars, amount: number) => void;
    addRecord: (r: LogRecord) => void;
    incrementTasks: (by: number) => void;
}

export const useStore = create<State>()(
    persist(
        (set) => ({
            startDate: '',
            streak: 0,
            tasksDone: 0,
            doneDays: [],
            records: [],
            bars: { t: 0, b: 0, s: 0, m: 0, d: 0 },
            lvls: { t: 1, b: 1, s: 1, m: 1, d: 1 },

            setStartDate: (d: string) => set({ startDate: d }),

            markDayDone: (date: string) => set((state: State) => {
                if (state.doneDays.includes(date)) return state;
                let newStreak = state.streak;
                if (state.doneDays.length === 0) {
                    newStreak = 1;
                } else {
                    const lastDateStr = state.doneDays[state.doneDays.length - 1];
                    const lastDate = new Date(lastDateStr);
                    const currentDate = new Date(date);
                    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / 86400000);
                    if (diffDays === 1) {
                        newStreak += 1;
                    } else if (diffDays > 1) {
                        newStreak = 1;
                    }
                }
                return {
                    doneDays: [...state.doneDays, date],
                    streak: newStreak
                };
            }),

            bumpSkill: (key: keyof SkillBars, amount: number) => set((state: State) => {
                let newBar = state.bars[key] + amount;
                let newLvl = state.lvls[key];
                if (newBar >= 100) {
                    newLvl += Math.floor(newBar / 100);
                    newBar = newBar % 100;
                }
                return {
                    bars: { ...state.bars, [key]: newBar },
                    lvls: { ...state.lvls, [key]: newLvl }
                };
            }),

            addRecord: (r: LogRecord) => set((state: State) => {
                const newRecords = [r, ...state.records];
                if (newRecords.length > 150) newRecords.pop();
                return { records: newRecords };
            }),

            incrementTasks: (by: number) => set((state: State) => ({ tasksDone: Math.max(0, state.tasksDone + by) }))
        }),
        {
            name: 'intelosv4'
        }
    )
)
