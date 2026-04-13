'use client';

import React, { useState, useEffect } from 'react';

interface SkillsTabProps {
  onSelectItem: (item: any) => void;
}

export default function SkillsTab({ onSelectItem }: SkillsTabProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/skills');
        const data = await res.json();
        if (data.success) {
          setSkills(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch skills:', e);
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Syncing_Skill_Protocols...</div>
      </div>
    );
  }

  const softSkills = skills.filter(s => s.type === 'soft');
  const payableSkills = skills.filter(s => s.type === 'payable' || s.type === 'technical');

  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      <section>
        <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Asset Matrix</h2>
              <p className="text-[13px] text-[#A1A1AA]">Marketable technical skills and architectural competencies.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payableSkills.map((s) => (
                <div key={s._id} onClick={() => onSelectItem({...s, source: 'payable_skills'})} className="group flex flex-col bg-white border border-[#EBEBEB] p-8 rounded-[32px] hover:border-[#F97316] transition-all cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-[#9A3412] flex items-center justify-center font-mono text-[14px]">01</div>
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
                        <span>DEPTH: LVL_03</span>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {softSkills.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Human Interface Protocols</h2>
                <p className="text-[13px] text-[#A1A1AA]">Interpersonal intelligence and leadership heuristics.</p>
              </div>
          </div>

          <div className="space-y-[1px] bg-[#EBEBEB] border border-[#EBEBEB] rounded-2xl overflow-hidden">
              {softSkills.map((s) => (
                  <div key={s._id} onClick={() => onSelectItem({...s, source: 'soft_skills'})} className="flex items-center gap-8 bg-white p-6 hover:bg-[#F0FDF4] transition-all cursor-pointer group">
                      <div className="w-2 h-2 rounded-full bg-[#166534]" />
                      <div className="flex-1">
                          <h3 className="text-[16px] font-bold text-[#111111] mb-1">{s.name}</h3>
                          <p className="text-[13px] text-[#A1A1AA] line-clamp-1">{s.microPracticePrompt || 'Human interaction objective.'}</p>
                      </div>
                      <div className="text-right">
                          <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Integrity_Score</div>
                          <div className="text-[14px] font-bold text-[#166534]">{s.completionPercent || 0}%</div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[12px] group-hover:bg-[#166534] group-hover:text-white transition-all">→</div>
                  </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
