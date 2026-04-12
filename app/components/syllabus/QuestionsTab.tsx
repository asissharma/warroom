'use client';

import React, { useState, useEffect } from 'react';

interface QuestionsTabProps {
  onSelectItem: (item: any) => void;
}

export default function QuestionsTab({ onSelectItem }: QuestionsTabProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/questions');
        const data = await res.json();
        if (data.success) {
          // Dynamic morphism variety as per plan
          const styledData = data.data.map((item: any, idx: number) => ({
            ...item,
            style: idx % 2 === 0 ? 'detailed' : 'compact' 
          }));
          setQuestions(styledData);
          setStats(data.pagination);
        }
      } catch (e) {
        console.error('Failed to fetch questions:', e);
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Syncing_Intelligence_Pool...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-6 text-3xl shadow-sm">
            🎯
        </div>
        <h3 className="text-xl serif font-bold text-[#111111] mb-2">No High-Value Targets</h3>
        <p className="text-[14px] text-[#A1A1AA] max-w-sm">Spaced repetition queue is currently empty. Complete daily blocks to populate the intelligence pool.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] mb-2">INTELLIGENCE_POOL // SM2_ENGINE</div>
            <h2 className="text-3xl serif tracking-tight">Active Protocol Questions</h2>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-1">Total_Pool</div>
                <div className="text-2xl font-bold text-[#111111] tracking-tighter">{stats?.total || 0}</div>
            </div>
            <div className="flex gap-3">
                <input 
                    type="text" 
                    placeholder="Search Protocol..." 
                    className="bg-white border border-[#EBEBEB] rounded-xl px-5 py-3 text-[13px] w-72 focus:outline-none focus:border-[#111111] transition-all shadow-sm"
                />
                <button className="px-6 py-3 bg-[#111111] text-white text-[12px] rounded-xl font-bold uppercase tracking-widest hover:bg-[#333333] transition-all focus:scale-[0.98]">Filter</button>
            </div>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {questions.map((q) => (
          <div 
            key={q._id} 
            onClick={() => onSelectItem({...q, source: 'questions'})}
            className="break-inside-avoid-column"
          >
            <QuestionCard q={q} />
          </div>
        ))}
      </div>

      {stats?.pages > 1 && (
          <div className="pt-12 text-center">
              <button className="px-8 py-3 bg-white border border-[#EBEBEB] text-[#111111] text-[12px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#FAFAFA] transition-all">
                  Load More Targets
              </button>
          </div>
      )}
    </div>
  );
}

function QuestionCard({ q }: { q: any }) {
    // Determine if overdue based on date comparison
    const isOverdue = q.nextReviewDate && new Date(q.nextReviewDate) < new Date();
    
    return (
        <div className={`
            p-8 bg-white border rounded-2xl transition-all duration-300 relative overflow-hidden group morphic-hover
            ${q.status === 'retired' ? 'opacity-50 grayscale-[0.8]' : 'border-[#EBEBEB] hover:border-[#111111]'}
            ${isOverdue && q.status !== 'retired' ? 'border-[#F97316] shadow-[0_0_24px_-12px_rgba(249,115,22,0.3)]' : ''}
            ${q.style === 'detailed' ? 'pt-10' : ''}
        `}>
            {isOverdue && q.status !== 'retired' && (
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#F97316] text-white font-mono text-[9px] font-bold uppercase tracking-widest">
                    SYSTEM_ALERT // OVERDUE
                </div>
            )}
            
            <div className="flex justify-between items-center mb-8">
                <div className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest truncate max-w-[120px]">
                    ID_{q._id.substring(18)}
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map((lvl) => (
                        <div 
                            key={lvl} 
                            className={`w-3 h-1 rounded-full ${lvl <= q.difficulty ? 'bg-[#111111]' : 'bg-[#EBEBEB]'}`} 
                        />
                    ))}
                </div>
            </div>

            <p className={`serif text-[#111111] leading-snug tracking-tight mb-10 ${q.style === 'detailed' ? 'text-[22px]' : 'text-[18px]'}`}>
                {q.text}
            </p>

            <div className="flex justify-between items-end pt-6 border-t border-[#FAFAFA]">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${(q.timesStruggled || 0) > 3 ? 'bg-[#F97316]' : 'bg-[#111111]'}`} />
                        <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">{q.timesStruggled || 0} STRUGGLES</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#111111] uppercase tracking-tight">
                        {q.nextReviewDate ? new Date(q.nextReviewDate).toLocaleDateString() : 'QUEUED'}
                    </div>
                </div>
                
                <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${q.status === 'retired' ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-[#E0F2FE] text-[#0369A1]'}`}>
                    {q.status || 'Active'}
                </div>
            </div>
            
            {/* HOVER GLOSS */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
        </div>
    );
}
