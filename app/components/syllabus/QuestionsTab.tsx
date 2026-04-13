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
          setQuestions(data.data);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
            <h2 className="text-[28px] serif font-bold tracking-tight mb-1">Active Protocols</h2>
            <p className="text-[13px] text-[#A1A1AA]">Spaced repetition queue prioritized by difficulty and depth.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="px-5 py-3 border border-[#EBEBEB] rounded-xl flex items-center gap-6">
                <div>
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Total_Pool</div>
                    <div className="text-[15px] font-bold">{stats?.total || 0}</div>
                </div>
                <div className="h-6 w-[1px] bg-[#EBEBEB]" />
                <div>
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5">Overdue</div>
                    <div className="text-[15px] font-bold text-rose-500">
                        {questions.filter(q => q.nextReviewDate && new Date(q.nextReviewDate) < new Date()).length}
                    </div>
                </div>
            </div>
            <button className="px-6 py-3 bg-[#111111] text-white text-[12px] rounded-xl font-bold uppercase tracking-widest hover:bg-[#333333] transition-all">Filter</button>
        </div>
      </div>

      <div className="space-y-[1px] bg-[#EBEBEB] border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm">
        {questions.map((q, idx) => {
          const isOverdue = q.nextReviewDate && new Date(q.nextReviewDate) < new Date();
          return (
            <div 
              key={q._id} 
              onClick={() => onSelectItem({...q, source: 'questions'})}
              className={`
                group flex items-center gap-8 p-6 transition-all cursor-pointer relative
                ${isOverdue ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'bg-white hover:bg-[#FAFAFA]'}
              `}
            >
              <div className="w-6 font-mono text-[11px] text-[#A1A1AA]">
                {(idx + 1).toString().padStart(2, '0')}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[15px] font-medium tracking-tight text-[#111111] line-clamp-1">
                        {q.text}
                    </h3>
                    {isOverdue && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 font-mono text-[8px] font-bold rounded uppercase">Overdue</span>
                    )}
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-[#A1A1AA] uppercase tracking-widest">
                    <span>STRUGGLES: {q.timesStruggled || 0}</span>
                    <span className="w-1 h-1 rounded-full bg-[#EBEBEB]" />
                    <span>DIFFICULTY: {q.difficulty || 1}</span>
                </div>
              </div>

              <div className="flex items-center gap-10 text-right shrink-0">
                  <div>
                      <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-0.5 tracking-widest">Next_Review</div>
                      <div className={`text-[12px] font-bold ${isOverdue ? 'text-rose-500' : 'text-[#111111]'}`}>
                        {q.nextReviewDate ? new Date(q.nextReviewDate).toLocaleDateString() : 'QUEUED'}
                      </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[14px] group-hover:bg-[#111111] group-hover:text-white transition-all">
                      →
                  </div>
              </div>
            </div>
          );
        })}
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
