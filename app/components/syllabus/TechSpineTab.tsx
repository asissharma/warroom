'use client';

import React, { useState, useEffect } from 'react';

interface TechSpineTabProps {
  onSelectItem: (item: any) => void;
}

export default function TechSpineTab({ onSelectItem }: TechSpineTabProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/techspine');
        const data = await res.json();
        if (data.success) {
          setTopics(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch tech spine:', e);
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Syncing_Tech_Spine...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Knowledge Repository</h2>
            <p className="text-[13px] text-[#A1A1AA]">Index of core technical nodes and architectural concepts.</p>
          </div>
          <div className="flex gap-4">
              <div className="px-4 py-2 border border-[#EBEBEB] rounded-xl text-[12px] font-mono">Total_Nodes: {topics.length}</div>
          </div>
      </div>

      <div className="space-y-[1px] bg-[#EBEBEB] border border-[#EBEBEB] rounded-2xl overflow-hidden">
        {topics.map((item, idx) => (
          <div 
            key={item._id} 
            onClick={() => onSelectItem({...item, source: 'spine'})}
            className="group flex items-center gap-8 bg-white p-6 hover:bg-[#FAFAFA] transition-all cursor-pointer relative"
          >
            <div className="w-12 font-mono text-[11px] text-[#A1A1AA] leading-none">
                {(idx + 1).toString().padStart(2, '0')}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-4 mb-1">
                    <h3 className="text-[16px] font-bold tracking-tight text-[#111111]">
                        {item.topic}
                    </h3>
                    <StatusBadge status={item.status} />
                </div>
                <div className="text-[13px] text-[#A1A1AA] line-clamp-1">{item.microtask || 'Primary technical object.'}</div>
            </div>

            <div className="flex items-center gap-12 text-right shrink-0">
                <div>
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5 tracking-widest">Phase</div>
                    <div className="text-[12px] font-bold">{item.phase?.toUpperCase() || 'PHASE_ALPHA'}</div>
                </div>
                <div>
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5 tracking-widest">Schedule</div>
                    <div className="text-[12px] font-bold">W{item.week}</div>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[14px] group-hover:bg-[#111111] group-hover:text-white transition-all">
                    →
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        'completed': 'text-[#166534] bg-[#F0FDF4]',
        'in-progress': 'text-[#0369A1] bg-[#E0F2FE]',
        'pending': 'text-[#A1A1AA] bg-[#FAFAFA]',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${styles[status] || styles['pending']}`}>
            {status || 'pending'}
        </span>
    );
}
