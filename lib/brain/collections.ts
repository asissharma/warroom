// lib/brain/collections.ts
// Schema config for all 7 Brain collections.
// Each collection defines: id, label, icon, color tokens, columns, filters, and detail rendering hints.

export type CollectionKey =
    | 'questions'
    | 'projects'
    | 'syllabus'
    | 'skills'
    | 'spine'
    | 'courses'
    | 'survival'

export interface ColumnDef {
    key: string
    label: string
    width: string          // Tailwind width class e.g. 'w-12' or 'flex-1'
    mono?: boolean         // render in JetBrains Mono
    truncate?: boolean
    render?: 'badge' | 'difficulty' | 'number' | 'tags' | 'link' | 'text' | 'phase'
}

export interface FilterDef {
    key: string
    label: string
    type: 'search' | 'select' | 'toggle'
    options?: string[]
}

export interface CollectionConfig {
    key: CollectionKey
    label: string
    singularLabel: string
    emoji: string
    // Tailwind color token prefixes (base / glow / muted)
    colorBase: string      // e.g. 'q-base' → bg-q-base
    colorGlow: string
    colorMuted: string
    description: string
    columns: ColumnDef[]
    filters: FilterDef[]
    primaryKey: string     // field used as unique row ID
    titleField: string     // field to show as page title
    subtitleField?: string
}

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
    questions: {
        key: 'questions',
        label: 'Questions',
        singularLabel: 'Question',
        emoji: '⚡',
        colorBase: 'q-base',
        colorGlow: 'q-glow',
        colorMuted: 'q-muted',
        description: '1,510 real-world engineering questions. Your mastery gate.',
        primaryKey: 'id',
        titleField: 'question',
        subtitleField: 'theme',
        columns: [
            { key: 'id', label: '#', width: 'w-12', mono: true, render: 'number' },
            { key: 'question', label: 'Question', width: 'flex-1', truncate: true, render: 'text' },
            { key: 'theme', label: 'Theme', width: 'w-36', render: 'badge' },
            { key: 'difficulty', label: 'Diff', width: 'w-20', render: 'difficulty' },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
            {
                key: 'theme', label: 'Theme', type: 'select', options: [
                    'System Design', 'Networking', 'Security', 'Databases', 'Performance',
                    'Concurrency', 'API Design', 'DevOps', 'Debugging', 'ML/AI',
                ]
            },
            { key: 'difficulty', label: 'Difficulty', type: 'toggle', options: ['1', '2', '3'] },
        ],
    },

    projects: {
        key: 'projects',
        label: 'Projects',
        singularLabel: 'Project',
        emoji: '🔨',
        colorBase: 'p-base',
        colorGlow: 'p-glow',
        colorMuted: 'p-muted',
        description: '150 build projects — one per day. Your proof of work.',
        primaryKey: 'day',
        titleField: 'name',
        subtitleField: 'category',
        columns: [
            { key: 'day', label: 'Day', width: 'w-14', mono: true, render: 'number' },
            { key: 'phase', label: 'Phase', width: 'w-32', render: 'phase' },
            { key: 'category', label: 'Category', width: 'w-36', render: 'badge' },
            { key: 'name', label: 'Project', width: 'flex-1', truncate: true, render: 'text' },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
            {
                key: 'phase', label: 'Phase', type: 'select', options: [
                    'Foundation', 'Distributed', 'Cloud', 'Security', 'ML/AI', 'Advanced Frontend', 'Architecture', 'Capstone',
                ]
            },
            {
                key: 'category', label: 'Category', type: 'select', options: [
                    'CLI & Automation', 'Git & Collaboration', 'JavaScript Core', 'Backend Basics',
                    'Backend Advanced', 'Databases', 'Distributed Systems', 'Observability', 'Performance',
                    'Resilience', 'Containers', 'Kubernetes', 'Cloud Platforms', 'IaC',
                    'App Security', 'Infra Security', 'Compliance', 'Cryptography',
                    'MLOps', 'AI Apps', 'Advanced ML', 'ML Security', 'React Perf',
                ]
            },
        ],
    },

    syllabus: {
        key: 'syllabus',
        label: 'Syllabus',
        singularLabel: 'Syllabus',
        emoji: '📘',
        colorBase: 's-base',
        colorGlow: 's-glow',
        colorMuted: 's-muted',
        description: '10 human mastery programs. Each a book, a practice, a transformation.',
        primaryKey: 'name',
        titleField: 'name',
        subtitleField: 'dayStart',
        columns: [
            { key: 'name', label: 'Syllabus', width: 'flex-1' },
            { key: 'dayStart', label: 'Start', width: 'w-16', mono: true },
            { key: 'dayEnd', label: 'End', width: 'w-16', mono: true },
            { key: 'coreBooks', label: 'Books', width: 'w-20', render: 'number' },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
        ],
    },

    skills: {
        key: 'skills',
        label: 'Skills',
        singularLabel: 'Skill',
        emoji: '🧠',
        colorBase: 'sk-base',
        colorGlow: 'sk-glow',
        colorMuted: 'sk-muted',
        description: '121 human abilities. Cognitive, social, emotional, financial.',
        primaryKey: '_idx',
        titleField: 'name',
        columns: [
            { key: '_idx', label: '#', width: 'w-12', mono: true, render: 'number' },
            { key: 'name', label: 'Skill', width: 'flex-1', render: 'text' },
            { key: 'cluster', label: 'Cluster', width: 'w-36', render: 'badge' },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
            {
                key: 'cluster', label: 'Cluster', type: 'select', options: [
                    'Thinking Core', 'Communication', 'Leadership', 'Emotional Intelligence',
                    'Negotiation', 'Networking', 'Time Management', 'Personal Branding',
                    'Learning Agility', 'Resilience', 'Influence', 'Public Speaking',
                    'Writing', 'Analytical', 'Financial', 'Cultural Intelligence',
                ]
            },
        ],
    },

    spine: {
        key: 'spine',
        label: 'Tech Spine',
        singularLabel: 'Spine Area',
        emoji: '🔗',
        colorBase: 'sp-base',
        colorGlow: 'sp-glow',
        colorMuted: 'sp-muted',
        description: '22 technical knowledge areas spanning the full 26-week arc.',
        primaryKey: 'id',
        titleField: 'area',
        subtitleField: 'phase',
        columns: [
            { key: 'id', label: 'ID', width: 'w-12', mono: true, render: 'number' },
            { key: 'area', label: 'Area', width: 'flex-1', render: 'text' },
            { key: 'phase', label: 'Phase', width: 'w-32', render: 'phase' },
            { key: 'weekStart', label: 'Week', width: 'w-20', mono: true },
            { key: 'topics', label: 'Topics', width: 'w-20', render: 'number' },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
            {
                key: 'phase', label: 'Phase', type: 'select', options: [
                    'Foundation', 'Distributed', 'Cloud', 'Security', 'ML/AI', 'Advanced Frontend', 'Architecture',
                ]
            },
        ],
    },

    courses: {
        key: 'courses',
        label: 'Courses',
        singularLabel: 'Course',
        emoji: '🎓',
        colorBase: 'c-base',
        colorGlow: 'c-glow',
        colorMuted: 'c-muted',
        description: '75 curated resources from MIT, Stanford, Google, and more.',
        primaryKey: 'id',
        titleField: 'name',
        subtitleField: 'provider',
        columns: [
            { key: 'id', label: '#', width: 'w-12', mono: true, render: 'number' },
            { key: 'name', label: 'Course', width: 'flex-1', truncate: true },
            { key: 'provider', label: 'Provider', width: 'w-40', render: 'badge' },
            { key: 'area', label: 'Area', width: 'w-36', render: 'badge' },
            { key: 'weekRecommended', label: 'Week', width: 'w-16', mono: true },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
            {
                key: 'area', label: 'Area', type: 'select', options: [
                    'System Design', 'Distributed Systems', 'Algorithms', 'Python', 'JavaScript',
                    'Databases', 'Cloud', 'Security', 'Observability', 'ML/AI', 'Frontend',
                    'API Design', 'Data Engineering', 'Networking', 'Git', 'Go', 'Rust',
                    'Testing', 'Soft Skills', 'Interview Prep', 'Productivity',
                ]
            },
        ],
    },

    survival: {
        key: 'survival',
        label: 'Survival',
        singularLabel: 'Survival Area',
        emoji: '🛡',
        colorBase: 'sv-base',
        colorGlow: 'sv-glow',
        colorMuted: 'sv-muted',
        description: '7 non-negotiable domains. Urgency-sorted. Master these or be replaced.',
        primaryKey: 'id',
        titleField: 'area',
        subtitleField: 'urgency',
        columns: [
            { key: 'id', label: '#', width: 'w-12', mono: true, render: 'number' },
            { key: 'urgency', label: 'Urgency', width: 'w-28', render: 'badge' },
            { key: 'area', label: 'Area', width: 'flex-1', render: 'text' },
            { key: 'topics', label: 'Topics', width: 'w-20', render: 'number' },
        ],
        filters: [
            { key: 'q', label: 'Search', type: 'search' },
            { key: 'urgency', label: 'Urgency', type: 'toggle', options: ['CRITICAL', 'HIGH', 'MEDIUM'] },
        ],
    },
}

export const COLLECTION_ORDER: CollectionKey[] = [
    'questions', 'projects', 'syllabus', 'skills', 'spine', 'courses', 'survival',
]

// Derive skill clusters from position in the skills array
const SKILL_CLUSTER_MAP: Record<number, string> = {
    0: 'Thinking Core', 1: 'Thinking Core', 2: 'Thinking Core', 3: 'Thinking Core',
    4: 'Thinking Core', 5: 'Thinking Core', 6: 'Thinking Core', 7: 'Thinking Core',
    8: 'Thinking Core', 9: 'Thinking Core', 10: 'Thinking Core', 11: 'Thinking Core',
    12: 'Thinking Core', 13: 'Emotional Intelligence', 14: 'Emotional Intelligence',
    15: 'Communication', 16: 'Communication', 17: 'Communication', 18: 'Communication',
    19: 'Communication', 20: 'Communication',
    21: 'Leadership', 22: 'Leadership', 23: 'Leadership', 24: 'Leadership',
    25: 'Leadership', 26: 'Leadership',
    27: 'Emotional Intelligence', 28: 'Emotional Intelligence', 29: 'Emotional Intelligence',
    30: 'Emotional Intelligence',
    31: 'Thinking Core', 32: 'Thinking Core', 33: 'Thinking Core', 34: 'Thinking Core',
    35: 'Thinking Core',
    36: 'Thinking Core', 37: 'Thinking Core', 38: 'Thinking Core', 39: 'Thinking Core',
    40: 'Thinking Core',
    41: 'Negotiation', 42: 'Negotiation', 43: 'Negotiation', 44: 'Negotiation',
    45: 'Networking', 46: 'Networking', 47: 'Networking', 48: 'Networking', 49: 'Networking',
    50: 'Time Management', 51: 'Time Management', 52: 'Time Management', 53: 'Time Management',
    54: 'Personal Branding', 55: 'Personal Branding', 56: 'Personal Branding',
    57: 'Personal Branding', 58: 'Personal Branding',
    59: 'Learning Agility', 60: 'Learning Agility', 61: 'Learning Agility',
    62: 'Learning Agility', 63: 'Learning Agility',
    64: 'Thinking Core', 65: 'Thinking Core', 66: 'Thinking Core',
    67: 'Resilience', 68: 'Resilience', 69: 'Resilience', 70: 'Resilience', 71: 'Resilience',
    72: 'Influence', 73: 'Influence', 74: 'Influence', 75: 'Influence', 76: 'Influence',
    77: 'Public Speaking', 78: 'Public Speaking', 79: 'Public Speaking',
    80: 'Public Speaking', 81: 'Public Speaking',
    82: 'Writing', 83: 'Writing', 84: 'Writing', 85: 'Writing', 86: 'Writing',
    87: 'Analytical', 88: 'Analytical', 89: 'Analytical', 90: 'Analytical', 91: 'Analytical',
    92: 'Financial', 93: 'Financial', 94: 'Financial', 95: 'Financial', 96: 'Financial',
    97: 'Cultural Intelligence', 98: 'Cultural Intelligence', 99: 'Cultural Intelligence',
    100: 'Cultural Intelligence', 101: 'Cultural Intelligence',
}

export function getSkillCluster(idx: number): string {
    return SKILL_CLUSTER_MAP[idx] ?? 'General'
}
