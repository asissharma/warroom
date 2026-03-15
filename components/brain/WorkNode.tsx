import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import {
    Target, CheckCircle, Layers, BookOpen, Zap, Shield,
    Flame, Briefcase, Star, GraduationCap, User, AlertTriangle, Compass
} from 'lucide-react';
import { TYPE_COLORS } from '@/hooks/useBrainGraph';

export const WorkNode = memo(({ data, isConnectable }: any) => {
    const isGhost = data.isGhost;
    const type = data.type;

    const getIcon = () => {
        switch (type?.toLowerCase()) {
            case 'task': return <CheckCircle className="w-3 h-3 text-orange-400" />;
            case 'build': return <Layers className="w-3 h-3 text-blue-400" />;
            case 'project': return <Layers className="w-3 h-3 text-blue-400" />;
            case 'question': return <BookOpen className="w-3 h-3 text-purple-400" />;
            case 'skill-basic': return <User className="w-3 h-3 text-amber-400" />;
            case 'skill-payable': return <GraduationCap className="w-3 h-3 text-emerald-400" />;
            case 'spine': return <Compass className="w-3 h-3 text-teal-400" />;
            case 'survival': return <AlertTriangle className="w-3 h-3 text-red-400" />;
            case 'skill': return <Zap className="w-3 h-3 text-white" />;
            case 'log': return <Flame className="w-3 h-3 text-yellow-400" />;
            case 'concept': return <Briefcase className="w-3 h-3 text-green-400" />;
            case 'insight': return <Star className="w-3 h-3 text-cyan-400" />;
            default: return <Target className="w-3 h-3 text-gray-400" />;
        }
    };

    const accentColor = TYPE_COLORS[type] || '#888';

    return (
        <div
            style={{
                opacity: isGhost ? 0.35 : 1,
                pointerEvents: 'all',
                borderLeftColor: isGhost ? undefined : accentColor,
                borderLeftWidth: isGhost ? undefined : '3px',
            }}
            className={`
                relative flex items-center gap-2 p-2 rounded-lg text-xs font-mono
                ${isGhost
                    ? 'border border-dashed border-borderLo bg-surface/30'
                    : 'border border-borderHi bg-surface shadow-md hover:border-accent/50 hover:shadow-accent/10 hover:shadow-lg'
                }
                transition-all duration-200 cursor-pointer
            `}
        >
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-1 h-1 bg-borderHi" />

            <div className={`p-1 rounded-sm shrink-0 ${isGhost ? 'bg-bg/50' : 'bg-surface2'}`}>
                {getIcon()}
            </div>
            <div className="flex flex-col max-w-[140px]">
                <span className="truncate text-text font-bold text-[11px]">{data.title || 'Unknown'}</span>
                <div className="flex items-center gap-1.5">
                    {data.domain && <span className="text-[8px] uppercase tracking-widest text-muted truncate">{data.domain}</span>}
                    {data.dayN && <span className="text-[8px] text-muted/50">D{data.dayN}</span>}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-1 h-1 bg-borderHi" />
        </div>
    );
});

WorkNode.displayName = 'WorkNode';
