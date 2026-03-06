'use client'

import { useMap } from '@/hooks/useMap'
import { useMapStore } from '@/hooks/useMapStore'
import { Brain, Loader2 } from 'lucide-react'
import MapTabs from '@/components/map/MapTabs'
import TimelineView from '@/components/map/timeline/TimelineView'
import ProgressView from '@/components/map/progress/ProgressView'
import CanvasView from '@/components/map/canvas/CanvasView'
import BrainOverlay from '@/components/map/brain/BrainOverlay'
import { CheckCircle2, CircleDashed, RotateCcw, Circle } from 'lucide-react'

// Duplicated STATUS_CONFIG inside Timeline components to break circular imports/logic
// But keeping getTopicStatus here and injecting.
type StatusType = 'done' | 'partial' | 'revisit' | 'not_started'

export default function MapPage() {
    const { statuses, stats } = useMap()
    const { activeTab } = useMapStore()

    if (!statuses || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    const getTopicStatus = (topicKey: string): StatusType => {
        const entry = statuses.find((s: any) => s.topicKey === topicKey)
        return entry ? entry.status : 'not_started'
    }

    return (
        <div className="content-z pb-32 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 min-h-[100dvh] flex flex-col">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-borderLo">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Brain className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-text">MAP</h1>
                        <p className="text-xs text-muted font-mono tracking-wider uppercase">Syllabus & Atlas</p>
                    </div>
                </div>
            </div>

            <MapTabs />

            <div className="flex-1">
                {activeTab === 'TIMELINE' && <TimelineView getTopicStatus={getTopicStatus} />}

                {activeTab === 'CANVAS' && (
                    <CanvasView getTopicStatus={getTopicStatus} />
                )}

                {activeTab === 'PROGRESS' && <ProgressView stats={stats} />}
            </div>

            <BrainOverlay />
        </div>
    )
}
