'use client';

import React, { useState, useEffect } from 'react';

interface SurvivalTabProps {
  onSelectItem: (item: any) => void;
}

export default function SurvivalTab({ onSelectItem }: SurvivalTabProps) {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/survival');
        const data = await res.json();
        if (data.success) {
          setAreas(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch survival areas:', e);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12 border-l-4 border-rose-500 pl-6">
          <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Survival Protocols</h2>
            <p className="text-[13px] text-[#A1A1AA]">Critical curriculum areas identified for immediate focus and recovery.</p>
          </div>
          <div className="flex gap-6 items-center">
              <div className="text-right">
                <div className="text-[9px] font-mono text-[#71717A] uppercase mb-0.5">Critical_Areas</div>
                <div className="text-[20px] font-bold text-rose-500">
                    {areas.filter(a => a.urgency === 'CRITICAL').length.toString().padStart(2, '0')}
                </div>
              </div>
          </div>
      </div>

      <div className="space-y-6">
        {areas.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#EBEBEB] rounded-[32px] border-dashed">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-2xl mb-6">🛡</div>
            <h3 className="text-xl font-bold mb-2">Systems Nominal</h3>
            <p className="text-[14px] text-[#A1A1AA] max-w-sm">No critical survival areas identified. Your intelligence map is complete.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {areas.map((area) => (
              <div 
                key={area._id} 
                onClick={() => onSelectItem({...area, source: 'survival'})}
                className={`
                    group flex flex-col bg-white border rounded-[32px] p-8 transition-all cursor-pointer relative overflow-hidden
                    ${area.urgency === 'CRITICAL' ? 'border-rose-200 hover:border-rose-500 border-l-[12px] border-l-rose-500 shadow-sm' : 'border-[#EBEBEB] hover:border-[#111111]'}
                `}
              >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${area.urgency === 'CRITICAL' ? 'bg-rose-100 text-rose-500' : 'bg-orange-100 text-orange-600'}`}>
                            {area.urgency}_CORE
                        </div>
                        <h3 className="text-2xl font-bold text-[#111111] tracking-tight">{area.area}</h3>
                    </div>
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-widest">AREA_ID_{area.areaId}</div>
                </div>

                <p className="text-[15px] text-[#71717A] italic leading-relaxed mb-8 max-w-3xl border-l-2 border-[#EBEBEB] pl-8">
                    "{area.why || 'Critical architectural node requiring deep-dive session.'}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-[#FAFAFA]">
                    <div className="flex gap-4">
                       <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-widest">SUB_TOPICS: {area.topics?.length || 0}</span>
                       <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-widest">RECOVERY: IN_PROGRESS</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-[#111111] underline">DRILL_DOWN</span>
                        <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-[14px]">→</div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
