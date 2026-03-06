import { HelpCircle } from 'lucide-react'

export default function BrainQuestions({ questions }: { questions?: any[] }) {
    if (!questions || questions.length === 0) return null

    return (
        <div className="bg-surface border border-borderHi rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-4 pb-2 border-b border-borderLo flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Mastery Checks
            </h3>
            <div className="space-y-3">
                {questions.map((q: any) => (
                    <div key={q.id} className="text-sm text-text bg-surface2/50 border border-borderLo rounded-xl p-3 leading-relaxed relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted mix-blend-overlay">T{q.difficulty}</span>
                        </div>
                        {q.question}
                    </div>
                ))}
            </div>
        </div>
    )
}
