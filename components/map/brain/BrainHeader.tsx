import { Brain, CheckCircle2, CircleDashed, RotateCcw, Circle } from 'lucide-react'
import { useMap } from '@/hooks/useMap'

type StatusType = 'done' | 'partial' | 'revisit' | 'not_started'

const STATUS_CONFIG: Record<StatusType, { icon: any, color: string, label: string }> = {
    done: { icon: CheckCircle2, color: 'text-success border-success/30 bg-success/10', label: 'Mastered' },
    partial: { icon: CircleDashed, color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10', label: 'Partial' },
    revisit: { icon: RotateCcw, color: 'text-orange-500 border-orange-500/30 bg-orange-500/10', label: 'Weak' },
    not_started: { icon: Circle, color: 'text-muted2 border-borderLo bg-surface2/50', label: 'Uncharted' }
}

export default function BrainHeader({ topicKey, status = 'not_started' }: { topicKey: string, status?: StatusType }) {
    const { updateTopicStatus } = useMap()
    const config = STATUS_CONFIG[status]
    const Icon = config.icon

    const cycleStatus = () => {
        const order: StatusType[] = ['not_started', 'partial', 'done', 'revisit']
        const nextIdx = (order.indexOf(status) + 1) % order.length
        updateTopicStatus(topicKey, order[nextIdx])
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-borderHi p-5 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                    <Brain className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-text leading-none mb-1">{topicKey}</h1>
                    <p className="text-xs text-muted font-mono tracking-wider uppercase">Topic Signature</p>
                </div>
            </div>

            <button
                onClick={cycleStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold tracking-widest uppercase a-transition hover:brightness-110 active:scale-95 ${config.color}`}
            >
                <Icon className="w-4 h-4 shrink-0" />
                {config.label}
            </button>
        </div>
    )
}
