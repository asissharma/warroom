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
          // Assign random "Tactical" styles for variety as per Pinterest plan
          const styledData = data.data.map((item: any, idx: number) => ({
            ...item,
            style: idx % 3 === 0 ? 'glass' : idx % 3 === 1 ? 'editorial' : 'brutalist' 
          }));
          setTopics(styledData);
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

  if (topics.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAFAFA] flex items-center justify-center mb-6 text-3xl">📭</div>
        <h3 className="text-xl serif font-bold text-[#111111] mb-2">No Intelligence Objects Found</h3>
        <p className="text-[14px] text-[#A1A1AA] max-w-sm">The curriculum database appears to be offline or empty. Initialize seeding protocol to continue.</p>
        <button className="mt-8 px-6 py-2 bg-[#111111] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg">Initialize DB</button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl serif tracking-tight underline decoration-[#EBEBEB] underline-offset-8">Tech Spine Repository</h2>
          <div className="flex-1" />
          <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em]">Source: MONGODB_COLLECTION</div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {topics.map((item) => (
          <div 
            key={item._id} 
            onClick={() => onSelectItem({...item, source: 'spine'})}
            className="break-inside-avoid-column"
          >
            <TopicCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicCard({ item }: { item: any }) {
    if (item.style === 'glass') {
        return (
            <div className="glass-card p-8 rounded-[32px] morphic-hover border-white/50 relative group">
                <div className="absolute top-6 right-8 text-[20px] text-[#A1A1AA]">✻</div>
                <div className="font-mono text-[9px] text-[#0369A1] uppercase tracking-widest mb-6">W{item.week} // INTEL_OBJECT</div>
                <h3 className="text-2xl serif text-[#111111] leading-tight mb-4">{item.topic}</h3>
                <p className="text-[13px] text-[#71717A] leading-relaxed line-clamp-3 mb-6 italic">
                    {item.microtask || 'Deep dive into core engineering concepts.'}
                </p>
                <div className="flex justify-between items-center pt-6 border-t border-black/5">
                    <StatusBadge status={item.status} />
                    <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">ACTIVE_NODE</span>
                </div>
            </div>
        );
    }

    if (item.style === 'editorial') {
        return (
            <div className="bg-white p-10 rounded-2xl border border-[#EBEBEB] morphic-hover border-b-4 border-b-[#111111]">
                <div className="flex justify-between items-start mb-10">
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-mono text-[11px]">
                        {item.order.toString().padStart(2, '0')}
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-widest">Metadata</div>
                        <div className="text-[11px] font-bold">{item.phase?.toUpperCase() || 'PHASE_ALPHA'}</div>
                    </div>
                </div>
                <h3 className="text-4xl serif text-[#111111] leading-[1] mb-8 tracking-tighter">
                    {item.topic}
                </h3>
                <div className="space-y-4">
                    <div className="h-[2px] w-full bg-[#FAFAFA]" />
                    <div className="flex justify-between items-center">
                        <StatusBadge status={item.status} />
                        <div className="flex gap-2 text-[10px] font-mono text-[#A1A1AA]">
                            WEEK_{item.week}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Brutalist
    return (
        <div className="bg-white p-8 rounded-xl border border-[#EBEBEB] morphic-hover hover:border-[#111111] relative border-l-8 border-l-[#E0F2FE]">
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] mb-4">OBJECT_IDENTIFIER: TS_{item.order}</div>
            <h3 className="text-[19px] font-bold text-[#111111] tracking-tight leading-tight mb-4 group-hover:text-black">
                {item.topic}
            </h3>
            <p className="text-[13px] text-[#71717A] leading-tight mb-8">
                {item.microtask || 'System objective pending allocation.'}
            </p>
            <div className="flex items-center justify-between">
                <StatusBadge status={item.status} />
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FAFAFA] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-all">
                    →
                </div>
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
