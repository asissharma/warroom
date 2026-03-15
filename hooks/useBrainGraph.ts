import useSWR from 'swr';
import { useMemo } from 'react';
import { IIntelNode } from '@/lib/models/IntelNode';
import projectsData from '@/data/projects.json';
import questionsData from '@/data/questions.json';
import techSpineData from '@/data/tech-spine.json';
import skillsData from '@/data/skills.json';
import survivalData from '@/data/survival-areas.json';

const fetcher = (url: string) =>
    fetch(url).then(res => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    });

interface GraphResponse {
    nodes: IIntelNode[];
    edges: any[];
}

// Phase → color mapping used by WorkNode
export const PHASE_COLORS: Record<string, string> = {
    Foundation: '#4ADE80',
    Distributed: '#60A5FA',
    Cloud: '#A78BFA',
    Security: '#F87171',
    'ML/AI': '#FBBF24',
    'Advanced Frontend': '#F472B6',
    Mastery: '#FB923C',
    Capstone: '#34D399',
    Integration: '#818CF8',
};

export const TYPE_COLORS: Record<string, string> = {
    project: '#60A5FA',
    spine: '#2DD4BF',
    'skill-basic': '#FBBF24',
    'skill-payable': '#34D399',
    survival: '#F87171',
    question: '#A78BFA',
    task: '#FB923C',
    log: '#FACC15',
    concept: '#4ADE80',
    insight: '#22D3EE',
    build: '#60A5FA',
};

function computeAllGhostNodes() {
    const ghostNodes: any[] = [];

    // ── Projects (150 items, 1 per day) ────────────────────────
    (projectsData as any[]).forEach((proj) => {
        ghostNodes.push({
            id: `ghost_project_D${proj.day}`,
            type: 'project',
            title: proj.name,
            domain: proj.category,
            phase: proj.phase,
            dayN: proj.day,
            isGhost: true,
            status: 'pending',
            detail: proj.doneMeans,
        });
    });

    // ── Tech-Spine (26 areas with topics) ──────────────────────
    (techSpineData as any[]).forEach((spine) => {
        ghostNodes.push({
            id: `ghost_spine_${spine.id}`,
            type: 'spine',
            title: spine.area,
            domain: spine.area,
            phase: spine.phase,
            dayN: spine.dayStart,
            dayEnd: spine.dayEnd,
            isGhost: true,
            status: 'pending',
            detail: `Topics: ${(spine.topics || []).join(', ')}`,
            topics: spine.topics || [],
            topicKeys: spine.topicKeys || [],
            resource: spine.resource,
            resourceUrl: spine.resourceUrl,
        });
    });

    // ── Skills — Basic (120 items) ─────────────────────────────
    const basicSkills = (skillsData as any).basic || [];
    basicSkills.forEach((sk: any, i: number) => {
        ghostNodes.push({
            id: `ghost_skill_basic_${sk.id || i}`,
            type: 'skill-basic',
            title: sk.name,
            domain: sk.category || 'General',
            phase: 'Human Skills',
            isGhost: true,
            status: 'pending',
            detail: sk.dailyDrill,
        });
    });

    // ── Skills — Payable syllabi ───────────────────────────────
    const payableSkills = (skillsData as any).payable || [];
    payableSkills.forEach((p: any, i: number) => {
        ghostNodes.push({
            id: `ghost_skill_payable_${p.dayStart || i}`,
            type: 'skill-payable',
            title: p.name,
            domain: 'Payable',
            phase: 'Payable Skills',
            dayN: p.dayStart,
            dayEnd: p.dayEnd,
            isGhost: true,
            status: 'pending',
            detail: p.microPractice || `Study ${p.name}`,
        });
    });

    // ── Survival Areas (6 critical domains with 8-10 topics each) ──
    (survivalData as any[]).forEach((area) => {
        ghostNodes.push({
            id: `ghost_survival_${area.id}`,
            type: 'survival',
            title: area.area,
            domain: area.area,
            phase: 'Survival',
            isGhost: true,
            status: 'pending',
            detail: area.why,
            urgency: area.urgency,
            topics: (area.topics || []).map((t: any) => t.title),
        });
    });

    // ── Questions (300+ items) ─────────────────────────────────
    // Only include a representative sample in the canvas (first 60)
    // to avoid overwhelming the graph with 300 tiny question nodes
    const questionSample = (questionsData as any[]).slice(0, 60);
    questionSample.forEach((q) => {
        ghostNodes.push({
            id: `ghost_question_${q.id}`,
            type: 'question',
            title: `Q${q.id}`,
            domain: q.theme,
            phase: q.difficulty === 1 ? 'Foundation' : q.difficulty === 2 ? 'Applied' : 'Advanced',
            isGhost: true,
            status: 'pending',
            detail: q.question,
        });
    });

    return ghostNodes;
}

// Pre-compute ghost nodes once at module level since JSON is static
const ALL_GHOST_NODES = computeAllGhostNodes();

export function useBrainGraph() {
    const { data, error, isLoading, mutate } = useSWR<GraphResponse>('/api/intel/graph', fetcher);

    const graphData = useMemo(() => {
        const realNodes = data
            ? data.nodes.map(n => ({ ...n, id: (n as any)._id.toString(), isGhost: false }))
            : [];
        const realEdges = data?.edges || [];

        // Filter ghost projects that have a matching real node on the same day
        const realDayTypes = new Set(realNodes.map(n => `${(n as any).type}-${(n as any).dayN}`));

        const filteredGhosts = ALL_GHOST_NODES.filter(gn => {
            if (gn.type === 'project' && gn.dayN) {
                return !realDayTypes.has(`task-${gn.dayN}`);
            }
            return true;
        });

        return {
            nodes: [...filteredGhosts, ...realNodes],
            edges: realEdges,
        };
    }, [data]);

    return {
        nodes: graphData.nodes,
        edges: graphData.edges,
        isLoading,
        error: error?.message || (data as any)?.error,
        refresh: mutate,
    };
}
