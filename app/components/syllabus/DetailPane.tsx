'use client';

import React from 'react';

interface DetailPaneProps {
  item: any;
  onClose: () => void;
}

export default function DetailPane({ item, onClose }: DetailPaneProps) {
  if (!item) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] relative overflow-y-auto">
      {/* HEADER */}
      <div className="p-8 border-b border-[#EBEBEB] bg-white">
        <div className="flex justify-between items-start mb-10">
            <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${getStatusStyle(item.status)}`}>
              {item.source || 'OBJECT'}: {item.status || 'Active'}
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[20px] hover:bg-[#FAFAFA] transition-all"
            >
              ×
            </button>
        </div>

        <h2 className="text-4xl serif text-[#111111] leading-[1] mb-6 tracking-tight">
          {item.topic || item.name || item.text || item.concept}
        </h2>
        
        <div className="flex gap-4">
            <div className="flex-1 p-4 bg-[#FAFAFA] rounded-2xl border border-[#EBEBEB]">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Depth_Index</div>
                <div className="text-[18px] font-bold tracking-tighter">LVL_0{item.difficulty || item.depthReached || 1}</div>
            </div>
            <div className="flex-1 p-4 bg-[#FAFAFA] rounded-2xl border border-[#EBEBEB]">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Retention</div>
                <div className="text-[18px] font-bold tracking-tighter">{item.completionPercent || 0}%</div>
            </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-10 space-y-12">
        {/* FIELD NOTES */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-[0.2em]">Intel_Manifest</h3>
            <button className="text-[11px] font-mono text-[#111111] underline">EDIT_DATA</button>
          </div>
          <div className="serif text-[18px] text-[#444444] leading-relaxed italic border-l-2 border-[#111111] pl-8 py-2">
            "{item.description || item.microtask || item.notes || 'Secondary investigation pending. No field notes currently archived for this intelligence object.'}"
          </div>
        </section>

        {/* METADATA GRID */}
        <section className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-[#EBEBEB] rounded-[24px]">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-4">Frequency_Stats</div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#71717A]">STRUGGLES</span>
                        <span className="font-bold">x{(item.timesStruggled || item.flagCount || 0).toString().padStart(2, 'x')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#71717A]">LAST_SYNC</span>
                        <span className="font-bold">{item.lastReview || item.lastAddressed || 'DAY_01'}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white border border-[#EBEBEB] rounded-[24px]">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-4">Object_ID</div>
                <div className="font-mono text-[13px] break-all opacity-50">
                    {item._id || 'SYS_NULL_00'}
                </div>
            </div>
        </section>

        {/* ACTIONS */}
        <div className="pt-10 flex gap-4">
            <button className="flex-1 py-4 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-[#333333] transition-all">
                Drill_Down_Session
            </button>
            <button className="flex-1 py-4 bg-white border border-[#EBEBEB] text-[#111111] text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-[#FAFAFA] transition-all">
                Flag_For_Recovery
            </button>
        </div>
      </div>
      
      {/* DECORATIVE TERMINAL PULSE */}
      <div className="p-10 mt-auto border-t border-[#EBEBEB] flex items-center justify-between">
         <div className="flex gap-1">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 w-1 bg-[#111111]/10 rounded-full" />)}
         </div>
         <div className="font-mono text-[9px] text-[#A1A1AA]">CORE_SYNC_ACTIVE</div>
      </div>
    </div>
  );
}

function getStatusStyle(status: string) {
    if (!status) return 'bg-gray-100 text-gray-500';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'done' || s === 'retired') return 'bg-green-50 text-green-600 border border-green-100';
    if (s === 'in-progress' || s === 'active') return 'bg-blue-50 text-blue-600 border border-blue-100';
    if (s === 'overdue' || s === 'critical') return 'bg-rose-50 text-rose-500 border border-rose-100';
    return 'bg-gray-50 text-gray-500 border border-gray-100';
}
