'use client';

import { useBrainGraph } from '@/hooks/useBrainGraph';
import { useBrainStore } from '@/store/brainStore';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useState, useCallback } from 'react';
import { WorkNode } from './WorkNode';
import { Loader2, Link as LinkIcon, X } from 'lucide-react';
import type { Node, Edge, Connection } from '@xyflow/react';
import { addEdge } from '@xyflow/react';

const nodeTypes = {
    custom: WorkNode,
};

// Extremely naive layout function for early Phase C integration.
// Production should probably use dagre or a web-worker force directed graph.
function computeLayout(nodes: any[]) {
    // Map Domain -> Y coord, Day -> X coord
    const domainYMap: Record<string, number> = {};
    let domainCounter = 0;

    return nodes.map((n) => {
        let x = 0;
        let y = 0;

        // Group by Day on X axis
        if (n.dayN) {
            x = n.dayN * 150; // 150px per day
        } else {
            // Un-dated nodes just get pushed down
            x = -200 + (Math.random() * 100);
        }

        // Group by Domain on Y axis
        const dom = n.domain || 'general';
        if (domainYMap[dom] === undefined) {
            domainYMap[dom] = domainCounter * 120; // 120px gap per domain track
            domainCounter++;
        }
        y = domainYMap[dom] + (Math.random() * 40 - 20); // Add a small jitter

        // Override if real node has canvasPosition saved
        if (n.canvasPosition && !n.isGhost) {
            x = n.canvasPosition.x;
            y = n.canvasPosition.y;
        }

        return {
            id: n.id,
            type: 'custom',
            position: { x, y },
            data: {
                isGhost: n.isGhost,
                type: n.type,
                title: n.title,
                domain: dom,
                dayN: n.dayN
            }
        };
    });
}

export function WorkCanvas({ active }: { active: boolean }) {
    const { nodes: rawNodes, edges: rawEdges, isLoading, refresh } = useBrainGraph();
    const { layers } = useBrainStore();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    
    // Edge Label Picker state
    const [pendingEdge, setPendingEdge] = useState<Connection | null>(null);

    const onConnect = useCallback((params: Connection) => {
        setPendingEdge(params);
    }, []);

    const confirmEdge = async (label: string) => {
        if (pendingEdge) {
            // Optimistic update for UI feel
            setEdges((eds) => addEdge({ ...pendingEdge, label, animated: true, style: { stroke: 'var(--color-accent)' } }, eds));
            
            try {
                // Determine source and target object IDs based on node IDs
                const sourceNodeId = pendingEdge.source;
                const targetNodeId = pendingEdge.target;
                
                // Note: If you connect a ghost node, this will fail unless ghosts are promoted.
                // Assuming we only connect real nodes for now.
                const response = await fetch(`/api/intel/${sourceNodeId}/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetId: targetNodeId,
                        label: label,
                        direction: 'uni'
                    })
                });
                
                if (!response.ok) {
                    console.error('Failed to create edge in DB');
                    // In a production app you'd probably roll back the optimistic UI here
                } else {
                    // Refresh graph data from SWR to ensure full sync
                    refresh();
                }
            } catch (err) {
                console.error("Networking error creating edge:", err);
            }
            
            setPendingEdge(null);
        }
    };

    useEffect(() => {
        if (!isLoading && rawNodes.length > 0) {
            const layoutedNodes = computeLayout(rawNodes);
            setNodes(layoutedNodes);
            
            // Edges logic
            if (layers.edges) {
                setEdges(rawEdges.map(e => ({
                    id: e.id,
                    source: e.sourceId,
                    target: e.targetId,
                    animated: true,
                    label: e.label,
                    style: { stroke: 'var(--color-accent)', opacity: 0.5 }
                })));
            } else {
                setEdges([]);
            }
        }
    }, [rawNodes, rawEdges, isLoading, layers.edges, setNodes, setEdges]);

    if (!active) return null;

    if (isLoading) {
        return (
            <div className="absolute inset-0 bg-bg z-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-40 bg-bg">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                minZoom={0.05}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                fitView
            >
                <Background color="#333" gap={16} />
                <Controls className="bg-surface border-borderLo fill-text" />
                <MiniMap 
                    nodeColor={(n) => n.data?.isGhost ? '#222' : '#4ADE80'} 
                    maskColor="rgba(0,0,0,0.8)"
                    className="bg-surface2 border border-borderLo rounded-xl"
                />
            </ReactFlow>

            {pendingEdge && (
                <div className="absolute inset-0 bg-bg/50 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-surface border border-borderHi rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text flex items-center gap-2"><LinkIcon className="w-4 h-4 text-accent" /> Connect Nodes</h3>
                            <button onClick={() => setPendingEdge(null)} className="text-muted hover:text-text"><X className="w-5 h-5"/></button>
                        </div>
                        <p className="text-xs text-muted mb-4 uppercase tracking-widest">Select Connection Type</p>
                        <div className="flex flex-col gap-2">
                            {['led-to', 'required', 'related', 'extends', 'contradicts'].map((lbl) => (
                                <button key={lbl} onClick={() => confirmEdge(lbl)} className="bg-surface2 hover:bg-surface border border-borderLo hover:border-accent p-3 text-sm font-bold text-text uppercase tracking-wider rounded-xl transition-colors text-left">
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
