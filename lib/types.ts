export interface Project {
    day: number;
    phase: string;
    category: string;
    name: string;
    doneMeans: string;
}

export interface SpineArea {
    id: number;
    area: string;
    phase: string;
    weekStart: number;
    weekEnd: number;
    topics: string[];
    microtasks: string[];
    resource: string;
}

export interface Question {
    id: number;
    question: string;
    theme: string;
}

export interface CheckpointNote {
    phaseCompleted: string;
    projectsRange: string;
    selfAssessQuestions: string[];
    recoveryPath: {
        cut: string[];
        keepNoMatterWhat: string[];
        minimumViable: string;
    };
}

export interface DayPlan {
    day: number;
    phase: string;
    reviewDay: boolean;
    checkpointDay: boolean;
    project: Project | null;
    spineArea: {
        area: string;
        topicToday: string;
        microtaskToday: string;
    } | null;
    questionTheme: string | null;
    questionOffset: number | null;
    basicSkill: string | null;
    payable: {
        name: string;
        book: string;
        dailyTask: string;
    } | null;
    checkpointNote: CheckpointNote | null;
    reviewNote?: string;
}

export interface LogRecord {
    id: string;
    text: string;
    type: 'win' | 'skip' | 'key' | 'block';
    date: string;
}

export interface SkillBars {
    t: number;
    b: number;
    s: number;
    m: number;
    d: number;
}
