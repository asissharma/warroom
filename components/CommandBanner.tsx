import type { Project } from '@/lib/types'

export default function CommandBanner({ project, dayN, phase }: { project: Project | null, dayN: number, phase: string }) {
    if (!project) {
        return (
            <div className="w-full border-l-[3px] border-acid bg-gradient-to-r from-acid/10 to-accent/5 relative p-4 mb-6">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-acid to-accent" />
                <div className="font-mono text-[9px] tracking-[3px] text-acid mb-1 uppercase">▶ MISSION — DAY {dayN}</div>
                <div className="font-display text-[20px] tracking-wider text-text mb-1">CAPSTONE INTEGRATION</div>
                <div className="font-mono text-[10px] text-muted2 uppercase">REVIEW & INTEGRATION · {phase}</div>
                <div className="font-mono text-[11px] text-muted2 italic border-t border-border pt-2 mt-2">
                    DONE MEANS: Finalize previous work and prepare for launch.
                </div>
            </div>
        )
    }

    return (
        <div className="w-full border-l-[3px] border-acid bg-gradient-to-r from-[#c8ff0012] to-[#7c5cfc0a] relative p-4 mb-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-acid to-accent" />
            <div className="font-mono text-[9px] tracking-[3px] text-acid mb-1 uppercase">▶ MISSION — DAY {dayN}</div>
            <div className="font-display text-[20px] tracking-wider text-text mb-1">{project.name}</div>
            <div className="font-mono text-[10px] text-muted2 uppercase">{project.category} · {phase}</div>
            <div className="font-body text-[11px] text-muted2 italic border-t border-border pt-2 mt-2">
                DONE MEANS: {project.doneMeans}
            </div>
        </div>
    )
}
