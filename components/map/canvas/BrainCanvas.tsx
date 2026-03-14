'use client';

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useBrainGraph } from '@/hooks/useBrainGraph';
import { Loader2, Maximize, ZoomIn, ZoomOut, Link as LinkIcon, Briefcase, Star, Search, Flame, Server, Shield, Edit2, Check, X } from 'lucide-react';

interface Point { x: number; y: number }

export function BrainCanvas() {
    const { nodes, edges, isLoading, error, refresh } = useBrainGraph();
    const containerRef = useRef<HTMLDivElement>(null);

    // Viewport State
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });

    // Interaction State
    const [hoveredNode, setHoveredNode] = useState<any | null>(null);
    const [selectedNode, setSelectedNode] = useState<any | null>(null);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', body: '', tags: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Connection State
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStart, setConnectionStart] = useState<any | null>(null);
    const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
    const [connectionLabel, setConnectionLabel] = useState('related_to');

    // Compute node positions organically in a spiral or cluster layout based on array index for V1
    const [nodePositions, setNodePositions] = useState<Record<string, Point>>({});

    useEffect(() => {
        if (!nodes || !nodes.length) return;
        const positions: Record<string, Point> = {};
        
        let angle = 0;
        let radius = 50;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        nodes.forEach((node, i) => {
            if (i === 0) {
                positions[node.id] = { x: centerX, y: centerY };
            } else {
                angle += 0.8;
                radius += 3;
                positions[node.id] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            }
        });
        setNodePositions(positions);
    }, [nodes]);

    const handleMouseDown = (e: ReactMouseEvent) => {
        if (isConnecting) return; // Let node mousedown handle this
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
        if (isConnecting && connectionStart) {
            setMousePos({ x: e.clientX, y: e.clientY });
            return;
        }
        if (!isDragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setZoom(z => Math.min(Math.max(0.1, z + delta), 4));
    };

    const handleNodeClick = (e: ReactMouseEvent, node: any) => {
        e.stopPropagation();

        if (isConnecting && connectionStart) {
            // Finish Connection
            if (node.id !== connectionStart.id && !node.isGhost && !connectionStart.isGhost) {
                createConnection(connectionStart.id, node.id);
            }
            setIsConnecting(false);
            setConnectionStart(null);
            return;
        }

        setSelectedNode(node);
        setIsEditing(false);
        setEditForm({ 
            title: node.title || '', 
            body: node.body || '', 
            tags: (node.tags || []).join(', ') 
        });
    };

    const createConnection = async (sourceId: string, targetId: string) => {
        try {
            await fetch(`/api/intel/${sourceId}/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId, label: connectionLabel })
            });
            refresh();
        } catch (err) {
            console.error('Failed to create connection', err);
        }
    };

    const saveNodeEdit = async () => {
        if (!selectedNode || selectedNode.isGhost) return;
        setIsSaving(true);
        try {
            await fetch(`/api/intel/${selectedNode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    body: editForm.body,
                    tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                })
            });
            refresh();
            setSelectedNode({ ...selectedNode, ...editForm, tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean) });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update node', err);
        } finally {
            setIsSaving(false);
        }
    };

    const getNodeStyleAndIcon = (node: any) => {
        const isGhost = node.isGhost;
        const opacity = isGhost ? 'opacity-30 border-dashed' : 'opacity-100 border-solid shadow-lg shadow-black/20';

        switch (node.type?.toLowerCase()) {
            case 'concept': return { icon: <Briefcase className="w-4 h-4" />, style: `border-green-500/50 bg-green-500/10 text-green-400 ${opacity}` }
            case 'task': return { icon: <Server className="w-4 h-4" />, style: `border-orange-500/50 bg-orange-500/10 text-orange-400 ${opacity}` }
            case 'build': return { icon: <Briefcase className="w-4 h-4" />, style: `border-blue-500/50 bg-blue-500/10 text-blue-400 ${opacity}` }
            case 'insight': return { icon: <Star className="w-4 h-4" />, style: `border-cyan-500/50 bg-cyan-500/10 text-cyan-400 ${opacity}` }
            case 'log': return { icon: <Flame className="w-4 h-4" />, style: `border-yellow-500/50 bg-yellow-500/10 text-yellow-400 ${opacity}` }
            case 'survival': return { icon: <Shield className="w-4 h-4" />, style: `border-red-500/50 bg-red-500/10 text-red-500 ${opacity}` }
            case 'project': return { icon: <Server className="w-4 h-4" />, style: `border-purple-500/50 bg-purple-500/10 text-purple-400 ${opacity}` }
            case 'question': return { icon: <Search className="w-4 h-4" />, style: `border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 ${opacity}` }
            default: return { icon: <LinkIcon className="w-4 h-4" />, style: `border-borderHi bg-surface2 text-muted ${opacity}` }
        }
    };

    if (isLoading) return <div className="absolute inset-0 flex items-center justify-center bg-bg/80 z-50"><Loader2 className="animate-spin text-accent w-8 h-8"/></div>;
    if (error) return <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-bg/80 z-50">{error}</div>;

    // LOD Level Computation
    const isLODDetailed = zoom > 0.8;
    const isLODMacro = zoom <= 0.3;

    return (
        <div 
            ref={containerRef}
            className="absolute inset-0 bg-bg overflow-hidden cursor-grab active:cursor-grabbing selection:bg-transparent"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`
            }}/>

            {/* Transform Layer */}
            <div 
                className="absolute origin-top-left will-change-transform"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
                {/* Edges Layer */}
                <svg className="absolute overflow-visible pointer-events-none" style={{ width: 0, height: 0 }}>
                    {edges.map((edge: any) => {
                        const source = nodePositions[edge.sourceId] || nodePositions[`ghost_project_${edge.sourceId}`]; // Fallback if needed
                        const target = nodePositions[edge.targetId];
                        if (!source || !target) return null;
                        
                        return (
                            <line 
                                key={edge.id || `${edge.sourceId}-${edge.targetId}`}
                                x1={source.x} y1={source.y}
                                x2={target.x} y2={target.y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={2}
                            />
                        )
                    })}

                    {/* Active Drag Connection Line */}
                    {isConnecting && connectionStart && (
                        <line
                            x1={nodePositions[connectionStart.id]?.x || 0}
                            y1={nodePositions[connectionStart.id]?.y || 0}
                            x2={(mousePos.x - pan.x) / zoom}
                            y2={(mousePos.y - pan.y) / zoom}
                            stroke="rgba(var(--accent), 0.5)"
                            strokeWidth={2}
                            strokeDasharray="5,5"
                        />
                    )}
                </svg>

                {/* Nodes Layer */}
                {nodes.map(node => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const styleConfig = getNodeStyleAndIcon(node);
                    const isSelected = selectedNode?.id === node.id;
                    const isConnectingSource = connectionStart?.id === node.id;

                    return (
                        <div
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] a-transition flex flex-col items-center justify-center cursor-pointer hover:scale-110 z-10 
                                ${styleConfig.style} 
                                ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg shadow-[0_0_30px_rgba(var(--accent),0.3)]' : ''}
                                ${isConnectingSource ? 'ring-2 ring-blue-500 animate-pulse' : ''}
                            `}
                            style={{
                                left: pos.x,
                                top: pos.y,
                                width: isLODMacro ? 12 : (isLODDetailed ? 48 : 24),
                                height: isLODMacro ? 12 : (isLODDetailed ? 48 : 24),
                            }}
                            onMouseEnter={() => setHoveredNode({ ...node, ...pos })}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={(e) => handleNodeClick(e, node)}
                        >
                            {/* Icon rendering logic based on Zoom LOD */}
                            {!isLODMacro && (
                                <div className={`${isLODDetailed ? 'scale-100' : 'scale-50'} a-transition`}>
                                    {styleConfig.icon}
                                </div>
                            )}

                            {/* Node Label (Visible only up close) */}
                            {isLODDetailed && (
                                <div className={`absolute top-full mt-2 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap px-2 py-1 rounded bg-surface/90 border border-borderLo backdrop-blur-sm ${node.isGhost ? 'text-muted' : 'text-text'}`}>
                                    {node.title.slice(0, 25)}{node.title.length > 25 ? '...' : ''}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Hover Tooltip (HUD) */}
            {hoveredNode && !isDragging && !isConnecting && (
                <div 
                    className="absolute pointer-events-none z-50 bg-black/80 backdrop-blur-md border border-borderHi rounded-lg p-3 shadow-2xl min-w-[200px]"
                    style={{
                        left: hoveredNode.x * zoom + pan.x + (24 * zoom) + 10,
                        top: hoveredNode.y * zoom + pan.y - 10,
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-surface px-1.5 py-0.5 rounded text-accent">
                            {hoveredNode.isGhost ? 'GHOST NODE' : hoveredNode.type}
                        </span>
                        {hoveredNode.dayN && <span className="text-[9px] uppercase tracking-widest font-bold text-muted2">DAY {hoveredNode.dayN}</span>}
                    </div>
                    <p className="text-sm font-bold text-white mb-1 leading-tight">{hoveredNode.title}</p>
                    {hoveredNode.domain && <p className="text-xs text-muted font-mono">{hoveredNode.domain}</p>}
                </div>
            )}

            {/* Interaction HUD (Bottom Left) */}
            {isConnecting && (
                <div className="absolute bottom-6 left-6 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                    <LinkIcon className="w-5 h-5 animate-pulse" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest">Connection Mode</p>
                        <p className="text-[10px] opacity-70 mb-2">Click another node to draw an edge.</p>
                        <input 
                            type="text" 
                            className="bg-bg/50 border border-blue-500/30 rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-blue-400 w-full"
                            value={connectionLabel}
                            onChange={(e) => setConnectionLabel(e.target.value)}
                            placeholder="Edge Label (e.g. related_to)"
                            onClick={(e) => e.stopPropagation()} // Prevent canceling connection when typing
                        />
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsConnecting(false); setConnectionStart(null); }}
                        className="ml-4 p-1.5 bg-blue-500/20 hover:bg-blue-500/40 rounded-md a-transition shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-40">
                <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="p-3 bg-surface border border-borderHi rounded-full text-text hover:border-accent hover:text-accent disabled:opacity-50 a-transition shadow-lg">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-3 bg-surface border border-borderHi rounded-full text-text hover:border-accent hover:text-accent a-transition shadow-lg">
                    <Maximize className="w-5 h-5" />
                </button>
                <button onClick={() => setZoom(z => Math.max(0.1, z - 0.5))} className="p-3 bg-surface border border-borderHi rounded-full text-text hover:border-accent hover:text-accent disabled:opacity-50 a-transition shadow-lg">
                    <ZoomOut className="w-5 h-5" />
                </button>
            </div>

            {/* Selected Node Details Panel */}
            {selectedNode && (
                <div className="absolute right-0 top-0 bottom-0 w-[400px] border-l border-borderHi bg-surface/95 backdrop-blur-xl z-50 p-6 flex flex-col pt-24 animate-in slide-in-from-right shadow-2xl">
                    <button onClick={() => { setSelectedNode(null); setIsEditing(false); }} className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent a-transition">
                        Close Panel
                    </button>
                    
                    {!selectedNode.isGhost && !isEditing && (
                         <div className="absolute top-6 right-6 flex gap-2">
                             <button onClick={() => { setIsConnecting(true); setConnectionStart(selectedNode); setSelectedNode(null); }} className="p-2 border border-borderHi rounded bg-surface hover:text-accent a-transition" title="Draw Connection">
                                 <LinkIcon className="w-4 h-4" />
                             </button>
                             <button onClick={() => setIsEditing(true)} className="p-2 border border-borderHi rounded bg-surface hover:text-accent a-transition" title="Edit Node">
                                 <Edit2 className="w-4 h-4" />
                             </button>
                         </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center ${getNodeStyleAndIcon(selectedNode).style.split(' opacity')[0]}`}>
                            {getNodeStyleAndIcon(selectedNode).icon}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded truncate">
                                    {selectedNode.isGhost ? 'GHOST NODE' : selectedNode.type}
                                </span>
                                {selectedNode.dayN && <span className="text-[10px] font-bold uppercase tracking-widest text-muted2 border border-borderLo px-2 py-0.5 rounded shrink-0">
                                    DAY {selectedNode.dayN}
                                </span>}
                            </div>
                            <h2 className="text-xl font-bold text-text leading-tight truncate">{selectedNode.title}</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted2 mb-1 block">Title</label>
                                    <input 
                                        type="text" 
                                        value={editForm.title}
                                        onChange={e => setEditForm(f => ({...f, title: e.target.value}))}
                                        className="w-full bg-bg border border-borderHi rounded p-2 text-sm text-text focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted2 mb-1 block">Body Markdown</label>
                                    <textarea 
                                        value={editForm.body}
                                        onChange={e => setEditForm(f => ({...f, body: e.target.value}))}
                                        className="w-full h-48 bg-bg border border-borderHi rounded p-2 text-sm font-mono text-text focus:outline-none focus:border-accent resize-none custom-scrollbar"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted2 mb-1 block">Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={editForm.tags}
                                        onChange={e => setEditForm(f => ({...f, tags: e.target.value}))}
                                        className="w-full bg-bg border border-borderHi rounded p-2 text-sm font-mono text-accent focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="pt-4 flex gap-2">
                                    <button 
                                        onClick={saveNodeEdit}
                                        disabled={isSaving}
                                        className="flex-1 bg-accent/10 border border-accent/20 text-accent font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-accent/20 a-transition flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4"/> Save Changes</>}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 border border-borderHi text-text font-bold uppercase tracking-widest text-xs rounded hover:bg-surface2 a-transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectedNode.isGhost && (
                                    <div className="bg-surface2/50 border border-borderLo rounded-xl p-4 mb-6">
                                        <p className="text-xs text-muted leading-relaxed">
                                            This is a <strong>Ghost Node</strong>. It exists in the curriculum but has not been interacted with or accomplished yet. Completing the corresponding day or manually logging this topic will solidify it in your real graph.
                                        </p>
                                    </div>
                                )}

                                {selectedNode.body && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted2 mb-2">Content</h3>
                                        <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{selectedNode.body}</p>
                                    </div>
                                )}

                                {selectedNode.tags && selectedNode.tags.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted2 mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedNode.tags.map((tag: string) => (
                                                <span key={tag} className="text-xs font-mono text-muted2 bg-bg px-2 py-1 rounded-md border border-borderLo">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedNode.connections && selectedNode.connections.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted2 mb-2">Outbound Connections</h3>
                                        <div className="space-y-2">
                                            {selectedNode.connections.map((conn: any, i: number) => {
                                                const targetNode = nodes.find(n => n.id === conn.targetId);
                                                return (
                                                    <div key={i} className="text-xs flex items-center gap-2 text-text bg-surface p-2 rounded border border-borderHi cursor-pointer hover:border-accent a-transition" onClick={(e) => {
                                                        if(targetNode) handleNodeClick(e, targetNode);
                                                    }}>
                                                        <LinkIcon className="w-3 h-3 text-accent shrink-0" />
                                                        <span className="truncate">{targetNode ? targetNode.title : conn.targetId.slice(-6)}</span>
                                                        {conn.label && <span className="text-[9px] uppercase tracking-widest text-accent/70 bg-accent/5 px-1 py-0.5 rounded ml-auto shrink-0">[{conn.label}]</span>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
