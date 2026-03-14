import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { Target, CheckCircle, Layers, BookOpen, Zap, Shield, Flame, Briefcase, Star } from 'lucide-react';

export const WorkNode = memo(({ data, isConnectable }: any) => {
    const isGhost = data.isGhost;
    const type = data.type;

    const getIcon = () => {
        switch (type?.toLowerCase()) {
            case 'task': return <CheckCircle className="w-3 h-3 text-orange-400" />;
            case 'build': return <Layers className="w-3 h-3 text-blue-400" />;
            case 'question': return <BookOpen className="w-3 h-3 text-purple-400" />;
            case 'skill': return <Zap className="w-3 h-3 text-white" />;
            case 'survival': return <Shield className="w-3 h-3 text-red-500" />;
            case 'log': return <Flame className="w-3 h-3 text-yellow-400" />;
            case 'concept': return <Briefcase className="w-3 h-3 text-green-400" />;
            case 'insight': return <Star className="w-3 h-3 text-cyan-400" />;
            default: return <Target className="w-3 h-3 text-gray-400" />;
        }
    };

    return (
        <div style={{
            opacity: isGhost ? 0.3 : 1,
            pointerEvents: 'all'
        }} className={`
            relative flex items-center gap-2 p-2 rounded-lg text-xs font-mono 
            ${isGhost ? 'border border-dashed border-borderLo bg-surface/50' : 'border border-borderHi bg-surface shadow-md hover:border-accent/50'}
            transition-colors
        `}>
            {/* Target handles for edge connections */}
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-1 h-1 bg-borderHi" />
            
            <div className={`p-1 rounded-sm ${isGhost ? 'bg-bg/50' : 'bg-surface2'}`}>
                {getIcon()}
            </div>
            <div className="flex flex-col max-w-[120px]">
                <span className="truncate text-text font-bold">{data.title || 'Unknown'}</span>
                {data.domain && <span className="text-[9px] uppercase tracking-widest text-muted">{data.domain}</span>}
            </div>

             <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-1 h-1 bg-borderHi" />
        </div>
    );
});

WorkNode.displayName = 'WorkNode';
