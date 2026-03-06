import { Link as LinkIcon } from 'lucide-react'

export default function BrainResources({ resources }: { resources?: any[] }) {
    if (!resources || resources.length === 0) return null

    return (
        <div className="bg-surface border border-borderLo rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-4 pb-2 border-b border-borderLo flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                Survival Cache
            </h3>
            <div className="flex flex-col gap-2">
                {resources.map((r: any, idx: number) => (
                    <a
                        key={idx}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-surface2/50 hover:bg-surface2 a-transition border border-transparent hover:border-borderHi group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-bg text-muted border border-borderLo mix-blend-overlay">
                                {r.type}
                            </span>
                            <span className="text-sm font-medium text-text group-hover:text-accent a-transition line-clamp-1">{r.name}</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}
