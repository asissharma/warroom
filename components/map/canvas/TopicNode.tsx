import { Handle, Position } from '@xyflow/react'
import { CheckCircle2, CircleDashed, RotateCcw, Circle } from 'lucide-react'
import { useMapStore } from '@/hooks/useMapStore'

type StatusType = 'done' | 'partial' | 'revisit' | 'not_started'

const STATUS_CONFIG: Record<StatusType, { icon: any, color: string }> = {
    done: { icon: CheckCircle2, color: 'text-success border-success/30 bg-success/10' },
    partial: { icon: CircleDashed, color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' },
    revisit: { icon: RotateCcw, color: 'text-orange-500 border-orange-500/30 bg-orange-500/10' },
    not_started: { icon: Circle, color: 'text-muted2 border-borderLo bg-surface2/80' }
}

export default function TopicNode({ data }: { data: { label: string, topicKey?: string, status: StatusType } }) {
    const config = STATUS_CONFIG[data.status]
    const Icon = config.icon
    const { setOpenTopicKey } = useMapStore()

    const handleTap = () => {
        setOpenTopicKey(data.topicKey || data.label)
    }

    return (
        <div
            onClick={handleTap}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none min-w-[140px] max-w-[180px] ${config.color}`}
        >
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold leading-tight truncate">{data.label}</span>
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    )
}
