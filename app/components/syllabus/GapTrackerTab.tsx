'use client';

import React, { useState, useEffect } from 'react';

interface GapTrackerTabProps {
  onSelectItem: (item: any) => void;
}

export default function GapTrackerTab({ onSelectItem }: GapTrackerTabProps) {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/gaps');
        const data = await res.json();
        if (data.success) {
          setGaps(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch gaps:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-50">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Scanning_Architecture_Gaps...</div>
      </div>
    );
  }

  const criticalCount = gaps.filter(g => g.severity === 'critical').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12 border-l-4 border-rose-500 pl-6">
          <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Intelligence Recovery Feed</h2>
            <p className="text-[13px] text-[#A1A1AA]">Identified drifts in curriculum depth requiring immediate survival focus.</p>
          </div>
          <div className="flex gap-6 items-center">
              <div className="text-right">
                <div className="text-[9px] font-mono text-[#71717A] uppercase mb-0.5">Critical_Drifts</div>
                <div className="text-[20px] font-bold text-rose-500">{criticalCount.toString().padStart(2, '0')}</div>
              </div>
              <button className="px-5 py-2.5 bg-rose-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">New_Capture</button>
          </div>
      </div>

      <div className="space-y-4">
        {gaps.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#EBEBEB] rounded-[32px] border-dashed">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-2xl mb-6">🛡</div>
            <h3 className="text-xl font-bold mb-2">Systems Nominal</h3>
            <p className="text-[14px] text-[#A1A1AA] max-w-sm">No critical data drifts detected in current intelligence phase.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gaps.map((gap) => (
              <div 
                key={gap._id} 
                onClick={() => onSelectItem({...gap, source: 'gaps'})}
                className={`
                    group flex items-center gap-8 p-8 border rounded-[32px] transition-all cursor-pointer relative overflow-hidden
                    ${gap.severity === 'critical' ? 'bg-white border-rose-200 hover:border-rose-500 border-l-[12px] border-l-rose-500' : 'bg-white border-[#EBEBEB] hover:border-[#111111]'}
                `}
              >
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${gap.severity === 'critical' ? 'bg-rose-100 text-rose-500' : 'bg-orange-100 text-orange-600'}`}>
                            DRFT_{gap.severity.toUpperCase()}
                        </div>
                        <h3 className="text-[18px] font-bold text-[#111111] tracking-tight">{gap.concept}</h3>
                    </div>
                    <p className="text-[14px] text-[#71717A] italic leading-relaxed line-clamp-1 border-l border-[#EBEBEB] pl-4">
                        {gap.notes || 'Recovery strategy pending.'}
                    </p>
                </div>

                <div className="flex items-center gap-12 text-right shrink-0">
                    <div>
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Flags</div>
                        <div className="text-[16px] font-bold">x{(gap.flagCount || 1).toString().padStart(2, '0')}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Source</div>
                        <div className="text-[11px] font-bold uppercase tracking-widest">{gap.sourceType || 'SYSTEM'}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center text-[18px]">→</div>
                </div>

                {gap.severity === 'critical' && (
                    <div className="absolute top-4 right-8">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* MANUAL CAPTURE FOOTER */}
        <div className="p-10 border-2 border-dashed border-[#EBEBEB] rounded-[32px] flex items-center justify-between group hover:border-[#111111] transition-all cursor-pointer">
            <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-xl">+</div>
                <div>
                     <h4 className="font-bold text-[15px]">Manual Intelligence Capture</h4>
                     <p className="text-[12px] text-[#A1A1AA]">Identify and archive a concept for survival recovery.</p>
                </div>
            </div>
            <span className="font-mono text-[10px] text-[#A1A1AA] group-hover:text-[#111111]">PROTOCOL_ALPHA_09</span>
        </div>
      </div>
    </div>
  );
}
