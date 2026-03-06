import { X } from 'lucide-react'
import { useMapStore } from '@/hooks/useMapStore'
import { useTopic } from '@/hooks/useTopic'
import BrainHeader from './BrainHeader'
import BrainShadow from './BrainShadow'
import BrainIntelFeed from './BrainIntelFeed'
import BrainQuestions from './BrainQuestions'
import BrainResources from './BrainResources'

import { useState, useRef } from 'react'

export default function BrainOverlay() {
    const { openTopicKey, setOpenTopicKey } = useMapStore()
    const { data: topicData, isLoading } = useTopic(openTopicKey)

    // Swipe to close logic
    const [touchStartY, setTouchStartY] = useState<number | null>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only register swipe on the header area to prevent interfering with scrolling content
        const target = e.target as HTMLElement
        if (target.closest('.brain-header-drag')) {
            setTouchStartY(e.touches[0].clientY)
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartY === null) return
        const touchEndY = e.changedTouches[0].clientY

        // If swiped down more than 100px, close it
        if (touchEndY - touchStartY > 100) {
            setOpenTopicKey(null)
        }
        setTouchStartY(null)
    }

    if (!openTopicKey) return null

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] bg-bg flex flex-col animate-in slide-in-from-bottom-8 duration-300"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header Area */}
            <div className="brain-header-drag flex items-center justify-between p-4 border-b border-borderLo bg-surface/50 backdrop-blur-md shrink-0 cursor-grab active:cursor-grabbing">
                <div className="flex flex-col">
                    <div className="w-12 h-1.5 bg-borderHi rounded-full mx-auto mb-2 opacity-50 block md:hidden" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text">Brain Archive</h2>
                </div>
                <button
                    onClick={() => setOpenTopicKey(null)}
                    className="p-2 text-muted hover:text-text rounded-full hover:bg-surface2 a-transition bg-surface border border-borderLo"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
                <BrainHeader topicKey={openTopicKey} status={topicData?.status} />

                {isLoading ? (
                    <div className="py-20 text-center text-muted animate-pulse font-mono text-sm">
                        ACCESSING ARCHIVES...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-32">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <BrainShadow shadow={topicData?.shadow} />
                            <BrainIntelFeed intelFeed={topicData?.intelFeed} />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <BrainQuestions questions={topicData?.questions} />
                            <BrainResources resources={topicData?.resources} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
