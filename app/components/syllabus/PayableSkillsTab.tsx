'use client';

import React, { useState, useEffect } from 'react';

interface PayableSkillsTabProps {
  onSelectItem: (item: any) => void;
}

export default function PayableSkillsTab({ onSelectItem }: PayableSkillsTabProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/skills');
        const data = await res.json();
        if (data.success) {
          // Filter for unique payable skills
          const filtered = data.data.filter((s: any) => s.type === 'payable' || s.type === 'technical');
          setSkills(filtered);
        }
      } catch (e) {
        console.error('Failed to fetch payable skills:', e);
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Syncing_Payable_Assets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Asset Matrix</h2>
            <p className="text-[13px] text-[#A1A1AA]">Marketable technical skills and architectural competencies.</p>
          </div>
          <div className="px-4 py-2 border border-[#EBEBEB] rounded-xl text-[12px] font-mono">Count: {skills.length}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((s, idx) => (
              <div key={s._id} onClick={() => onSelectItem({...s, source: 'payable_skills'})} className="group flex flex-col bg-white border border-[#EBEBEB] p-8 rounded-[32px] hover:border-[#F97316] transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#9A3412] flex items-center justify-center font-mono text-[14px]">{(idx + 1).toString().padStart(2, '0')}</div>
                      <div className="text-right">
                           <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Competency</div>
                           <div className="text-[20px] font-bold text-[#111111]">{s.completionPercent || 0}%</div>
                      </div>
                  </div>
                  <h3 className="text-2xl serif text-[#111111] mb-6 tracking-tight group-hover:text-[#9A3412] transition-colors">{s.name}</h3>
                  <div className="w-full h-1.5 bg-[#FAFAFA] rounded-full overflow-hidden mb-8">
                      <div className="h-full bg-[#9A3412]" style={{ width: `${s.completionPercent || 0}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-[#A1A1AA] uppercase tracking-widest">
                      <span>ASSET_CLASS: TECHNICAL</span>
                      <span>{s.chapter ? `CHAPTER: ${s.chapter}` : 'DEPTH: LVL_03'}</span>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
