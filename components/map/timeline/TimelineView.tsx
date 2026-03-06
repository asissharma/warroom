import { Target } from 'lucide-react'
import TopicRow from './TopicRow'
import spineData from '@/data/tech-spine.json'

// Group spine data by phase
const phases = (spineData as any[]).reduce((acc: any, curr: any) => {
    if (!acc[curr.phase]) acc[curr.phase] = []
    acc[curr.phase].push(curr)
    return acc
}, {})

export default function TimelineView({ getTopicStatus }: { getTopicStatus: (topicKey: string) => any }) {
    return (
        <div className="space-y-8">
            {Object.entries(phases).map(([phaseName, blocks]: [string, any]) => (
                <div key={phaseName} className="bg-surface border border-borderHi rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text mb-4 pb-2 border-b border-borderLo flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" /> {phaseName}
                    </h2>
                    <div className="space-y-4">
                        {blocks.map((block: any) => (
                            <div key={block.id} className="grid grid-cols-[60px_1fr] gap-4">
                                <div className="text-[10px] font-mono text-muted pt-1">
                                    Wk {block.weekStart}-{block.weekEnd}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {block.topics?.map((topic: string, i: number) => {
                                        const tKey = block.topicKeys?.[i] || topic
                                        return (
                                            <TopicRow
                                                key={tKey}
                                                topic={topic}
                                                topicKey={tKey}
                                                status={getTopicStatus(tKey)}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
