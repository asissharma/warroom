import { useState } from 'react';
import { X, Check, Edit2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import { IntelNodeType } from '@/lib/models/IntelNode';

interface NodeDetailCardProps {
    node: any;
    onClose: () => void;
}

export function NodeDetailCard({ node, onClose }: NodeDetailCardProps) {
    const { mutate } = useSWRConfig();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'connections'>('details');

    // Editable state
    const [editTitle, setEditTitle] = useState(node.title || '');
    const [editBody, setEditBody] = useState(node.body || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/intel/${node.id || node._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    body: editBody
                })
            });
            if (res.ok) {
                mutate('/api/intel/graph');
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div 
            className="w-84 bg-surface/95 backdrop-blur-md border border-borderHi rounded-2xl p-5 shadow-2xl flex flex-col gap-4 min-h-[300px]"
            style={{ 
                transform: 'translate3d(-50%, -100%, 0)', 
                marginTop: '-40px' 
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-borderLo bg-surface2 text-muted max-w-fit">
                        {node.type}
                    </span>
                    {node.domain && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                            {node.domain}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {!isEditing && activeTab === 'details' && (
                        <button onClick={() => setIsEditing(true)} className="text-muted hover:text-accent transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {isEditing && (
                        <button onClick={handleSave} disabled={isSaving} className="text-success hover:text-green-300 transition-colors disabled:opacity-50">
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="text-muted hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            {!isEditing && (
                <div className="flex border-b border-borderLo">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'details' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}
                    >
                        Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('connections')}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'connections' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}
                    >
                        Connections ({node.connections?.length || 0})
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-auto max-h-[300px] hide-scrollbar">
                {isEditing ? (
                    <div className="flex flex-col gap-3">
                        <input 
                            type="text" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-bg border border-borderHi rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent w-full"
                            placeholder="Node Title..."
                        />
                        <textarea 
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="bg-bg border border-borderHi rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent min-h-[150px] resize-none w-full"
                            placeholder="Details or notes..."
                        />
                    </div>
                ) : activeTab === 'details' ? (
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-lg leading-tight text-white">{node.title}</h3>
                        {node.body && (
                            <p className="text-sm text-muted/80 leading-relaxed mt-2 pt-2 border-t border-borderLo whitespace-pre-wrap">
                                {node.body}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-3">
                            {node.tags?.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-mono text-muted2 bg-bg px-1.5 py-0.5 rounded border border-borderLo">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <ConnectionsList nodeId={node.id || node._id} />
                )}
            </div>

            {!isEditing && activeTab === 'details' && node.url && (
                <div className="mt-2 pt-3 border-t border-borderLo">
                    <a href={node.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-accent hover:underline uppercase font-bold tracking-widest">
                        View Source <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}
        </div>
    );
}

function ConnectionsList({ nodeId }: { nodeId: string }) {
    const { data: connections, isLoading } = useSWR(`/api/intel/${nodeId}/connections`, (url) => fetch(url).then(r => r.json()));

    if (isLoading) return <div className="text-xs text-muted animate-pulse py-4">Scanning relationship web...</div>;
    if (!connections || connections.length === 0) return <div className="text-xs text-muted py-4 italic">No direct connections established.</div>;

    return (
        <div className="flex flex-col gap-2">
            {connections.map((c: any) => (
                <div key={c._id} className="flex flex-col gap-0.5 p-2 rounded-lg bg-surface2/50 border border-borderLo hover:border-accent/30 transition-colors">
                    <div className="text-[11px] font-bold text-text/80 truncate">{c.title}</div>
                    <div className="flex items-center gap-2 text-[9px] text-muted uppercase tracking-widest">
                        <span>{c.type}</span>
                        {c.dayN > 0 && <span>· Day {c.dayN}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default NodeDetailCard;
