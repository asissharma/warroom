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
          // Dynamic morphism variety as per plan
          const styledData = data.data.map((item: any, idx: number) => ({
            ...item,
            style: idx % 3 === 0 ? 'glossy' : idx % 3 === 1 ? 'editorial' : 'brutalist' 
          }));
          setSkills(styledData);
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

  if (skills.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAFAFA] flex items-center justify-center mb-6 text-3xl">🧩</div>
        <h3 className="text-xl serif font-bold text-[#111111] mb-2">Skill Matrix Offline</h3>
        <p className="text-[14px] text-[#A1A1AA] max-w-sm">No skill protocols identified in the database. Please initialize the curriculum to populate the matrix.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {softSkills.length > 0 && (
        <section>
          <div className="flex items-center gap-6 mb-12">
              <h2 className="text-3xl serif tracking-tight">Soft Protocol</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-[#166534]/10 via-[#166534]/5 to-transparent"></div>
          </div>

          <div className="columns-1 md:columns-2 gap-8 space-y-8">
              {softSkills.map((s) => (
                  <div key={s._id} onClick={() => onSelectItem({...s, source: 'soft_skills'})} className="break-inside-avoid-column">
                      <SkillCard s={s} color="soft" />
                  </div>
              ))}
          </div>
        </section>
      )}

      {payableSkills.length > 0 && (
        <section>
          <div className="flex items-center gap-6 mb-12">
              <h2 className="text-3xl serif tracking-tight">Payable Assets</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-[#9A3412]/10 via-[#9A3412]/5 to-transparent"></div>
          </div>

          <div className="columns-1 md:columns-2 gap-8 space-y-8">
              {payableSkills.map((s) => (
                  <div key={s._id} onClick={() => onSelectItem({...s, source: 'payable_skills'})} className="break-inside-avoid-column">
                      <SkillCard s={s} color="payable" />
                  </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SkillCard({ s, color }: { s: any, color: string }) {
    const colorMap: any = {
        soft: { text: 'text-[#166534]', bg: 'bg-[#F0FDF4]', bar: 'bg-[#166534]' },
        payable: { text: 'text-[#9A3412]', bg: 'bg-[#FFF7ED]', bar: 'bg-[#9A3412]' },
    };

    if (s.style === 'glossy') {
        return (
            <div className="glass-card p-10 rounded-[40px] morphic-hover border-white/60">
                <div className="flex justify-between items-start mb-10">
                    <div className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-[0.2em]">Skill_Protocol_0{s._id.substring(22)}</div>
                    {/* Placeholder for gap detection logic */}
                    <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">ACTIVE_DEPLOYMENT</span>
                </div>
                <h3 className="text-3xl serif text-[#111111] leading-none mb-8 tracking-tight">{s.name}</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[11px] font-mono text-[#A1A1AA] uppercase">Mastery_Level</span>
                        <span className="text-[20px] font-bold text-[#111111]">{s.completionPercent || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full ${colorMap[color].bar} transition-all duration-1000`} style={{ width: `${s.completionPercent || 0}%` }} />
                    </div>
                </div>
                <div className="mt-8 text-[11px] font-mono text-[#A1A1AA] uppercase tracking-widest text-right">
                    Last_Deployed: {s.lastDoneDay ? `Day ${s.lastDoneDay}` : 'PENDING'}
                </div>
            </div>
        );
    }

    if (s.style === 'editorial') {
        return (
            <div className="bg-white border border-[#EBEBEB] p-12 rounded-3xl morphic-hover relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAFAFA] rounded-bl-full -mr-16 -mt-16 group-hover:bg-[#111111] transition-all duration-500" />
                <h3 className="text-4xl serif text-[#111111] leading-[0.9] mb-12 tracking-tight max-w-[200px]">
                    {s.name}
                </h3>
                <div className="flex gap-8 border-t border-[#F0F0F0] pt-8">
                    <div>
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Index</div>
                        <div className="text-[18px] font-bold text-[#111111]">{s.completionPercent || 0}%</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Status</div>
                        <div className={`text-[11px] font-bold uppercase tracking-widest ${colorMap[color].text}`}>{color === 'soft' ? 'SOCIAL' : 'ASSET'}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-[#EBEBEB] morphic-hover border-b-8 border-b-[#EBEBEB]">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[19px] font-bold text-[#111111] tracking-tight">{s.name}</h3>
                 <div className="w-3 h-3 rounded-full bg-[#111111]" />
            </div>
            <p className="text-[13px] text-[#A1A1AA] mb-6 line-clamp-2">{s.microPracticePrompt || 'Continuous practice Protocol deployed daily to maintain high-end production capability.'}</p>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#71717A]">{s.completionPercent || 0}% COMPETENCY</span>
                <span className="text-[10px] font-mono text-[#111111] underline">VIEW_DRIFT_LOG →</span>
            </div>
        </div>
    );
}
