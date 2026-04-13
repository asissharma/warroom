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
          setProjects(data.data);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Active Build Order</h2>
            <p className="text-[13px] text-[#A1A1AA]">Engineering objectives and project artifacts currently in production.</p>
          </div>
          <div className="flex gap-4">
              <button className="px-5 py-2.5 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#333333] transition-all">New_Project</button>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((p) => (
          <div 
            key={p._id} 
            onClick={() => onSelectItem({...p, source: 'projects'})}
            className="group flex flex-col bg-white border border-[#EBEBEB] p-8 rounded-[32px] hover:border-[#111111] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-[20px] group-hover:bg-[#111111] group-hover:text-white transition-all">🏗</div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-[#111111] mb-1">{p.name || 'Untitled Project'}</h3>
                        <div className="flex gap-3">
                            <StatusBadge status={p.status} />
                            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest">PJX_ID_{p._id.substring(18)}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Assigned</div>
                    <div className="text-[13px] font-bold">DAY_{p.dayAssigned || '01'}</div>
                </div>
            </div>

            <p className="text-[15px] text-[#71717A] italic serif leading-snug mb-8 max-w-2xl">
                "{p.description || 'Engineering objective pending detail calibration.'}"
            </p>

            <div className="flex items-center gap-12 pt-6 border-t border-[#FAFAFA]">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#EBEBEB]" />)}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-8">
                    <div>
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Retries</div>
                        <div className="text-[13px] font-bold">{p.carryForwardCount || 0}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center text-[18px]">→</div>
                </div>
            </div>
            
            {/* GLITCH DECORATION */}
            <div className="absolute bottom-0 right-0 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#EBEBEB] to-[#111111] opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        'Done': 'text-[#166534] bg-[#F0FDF4] border border-[#DCFCE7]',
        'InProgress': 'text-[#7E22CE] bg-[#FAF5FF] border border-[#F3E8FF]',
        'Pending': 'text-[#A1A1AA] bg-[#FAFAFA] border border-[#F4F4F5]',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${styles[status] || styles['Pending']}`}>
            {status || 'Pending'}
        </span>
    );
}
