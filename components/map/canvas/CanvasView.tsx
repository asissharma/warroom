import { useMemo, useCallback, useEffect } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useMapStore } from '@/hooks/useMapStore'
import TopicNode from './TopicNode'
import ConnectionEdge from './ConnectionEdge'
import ConnectionToggle from './ConnectionToggle'
import spineData from '@/data/tech-spine.json'
import survivalData from '@/data/survival-areas.json'

const nodeTypes = { custom: TopicNode }
const edgeTypes = { custom: ConnectionEdge }

// Deterministic layout generator
function generateNodes(getTopicStatus: (topic: string) => any) {
    const nodes: any[] = []

    // Group into phases
    const phases = (spineData as any[]).reduce((acc: Record<string, any[]>, curr: any) => {
        if (!acc[curr.phase]) acc[curr.phase] = []
        acc[curr.phase].push(curr)
        return acc
    }, {})

    let phaseIndex = 0

    for (const [phaseName, blocks] of Object.entries(phases)) {
        // Grid placement for phases (3 columns of phases)
        const phaseCol = phaseIndex % 3
        const phaseRow = Math.floor(phaseIndex / 3)
        const phaseOffsetX = phaseCol * 700
        const phaseOffsetY = phaseRow * 800

        let topicIndex = 0

        for (const block of blocks) {
            if (!block.topics || !block.topicKeys) continue;

            for (let i = 0; i < block.topics.length; i++) {
                const topic = block.topics[i]
                const topicKey = block.topicKeys[i]

                // Layout topics within the phase block (4 columns)
                const tCol = topicIndex % 4
                const tRow = Math.floor(topicIndex / 4)

                nodes.push({
                    id: topicKey,
                    type: 'custom',
                    position: {
                        x: phaseOffsetX + (tCol * 160),
                        y: phaseOffsetY + (tRow * 80)
                    },
                    data: {
                        label: topic,
                        topicKey: topicKey,
                        status: getTopicStatus(topicKey)
                    }
                })
                topicIndex++
            }
        }
        phaseIndex++
    }

    return nodes
}

function CanvasContent({ getTopicStatus }: { getTopicStatus: (topic: string) => any }) {
    const { connectionsVisible, canvasViewport, setCanvasViewport, setOpenTopicKey } = useMapStore()
    const { setViewport } = useReactFlow()

    // Setup nodes based on spine data
    const initialNodes = useMemo(() => generateNodes(getTopicStatus), [getTopicStatus])

    // Setup edges connecting valid topics from survival areas
    const initialEdges = useMemo(() => {
        const edges: any[] = []
        const validNodeIds = new Set(initialNodes.map(n => n.id))

        survivalData.forEach((area: any) => {
            if (area.topics) {
                area.topics.forEach((topic: any) => {
                    if (topic.connectedTopicKeys && validNodeIds.has(topic.connectedTopicKeys[0])) {
                        // Create edges connecting the first topic key to the rest in the array for demonstration
                        // For a more complete graph, we connect all keys to each other or source them correctly
                        const sourceNode = topic.connectedTopicKeys[0]

                        for (let i = 1; i < topic.connectedTopicKeys.length; i++) {
                            const targetNode = topic.connectedTopicKeys[i]
                            if (validNodeIds.has(targetNode)) {
                                edges.push({
                                    id: `e-${sourceNode}-${targetNode}`,
                                    source: sourceNode,
                                    target: targetNode,
                                    type: 'custom',
                                    data: { strength: area.urgency === 'CRITICAL' ? 'strong' : 'normal' }
                                })
                            }
                        }
                    }
                })
            }
        })

        // Ensure uniqueness
        const uniqueEdges = Array.from(new Map(edges.map(e => [e.id, e])).values())

        return uniqueEdges
    }, [initialNodes])

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, , onEdgesChange] = useEdgesState(initialEdges)

    // Restore viewport from Zustand
    useEffect(() => {
        if (canvasViewport.zoom > 0) {
            setViewport(canvasViewport)
        }
    }, [])

    const handleMoveEnd = useCallback((event: any, viewport: any) => {
        setCanvasViewport(viewport)
    }, [setCanvasViewport])

    return (
        <div className="w-full h-[calc(100vh-200px)] absolute inset-x-0 bottom-0 bg-bg rounded-t-3xl overflow-hidden border-t border-borderLo shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={connectionsVisible ? edges : []}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onMoveEnd={handleMoveEnd}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                minZoom={0.1}
                maxZoom={2}
                defaultViewport={canvasViewport.zoom > 0 ? canvasViewport : { x: 50, y: 50, zoom: 0.8 }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
            >
                <Background color="rgba(255,255,255,0.05)" gap={32} />
                <Controls className="pb-24 border-borderLo text-muted fill-muted bg-surface/50 backdrop-blur-md overflow-hidden rounded-xl shadow-none" showInteractive={false} />
            </ReactFlow>

            <ConnectionToggle />
        </div>
    )
}

export default function CanvasView({ getTopicStatus }: { getTopicStatus: (topic: string) => any }) {
    return (
        <ReactFlowProvider>
            <CanvasContent getTopicStatus={getTopicStatus} />
        </ReactFlowProvider>
    )
}
