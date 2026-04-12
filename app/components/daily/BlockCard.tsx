'use client';

import React, { useState } from 'react';

interface BlockCardProps {
  type: 'spine' | 'softSkill' | 'payableSkill' | 'survival' | 'questions' | 'project';
  data: any;
  onUpdate: (updateData: any) => void;
  onOpenChat: () => void;
}

export default function BlockCard({ type, data, onUpdate, onOpenChat }: BlockCardProps) {
  if (!data) return null;

  const [localStatus, setLocalStatus] = useState(data.status || 'NotStarted');

  const handleStatusChange = (newStatus: string) => {
    setLocalStatus(newStatus);
    onUpdate({ status: newStatus, syncStatus: newStatus });
  };

  const statusColors: any = {
    'NotStarted': 'bg-white border-transparent shadow-sm shadow-slate-200/50',
    'InProgress': 'bg-sky-50 border-sky-100 shadow-sm shadow-sky-100/50',
    'Done': 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-100/50',
    'Partial': 'bg-amber-50 border-amber-100 shadow-sm shadow-amber-100/50',
    'Skipped': 'bg-slate-50 border-slate-100 opacity-60',
    'Paused': 'bg-slate-100 border-transparent'
  };

  const renderContent = () => {
    switch (type) {
      case 'spine':
        return (
          <>
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">✦ {data.area}</div>
            <h3 className="text-lg font-medium text-slate-800 tracking-wide mb-2">{data.topicToday}</h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">{data.microtaskToday}</p>
            {localStatus === 'NotStarted' || localStatus === 'InProgress' ? (
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleStatusChange('Done')} className="px-5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">MARK DONE</button>
                <button onClick={onOpenChat} className="px-5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">OPEN CHAT</button>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">STATUS:</span>
                <span className="text-xs text-slate-700 uppercase font-medium tracking-widest">{localStatus}</span>
                <button onClick={() => handleStatusChange('NotStarted')} className="ml-auto px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium transition-colors uppercase tracking-[0.2em] shadow-sm border border-slate-200">UNDO</button>
              </div>
            )}
          </>
        );
      case 'softSkill':
        return (
          <>
            <div className="text-[10px] text-amber-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">✦ SOFT SKILL</div>
            <h3 className="text-lg font-medium text-slate-800 tracking-wide mb-2">{data.skillName}</h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">{data.prompt}</p>
            {localStatus === 'Done' ? (
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-amber-100/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">STATUS:</span>
                <span className="text-xs text-emerald-600 font-medium uppercase tracking-widest">DONE</span>
                <button onClick={() => { setLocalStatus('NotStarted'); onUpdate({ isDone: false, status: 'NotStarted', syncStatus: 'NotStarted' }); }} className="ml-auto px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium transition-colors uppercase tracking-[0.2em] shadow-sm border border-slate-200">UNDO</button>
              </div>
            ) : (
              <button onClick={() => { setLocalStatus('Done'); onUpdate({ isDone: true, status: 'Done', syncStatus: 'Done' }); }} className="mt-6 px-5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">MARK DONE</button>
            )}
          </>
        );
      case 'payableSkill':
        return (
          <>
            <div className="text-[10px] text-emerald-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">✦ PAYABLE SKILL — CH {data.chapter}</div>
            <h3 className="text-lg font-medium text-slate-800 tracking-wide mb-2">{data.topicName}</h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">{data.prompt}</p>
            {localStatus === 'Done' ? (
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-emerald-100/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">STATUS:</span>
                <span className="text-xs text-emerald-600 font-medium uppercase tracking-widest">DONE</span>
                <button onClick={() => { setLocalStatus('NotStarted'); onUpdate({ isDone: false, status: 'NotStarted', syncStatus: 'NotStarted' }); }} className="ml-auto px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium transition-colors uppercase tracking-[0.2em] shadow-sm border border-slate-200">UNDO</button>
              </div>
            ) : (
              <button onClick={() => { setLocalStatus('Done'); onUpdate({ isDone: true, status: 'Done', syncStatus: 'Done' }); }} className="mt-6 px-5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">MARK DONE</button>
            )}
          </>
        );
      case 'survival':
        return (
          <>
            <div className="flex justify-between items-baseline mb-4 border-b border-slate-100 pb-2">
              <div className="text-[10px] text-red-500 uppercase tracking-[0.3em]">✦ SURVIVAL FOCUS</div>
              <div className="text-[10px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{data.severity}</div>
            </div>
            <h3 className="text-lg font-medium text-slate-800 tracking-wide mb-2">{data.gapName}</h3>
            <div className="flex gap-6 text-[10px] text-slate-400 mb-8 uppercase tracking-[0.2em]">
              <span>FLAGS // <span className="text-slate-600 font-bold">{data.flagCount}</span></span>
              <span>DAYS OPEN // <span className="text-slate-600 font-bold">{data.daysSinceOpen}</span></span>
            </div>
            <button onClick={onOpenChat} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] uppercase font-bold tracking-[0.3em] transition-all shadow-sm border border-red-100 text-center">
              ENGAGE SYSTEM
            </button>
          </>
        );
      case 'questions':
        return (
          <>
            <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
               <div className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.4em]">✦ MEMORY CORE</div>
               <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full">{data.total} UNITS</span>
            </div>
            
            <div className="flex overflow-x-auto snap-x gap-6 pb-8 pt-2 w-full hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {data.items && data.items.map((q: any, i: number) => (
                <div key={q.id} className="min-w-[85%] sm:min-w-[440px] snap-center bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/20 flex flex-col shrink-0 transition-all duration-500 hover:shadow-2xl">
                  <div className="px-8 py-5 border-b border-slate-100/50 flex justify-between items-center bg-slate-50/30 rounded-t-[2.5rem]">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-[0.4em]">Q_STREAM // {i + 1}</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{q.theme}</span>
                  </div>
                  <p className="p-8 text-base text-slate-600 font-light leading-relaxed flex-grow italic">"{q.text}"</p>
                  
                  {q.status ? (
                     <div className="flex items-center justify-between border-t border-slate-100/50 p-6 mt-auto bg-slate-50/20 rounded-b-[2.5rem]">
                       <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ${q.status === 'Correct' ? 'text-emerald-500' : 'text-rose-500'}`}>STATUS_LOG // {q.status}</span>
                       <button 
                         onClick={() => {
                            const newItems = [...data.items];
                            newItems[i].status = undefined;
                            const newCorrect = q.status === 'Correct' ? Math.max(0, (data.correct || 0) - 1) : (data.correct || 0);
                            const newStruggled = q.status === 'Struggled' ? Math.max(0, (data.struggled || 0) - 1) : (data.struggled || 0);
                            onUpdate({ correct: newCorrect, struggled: newStruggled, items: newItems, syncQuestion: { id: q.id, status: 'Undo' } });
                         }}
                         className="px-6 py-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full text-[10px] font-bold transition-all uppercase tracking-[0.3em] shadow-md border border-slate-200"
                       >CORRECT_LOG</button>
                     </div>
                  ) : (
                    <div className="flex border-t border-slate-100 mt-auto bg-slate-50/40 rounded-b-[2.5rem] overflow-hidden divide-x divide-slate-100">
                      <button 
                        onClick={() => {
                            const newItems = [...data.items];
                            newItems[i].status = 'Correct';
                            onUpdate({ correct: (data.correct || 0) + 1, items: newItems, syncQuestion: { id: q.id, status: 'Correct' } });
                        }}
                        className="flex-1 py-6 text-emerald-600 hover:bg-emerald-50 text-[11px] font-bold uppercase tracking-[0.4em] transition-all"
                      >
                        RETAINED
                      </button>
                      <button 
                        onClick={() => {
                            const newItems = [...data.items];
                            newItems[i].status = 'Struggled';
                            onUpdate({ struggled: (data.struggled || 0) + 1, items: newItems, syncQuestion: { id: q.id, status: 'Struggled' } });
                        }}
                        className="flex-1 py-6 text-rose-600 hover:bg-rose-50 text-[11px] font-bold uppercase tracking-[0.4em] transition-all"
                      >
                        STRUGGLED
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {(!data.items || data.items.length === 0) && (
                  <div className="min-w-full p-12 bg-slate-50 rounded-[2.5rem] border-2 border-slate-200 border-dashed text-center text-slate-400 uppercase tracking-[0.5em] text-[11px]">
                      // CACHE_EMPTY
                  </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center mt-2">
              <div className="p-4 border border-slate-100 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/40">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em] mb-2">TOTAL_SYNC</div>
                <div className="text-2xl font-light text-slate-700">{data.total}</div>
              </div>
              <div className="p-4 border border-emerald-100 bg-emerald-50/50 rounded-3xl shadow-lg shadow-emerald-200/40">
                <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-2">R_HIT</div>
                <div className="text-2xl font-light text-emerald-600">{data.correct}</div>
              </div>
              <div className="p-4 border border-rose-100 bg-rose-50/50 rounded-3xl shadow-lg shadow-rose-200/40">
                <div className="text-[10px] font-mono text-rose-500 uppercase tracking-[0.3em] mb-2">R_MISS</div>
                <div className="text-2xl font-light text-rose-600">{data.struggled}</div>
              </div>
            </div>
          </>
        );
      case 'project':
        return (
          <>
            <div className="text-[10px] text-fuchsia-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">✦ PROJECT DEPLOYMENT</div>
            <h3 className="text-lg font-medium text-slate-800 tracking-wide mb-2">{data.projectName}</h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">{data.description}</p>
            {localStatus === 'NotStarted' || localStatus === 'InProgress' ? (
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleStatusChange('Done')} className="px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">ACCOMPLISHED</button>
                <button onClick={() => handleStatusChange('Partial')} className="px-4 py-2 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">PARTIAL</button>
                <button onClick={() => handleStatusChange('Skipped')} className="px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full text-[10px] uppercase font-medium tracking-widest transition-colors shadow-sm border border-slate-100">ABORT</button>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">STATUS:</span>
                <span className="text-xs text-slate-700 uppercase font-medium tracking-widest">{localStatus}</span>
                <button onClick={() => handleStatusChange('NotStarted')} className="ml-auto px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium transition-colors uppercase tracking-[0.2em] shadow-sm border border-slate-200">UNDO</button>
              </div>
            )}
          </>
        );
      default:
        return <div>Unknown Block</div>;
    }
  };

  const getShapeClass = () => {
    switch(type) {
      case 'spine': return 'shape-blob';
      case 'softSkill': return 'shape-leaf';
      case 'survival': return 'shape-cloud';
      case 'payableSkill': return 'shape-blob';
      case 'project': return 'rounded-[3rem]';
      case 'questions': return 'rounded-[2rem]';
      default: return 'rounded-2xl';
    }
  };

  const getLiquidColor = () => {
    if (localStatus === 'Partial') return 'rgba(245, 158, 11, 0.1)';
    switch(type) {
      case 'spine': return 'rgba(16, 185, 129, 0.1)';
      case 'softSkill': return 'rgba(16, 185, 129, 0.1)';
      case 'payableSkill': return 'rgba(16, 185, 129, 0.1)';
      case 'survival': return 'rgba(239, 68, 68, 0.1)';
      case 'questions': return 'rgba(59, 130, 246, 0.1)';
      case 'project': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(16, 185, 129, 0.1)';
    }
  };

  return (
    <div 
      className={`border p-10 ${getShapeClass()} ${statusColors[localStatus]} ${localStatus === 'Done' || localStatus === 'Partial' ? 'liquid-fill' : ''} font-mono transition-all duration-700 relative group overflow-hidden h-full flex flex-col shadow-2xl shadow-slate-200/30 hover:shadow-slate-300/50`}
      style={{ '--liquid-color': getLiquidColor() } as any}
    >
      <div className="absolute -right-4 -bottom-12 text-[18rem] font-bold text-slate-100/80 animate-pulse-slow select-none pointer-events-none z-0 tracking-tighter mix-blend-multiply opacity-50">
        {type === 'spine' ? 'S' : type === 'softSkill' ? 'SS' : type === 'payableSkill' ? 'PS' : type === 'survival' ? '!' : type === 'questions' ? 'Q' : 'PR'}
      </div>
      <div className="relative z-10 flex-grow flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
