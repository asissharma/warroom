'use client';
import { useStore } from '@/lib/store';

export default function Config() {
    const startDate = useStore(s => s.startDate);
    const setStartDate = useStore(s => s.setStartDate);

    return (
        <div className="max-w-[680px] mx-auto px-4 pb-16">
            <h1 className="font-display text-3xl tracking-wide mb-6">SYSTEM CONFIGURATION</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-surface border border-border p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-2">
                        <h2 className="font-mono text-[11px] text-accent uppercase tracking-widest">01 · Initialize</h2>
                    </div>
                    <div className="flex flex-col space-y-2 text-[13px]">
                        <label className="text-muted2">Start Date (UTC)</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-s2 border border-border rounded p-2 text-text font-mono focus:outline-none focus:border-accent"
                        />
                        <p className="text-[10px] text-muted2 mt-2 leading-relaxed">Changing this will hard-reset your current Day block globally. All data dependencies map linearly from this initial date.</p>
                    </div>
                </div>

                <div className="bg-surface border border-border p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-2">
                        <h2 className="font-mono text-[11px] text-acid uppercase tracking-widest">02 · Settings</h2>
                    </div>
                    <div className="text-[13px] text-muted2 leading-relaxed space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Strict Mode (Lock future tasks)</span>
                            <div className="w-8 h-4 rounded-full bg-success/20 flex items-center p-0.5"><div className="w-3 h-3 rounded-full bg-success transform translate-x-4" /></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Persistent Timer State</span>
                            <div className="w-8 h-4 rounded-full bg-s2 flex items-center p-0.5"><div className="w-3 h-3 rounded-full bg-muted" /></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto-advance Checkpoints</span>
                            <div className="w-8 h-4 rounded-full bg-s2 flex items-center p-0.5"><div className="w-3 h-3 rounded-full bg-muted" /></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0c0c11] border border-border/30 rounded-xl p-5 mb-8 overflow-x-auto">
                <h2 className="font-mono text-[10px] text-muted2 uppercase tracking-widest mb-4">Pipeline File Loading Preference</h2>
                <div className="font-mono text-[11px] text-text whitespace-nowrap leading-loose">
                    Things_To_Learn <span className="text-accent">→</span> tech_smith <span className="text-accent">→</span> FINALQUESTIONS <span className="text-accent">→</span> PROJECT_DANCE <span className="text-accent">→</span> Free_Courses<br />
                    <span className="text-muted2 opacity-50">basic_Skills</span> <span className="text-acid">→</span> <span className="text-muted2 opacity-50">Payable_Skills</span>  <span className="text-muted ml-4 opacity-50">← ALWAYS PARALLEL</span>
                </div>
            </div>

            <div className="flex justify-center mt-12">
                <button className="text-[10px] font-mono text-danger/50 hover:text-danger border border-danger/20 hover:border-danger/50 px-4 py-2 rounded transition-colors"
                    onClick={() => { if (confirm('Erase all state?')) localStorage.clear(); window.location.reload(); }}>
                    DANGER: FACTORY RESET PROTOCOL
                </button>
            </div>
        </div>
    )
}
