'use client';

import React from 'react';

interface DetailPanelProps {
  item: any;
  onClose: () => void;
}

export default function DetailPanel({ item, onClose }: DetailPanelProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      {/* BLUR OVERLAY */}
      <div 
        className="absolute inset-0 bg-[#FAFAFA]/40 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" 
        onClick={onClose}
      />
      
      {/* MODAL CARD */}
      <div className="relative w-full max-w-4xl max-h-full bg-white border border-[#EBEBEB] rounded-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col animate-[modalEntry_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        
        {/* TOP BAR */}
        <div className="px-8 py-6 border-b border-[#F0F0F0] flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] mb-1">DATA_OBJECT // {item.source?.toUpperCase() || 'CORE'}</div>
            <h2 className="text-3xl serif text-[#111111] leading-none tracking-tight">
                {item.topic || item.name || item.concept || 'Intelligence Deep Dive'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-[#A1A1AA] hover:text-[#111111] hover:border-[#111111] transition-all"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            {/* LEFT COLUMN: METADATA */}
            <div className="space-y-10">
                <section>
                    <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-4">STATUS_PROTOCOL</div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl">
                            <span className="text-[12px] text-[#71717A] uppercase">State</span>
                            <span className="text-[12px] font-bold text-[#111111] uppercase">{item.status || 'ACTIVE'}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl">
                            <span className="text-[12px] text-[#71717A] uppercase">Weight</span>
                            <span className="text-[12px] font-bold text-[#111111] uppercase">{item.difficulty ? 'LVL_'+item.difficulty : 'NOMINAL'}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-4">DEPENDENCIES</div>
                    <div className="flex flex-wrap gap-2">
                        {['CORE_DNS', 'TCP_LAYER', 'SYSTEM_7'].map(dep => (
                            <span key={dep} className="px-2.5 py-1 bg-white border border-[#EBEBEB] text-[#71717A] text-[10px] rounded-md font-mono uppercase">
                                {dep}
                            </span>
                        ))}
                    </div>
                </section>
            </div>

            {/* CENTER & RIGHT: MAIN DATA */}
            <div className="md:col-span-2 space-y-12">
                <section>
                    <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-6">INTELLIGENCE_OBJECTIVE</div>
                    <p className="text-[20px] text-[#111111] leading-relaxed serif tracking-tight">
                        {item.description || item.text || 'Primary intelligence objective retrieved. Ensure all edge cases are mapped to the survival engine before marking as mastered.'}
                    </p>
                </section>

                <section className="bg-[#FAFAFA] p-8 rounded-2xl border border-[#EBEBEB]">
                    <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-6">FIELD_NOTES</div>
                    <div className="space-y-6">
                        <p className="text-[14px] text-[#71717A] leading-relaxed italic border-l-2 border-[#111111] pl-6">
                            "{item.notes || 'No field notes captured yet. Add insights during daily sessions to populate this intelligence stream.'}"
                        </p>
                    </div>
                </section>

                <section>
                    <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-6">GAPS_DETECTED</div>
                    <div className="space-y-3">
                        {item.gaps > 0 ? (
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                    <span className="text-[13px] font-bold text-orange-900 uppercase tracking-tight">System Drift Flagged</span>
                                </div>
                                <span className="text-[11px] font-mono text-orange-700">{item.gaps} EVENTS</span>
                            </div>
                        ) : (
                            <div className="text-[13px] text-[#A1A1AA] font-mono italic">No drift detected in current phase.</div>
                        )}
                    </div>
                </section>
            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-8 py-6 border-t border-[#F0F0F0] bg-[#FAFAFA] flex justify-between items-center">
            <div className="font-mono text-[9px] text-[#A1A1AA] tracking-[0.3em] uppercase">Security_Clearance: LVL_04</div>
            <div className="flex gap-4">
                <button className="h-[36px] px-6 border border-[#EBEBEB] text-[#71717A] text-[12px] font-bold uppercase tracking-widest hover:border-[#111111] hover:text-[#111111] transition-all bg-white rounded-lg">
                    Edit Manifest
                </button>
                <button className="h-[36px] px-6 bg-[#111111] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#333333] transition-all">
                    Initiate Drill-Down
                </button>
            </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalEntry {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
