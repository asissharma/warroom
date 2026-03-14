import useSWR from 'swr';
import { IIntelNode } from '@/lib/models/IntelNode';
import projectsDataRaw from '@/data/projects.json';
import questionsDataRaw from '@/data/questions.json';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface GraphResponse {
    nodes: IIntelNode[];
    edges: any[];
}

export function useBrainGraph() {
    const { data, error, isLoading, mutate } = useSWR<GraphResponse>('/api/intel/graph', fetcher);

    // Compute Ghost Nodes (The Full Syllabus)
    const computeGhostNodes = () => {
        const ghostNodes: any[] = [];
        const ghostEdges: any[] = [];

        // Add Curriculum Ghost Nodes
        projectsDataRaw.forEach((proj: any) => {
            ghostNodes.push({
                id: `ghost_project_${proj.name.replace(/\s+/g, '_')}`,
                type: 'project',
                title: proj.name,
                domain: proj.category,
                dayN: proj.day,
                isGhost: true,
                status: 'pending' // Default visual state
            });
        });

        questionsDataRaw.forEach((q: any) => {
            ghostNodes.push({
                id: `ghost_question_${q.id}`,
                type: 'question',
                title: `Question ${q.id}`,
                body: q.question,
                domain: q.theme,
                isGhost: true,
                status: 'pending'
            });
        });

        return { ghostNodes, ghostEdges };
    };

    // Merge logic
    const mergeGraphData = () => {
        if (!data) return { nodes: [], edges: [] };

        const { ghostNodes, ghostEdges } = computeGhostNodes();
        const realNodes = data.nodes.map(n => ({ ...n, id: n._id.toString(), isGhost: false }));
        const realEdges = data.edges || [];

        // If a real node exists that "fulfills" a ghost node, we should ideally
        // override the ghost node's status or hide the ghost node.
        // For Phase 3 V1, we simply render all of them and let the map handle visual layouts.
        
        // Let's hide ghost nodes that have a corresponding real node on the identical day and type
        const realNodeKeys = new Set(realNodes.map(n => `${n.type}-${n.dayN}-${n.title}`));

        const filteredGhostNodes = ghostNodes.filter(gn => {
            // Very naive collision detection to prevent duplicates on the canvas
            if (gn.type === 'project' && gn.dayN) {
                return !realNodes.some(rn => rn.type === 'task' && rn.dayN === gn.dayN);
            }
            return true;
        });

        return {
            nodes: [...filteredGhostNodes, ...realNodes],
            edges: [...ghostEdges, ...realEdges]
        };
    };

    const graphData = mergeGraphData();

    return {
        nodes: graphData.nodes,
        edges: graphData.edges,
        isLoading,
        error: error?.message || (data as any)?.error,
        refresh: mutate
    };
}
