'use client';

import React, { useState, useEffect } from 'react';

interface ProjectsTabProps {
  onSelectItem: (item: any) => void;
}

export default function ProjectsTab({ onSelectItem }: ProjectsTabProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/projects');
        const data = await res.json();
        if (data.success) {
          // Dynamic morphism variety as per plan
          const styledData = data.data.map((item: any, idx: number) => ({
            ...item,
            style: idx % 3 === 0 ? 'featured' : idx % 3 === 1 ? 'glass' : 'compact' 
          }));
          setProjects(styledData);
        }
      } catch (e) {
        console.error('Failed to fetch projects:', e);
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Syncing_Build_Order...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-6 text-3xl shadow-sm">
            🏗
        </div>
        <h3 className="text-xl serif font-bold text-[#111111] mb-2">No Active Build Orders</h3>
        <p className="text-[14px] text-[#A1A1AA] max-w-sm">The project pipeline is currently clear. Assign new objectives from the curriculum master list.</p>
        <button className="mt-8 px-6 py-2 bg-[#111111] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg">Browse Projects</button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl serif tracking-tight decoration-[#EBEBEB] underline underline-offset-8">Active Build Order</h2>
        <div className="flex gap-4">
            <div className="bg-white border border-[#EBEBEB] rounded-xl px-4 py-2 text-[11px] font-mono text-[#71717A] tracking-widest">
                VERIFYING_ARTIFACTS...
            </div>
        </div>
      </div>

      <div className="columns-1 lg:columns-2 gap-8 space-y-8">
        {projects.map((p) => (
          <div 
            key={p._id} 
            onClick={() => onSelectItem({...p, source: 'projects'})}
            className="break-inside-avoid-column"
          >
            <ProjectCard p={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ p }: { p: any }) {
    if (p.style === 'featured') {
        return (
            <div className="bg-white border border-[#EBEBEB] rounded-[32px] overflow-hidden morphic-hover border-b-8 border-b-[#7E22CE]">
                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-[#FAF5FF] flex items-center justify-center text-[24px]">🏗</div>
                        <div className="text-right">
                            <div className="text-[9px] font-mono text-[#FAF5FF] bg-[#7E22CE] px-2 py-1 rounded inline-block uppercase mb-2">BUILD_ALPHA</div>
                            <div className="text-[13px] font-bold text-[#111111]">DAY_{p.dayAssigned || '01'}</div>
                        </div>
                    </div>
                    
                    <h3 className="text-4xl serif text-[#111111] leading-[1] mb-6 tracking-tighter">{p.name || 'Untitled Project'}</h3>
                    <p className="text-[17px] text-[#71717A] italic serif leading-snug mb-10">
                        "{p.description || 'Primary engineering objective pending detail calibration.'}"
                    </p>
                    
                    {p.doneMeansCriteria && p.doneMeansCriteria.length > 0 && (
                        <div className="space-y-4 mb-10">
                            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest">Acceptance_Logic</div>
                            <div className="flex flex-wrap gap-2">
                                {p.doneMeansCriteria.map((c: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-[#FAFAFA] border border-[#EBEBEB] text-[12px] rounded-lg text-[#111111]">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-8 border-t border-[#FAFAFA]">
                        <StatusBadge status={p.status} />
                        {(p.carryForwardCount || 0) > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-[11px] font-mono text-rose-500 font-bold uppercase tracking-widest">{p.carryForwardCount} CARRY EVENTS</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (p.style === 'glass') {
        return (
            <div className="glass-card p-8 rounded-[32px] morphic-hover border-white/50">
                <div className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest mb-4">FUTURE_OBJECTIVE</div>
                <h3 className="text-2xl serif text-[#111111] leading-tight mb-4">{p.name || 'Untitled Project'}</h3>
                <p className="text-[14px] text-[#71717A] leading-relaxed line-clamp-3">
                    {p.description || 'Engineering objective retrieved from curriculum.'}
                </p>
                <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center">
                    <StatusBadge status={p.status} />
                    <div className="text-[10px] font-mono text-[#A1A1AA]">ID: {p._id.substring(18)}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-[#EBEBEB] morphic-hover flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-[#FAFAFA] flex items-center justify-center text-[18px] shrink-0">✔</div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[18px] font-bold text-[#111111] tracking-tight">{p.name || 'Untitled Project'}</h3>
                    <StatusBadge status={p.status} />
                </div>
                <p className="text-[13px] text-[#71717A] line-clamp-2">{p.description || 'Engineering objective retrieved from curriculum.'}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        'Done': 'text-[#166534] bg-[#F0FDF4]',
        'InProgress': 'text-[#7E22CE] bg-[#FAF5FF]',
        'Pending': 'text-[#A1A1AA] bg-[#FAFAFA]',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${styles[status] || styles['Pending']}`}>
            {status || 'Pending'}
        </span>
    );
}
