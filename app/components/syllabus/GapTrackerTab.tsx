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
          // Dynamic morphism variety as per plan
          const styledData = data.data.map((item: any, idx: number) => ({
            ...item,
            style: idx % 3 === 0 ? 'alert' : idx % 3 === 1 ? 'standard' : 'glass' 
          }));
          setGaps(styledData);
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

  if (gaps.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-6 text-3xl shadow-sm">
            🛡
        </div>
        <h3 className="text-xl serif font-bold text-[#111111] mb-2">Systems Nominal</h3>
        <p className="text-[14px] text-[#A1A1AA] max-w-sm px-6">No intelligence gaps detected in the current phase. Your architecture is sound and all objectives are reaching solid depth.</p>
        <button className="mt-8 px-6 py-2 border border-[#EBEBEB] text-[#111111] text-[12px] font-bold uppercase tracking-widest rounded-lg hover:border-[#111111] transition-all">Manual Intelligence Capture</button>
      </div>
    );
  }

  const criticalCount = gaps.filter(g => g.severity === 'critical').length;
  const mediumCount = gaps.filter(g => g.severity === 'medium').length;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-l-4 border-[#F97316] pl-6 py-2">
        <div>
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] mb-2">SURVIVAL_ENGINE // ACTIVE_GAPS</div>
            <h2 className="text-3xl serif tracking-tight">Intelligence Recovery Feed</h2>
        </div>
        <div className="flex gap-6">
            <div className="text-right">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Critical_Count</div>
                <div className="text-2xl font-bold text-[#F97316] tracking-tighter">{criticalCount.toString().padStart(2, '0')}</div>
            </div>
            <div className="text-right">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Recovery_Active</div>
                <div className="text-2xl font-bold text-[#111111] tracking-tighter">{mediumCount.toString().padStart(2, '0')}</div>
            </div>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {gaps.map((gap) => (
          <div 
            key={gap._id} 
            onClick={() => onSelectItem({...gap, source: 'gaps'})}
            className="break-inside-avoid-column"
          >
            <GapCard gap={gap} />
          </div>
        ))}
        
        {/* MANUAL CAPTURE CARD */}
        <div className="break-inside-avoid-column">
            <div className="p-10 border-2 border-dashed border-[#EBEBEB] rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-[#111111] transition-all cursor-pointer bg-white/50">
               <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-6 text-[#A1A1AA] group-hover:bg-[#111111] group-hover:text-white transition-all">
                  +
               </div>
               <h3 className="text-[15px] font-bold text-[#111111] tracking-tight mb-2">Manual Intelligence Capture</h3>
               <p className="text-[13px] text-[#A1A1AA] leading-relaxed px-4">Identify a concept for the survival engine manually.</p>
            </div>
        </div>
      </div>
    </div>
  );
}

function GapCard({ gap }: { gap: any }) {
    if (gap.style === 'alert' || gap.severity === 'critical') {
        return (
            <div className={`
                p-10 rounded-[32px] border-2 morphic-hover relative
                ${gap.severity === 'critical' ? 'bg-white border-[#F97316] shadow-[0_24px_64px_-16px_rgba(249,115,22,0.2)]' : 'bg-white border-[#EBEBEB] border-t-[#F97316] border-t-8'}
            `}>
                {gap.severity === 'critical' && (
                    <div className="absolute top-8 right-10">
                        <div className="w-3 h-3 rounded-full bg-[#F97316] animate-ping" />
                    </div>
                )}
                
                <div className="font-mono text-[9px] text-[#F97316] font-bold uppercase tracking-[0.2em] mb-6">ALERT // {gap.severity.toUpperCase()}_GAP</div>
                
                <h3 className="text-3xl serif text-[#111111] leading-tight mb-6 tracking-tight">
                    {gap.concept}
                </h3>
                
                <p className="text-[14px] text-[#71717A] leading-relaxed italic mb-8 border-l-2 border-[#F97316] pl-6">
                    "{gap.notes || 'System objective retrieval in progress. Flagged for immediate survival drill-down.'}"
                </p>
                
                <div className="flex justify-between items-center pt-8 border-t border-[#FAFAFA]">
                    <div>
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Flag_Count</div>
                        <div className="text-[18px] font-bold text-[#111111] tracking-tighter">x{(gap.flagCount || 1).toString().padStart(2, '0')}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Source</div>
                        <div className="text-[12px] font-bold text-[#111111] uppercase tracking-widest">{gap.sourceType || 'SYSTEM'}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (gap.style === 'glass') {
        return (
            <div className="glass-card p-8 rounded-3xl morphic-hover border-white/40">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-2 h-2 rounded-full ${gap.severity === 'medium' ? 'bg-[#F97316]' : 'bg-[#A1A1AA]'}`} />
                    <div className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest">DRIFT_DETECTED // {gap.severity.toUpperCase()}</div>
                </div>
                <h3 className="text-xl serif text-[#111111] leading-snug mb-4">{gap.concept}</h3>
                <div className="flex justify-between items-end mt-8">
                    <span className="text-[10px] font-mono text-[#A1A1AA]">SOURCE: {(gap.sourceType || 'SYSTEM').toUpperCase()}</span>
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-[14px]">→</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-[#EBEBEB] morphic-hover border-l-8 border-l-[#A1A1AA]">
            <div className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest mb-4">GAP_ID_{gap._id.substring(18)}</div>
            <h3 className="text-[18px] font-bold text-[#111111] tracking-tight mb-4">{gap.concept}</h3>
            <div className="flex justify-between items-center pt-4 border-t border-[#FAFAFA]">
                <span className="text-[11px] font-mono text-[#71717A] uppercase">LVL_{gap.depthReached || 1} DEPTH</span>
                <span className="text-[11px] font-bold text-[#111111]">FLAG {gap.flagCount || 1}</span>
            </div>
        </div>
    );
}
