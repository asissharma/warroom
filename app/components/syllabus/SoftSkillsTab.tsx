'use client';

import React, { useState, useEffect } from 'react';

interface SoftSkillsTabProps {
  onSelectItem: (item: any) => void;
}

export default function SoftSkillsTab({ onSelectItem }: SoftSkillsTabProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/skills');
        const data = await res.json();
        if (data.success) {
          // Filter for unique soft skills
          const filtered = data.data.filter((s: any) => s.type === 'soft');
          setSkills(filtered);
        }
      } catch (e) {
        console.error('Failed to fetch soft skills:', e);
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Syncing_Soft_Protocols...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Human Interface Protocols</h2>
            <p className="text-[13px] text-[#A1A1AA]">Interpersonal intelligence and leadership heuristics.</p>
          </div>
          <div className="px-4 py-2 border border-[#EBEBEB] rounded-xl text-[12px] font-mono">Count: {skills.length}</div>
      </div>

      <div className="space-y-[1px] bg-[#EBEBEB] border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm">
          {skills.map((s, idx) => (
              <div key={s._id} onClick={() => onSelectItem({...s, source: 'soft_skills'})} className="flex items-center gap-8 bg-white p-6 hover:bg-[#F0FDF4] transition-all cursor-pointer group">
                  <div className="w-6 font-mono text-[11px] text-[#A1A1AA]">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-[#111111] mb-1">{s.name}</h3>
                      <p className="text-[13px] text-[#A1A1AA] line-clamp-1">{s.prompt || 'Human interaction objective.'}</p>
                  </div>
                  <div className="text-right">
                      <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Integrity_Score</div>
                      <div className="text-[14px] font-bold text-[#166534]">{s.completionPercent || 0}%</div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[12px] group-hover:bg-[#166534] group-hover:text-white transition-all">→</div>
              </div>
          ))}
      </div>
    </div>
  );
}
