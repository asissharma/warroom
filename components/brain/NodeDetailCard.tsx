import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { X, Check, Edit2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { IntelNodeType } from '@/lib/models/IntelNode';

interface NodeDetailCardProps {
    node: any;
    onClose: () => void;
}

export function NodeDetailCard({ node, onClose }: NodeDetailCardProps) {
    const { mutate } = useSWRConfig();
    const [isEditing, setIsEditing] = useState(false);
    
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
                // Revalidate the graph so everything updates
                mutate('/api/intel/graph');
                setIsEditing(false);
            } else {
                console.error("Failed to update node");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div 
            className="w-80 bg-surface/95 backdrop-blur-md border border-borderHi rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
            style={{ 
                transform: 'translate3d(-50%, -100%, 0)', 
                marginTop: '-40px' 
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // Important for R3F Html
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
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="text-muted hover:text-accent transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={handleSave} disabled={isSaving} className="text-success hover:text-green-300 transition-colors disabled:opacity-50">
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="text-muted hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="flex flex-col gap-3">
                    <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-bg border border-borderHi rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
                        placeholder="Node Title..."
                    />
                    <textarea 
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="bg-bg border border-borderHi rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent min-h-[100px] resize-none"
                        placeholder="Details or notes..."
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg leading-tight text-white">{node.title}</h3>
                    {node.body && (
                        <p className="text-sm text-muted line-clamp-4 leading-relaxed mt-2 pt-2 border-t border-borderLo">
                            {node.body}
                        </p>
                    )}
                </div>
            )}

            {!isEditing && (
                <div className="flex flex-col gap-2 mt-2">
                    {node.tags && node.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {node.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-mono text-muted2 bg-bg px-1.5 py-0.5 rounded border border-borderLo">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-borderLo text-xs">
                        <div className="flex items-center gap-1.5 text-muted">
                            <LinkIcon className="w-3 h-3" />
                            <span>{node.connections?.length || 0} relative</span>
                        </div>
                        {node.url && (
                             <a href={node.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                                 Source <ExternalLink className="w-3 h-3" />
                             </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NodeDetailCard;
