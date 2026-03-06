import { CheckCircle2, CircleDashed, RotateCcw, Circle } from 'lucide-react'
import { useMapStore } from '@/hooks/useMapStore'

type StatusType = 'done' | 'partial' | 'revisit' | 'not_started'

const STATUS_CONFIG: Record<StatusType, { icon: any, color: string, label: string }> = {
    done: { icon: CheckCircle2, color: 'text-success border-success/30 bg-success/10', label: 'Done' },
    partial: { icon: CircleDashed, color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10', label: 'Partial' },
    revisit: { icon: RotateCcw, color: 'text-orange-500 border-orange-500/30 bg-orange-500/10', label: 'Revisit' },
    not_started: { icon: Circle, color: 'text-muted2 border-borderLo bg-surface2/50', label: 'Not Started' }
}

export default function TopicRow({ topic, topicKey, status }: { topic: string, topicKey?: string, status: StatusType }) {
    const config = STATUS_CONFIG[status]
    const { setOpenTopicKey } = useMapStore()

    return (
        <div
            onClick={() => setOpenTopicKey(topicKey || topic)}
            className={`text-xs px-2 py-1 rounded border cursor-pointer a-transition hover:scale-105 active:scale-95 ${config.color}`}
        >
            {topic}
        </div>
    )
}
