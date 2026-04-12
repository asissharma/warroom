'use client';

import React, { useState } from 'react';

interface BlockCardProps {
  type: string;
  data: any;
  onUpdate: (data: any) => void;
  onOpenChat: () => void;
  isMorphic?: boolean;
}

export default function BlockCard({ type, data, onUpdate, onOpenChat, isMorphic }: BlockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isDone = data.status === 'Done' || data.isDone;
  const isInProgress = data.status === 'Partial' || data.status === 'InProgress';

  const pastelStyles: any = {
    spine: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', hover: 'hover:bg-[#E0F2FE]' },
    softSkill: { bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', hover: 'hover:bg-[#F0FDF4]' },
    payableSkill: { bg: 'bg-[#FFF7ED]', text: 'text-[#9A3412]', hover: 'hover:bg-[#FFF7ED]' },
    project: { bg: 'bg-[#FAF5FF]', text: 'text-[#7E22CE]', hover: 'hover:bg-[#FAF5FF]' },
    questions: { bg: 'bg-[#FFF1F2]', text: 'text-[#BE123C]', hover: 'hover:bg-[#FFF1F2]' },
    survival: { bg: 'bg-[#FFFBEB]', text: 'text-[#92400E]', hover: 'hover:bg-[#FFFBEB]' },
  };

  const style = pastelStyles[type] || pastelStyles.spine;

  const getEstTime = () => {
    switch(type) {
      case 'spine': return '25m';
      case 'softSkill': return '15m';
      case 'payableSkill': return '20m';
      case 'project': return '45m';
      case 'questions': return '12m';
      case 'survival': return '10m';
      default: return '15m';
    }
  };

  const [qIndex, setQIndex] = useState(0);

  const renderQuestions = () => {
    const { items, correct, struggled, total } = data;
    if (!items || items.length === 0) return null;

    const currentQ = items[qIndex];
    const isAnswered = currentQ.status === 'Correct' || currentQ.status === 'Struggled';

    const nextQ = () => {
        if (qIndex < items.length - 1) setQIndex(qIndex + 1);
    };

    const prevQ = () => {
        if (qIndex > 0) setQIndex(qIndex - 1);
    };

    const handleMark = (status: 'Correct' | 'Struggled') => {
        onUpdate({ syncQuestion: { id: currentQ.id, status } });
        // Auto-advance after a small delay
        setTimeout(() => {
            if (qIndex < items.length - 1) setQIndex(qIndex + 1);
        }, 400);
    };

    return (
      <div className="mt-8 w-full">
        {/* Carousel Container */}
        <div className="relative min-h-[220px] glass-card rounded-2xl p-8 flex flex-col justify-between border border-[#EBEBEB] shadow-sm overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#F4F4F5]">
                <div 
                    className="h-full bg-black transition-all duration-500" 
                    style={{ width: `${((qIndex + 1) / total) * 100}%` }}
                />
            </div>

            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest">
                    Question {qIndex + 1} of {total}
                </span>
                <div className="flex gap-1">
                    <button onClick={prevQ} disabled={qIndex === 0} className="p-1 hover:bg-[#FAFAFA] rounded-md disabled:opacity-30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button onClick={nextQ} disabled={qIndex === total - 1} className="p-1 hover:bg-[#FAFAFA] rounded-md disabled:opacity-30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>

            <div key={qIndex} className="animate-[cardEntrance_0.3s_ease-out]">
                <p className="text-[16px] text-[#111111] leading-relaxed font-medium">
                    {currentQ.text}
                </p>
            </div>

            <div className="flex gap-3 mt-8">
                {!isAnswered ? (
                    <>
                        <button 
                            onClick={() => handleMark('Correct')}
                            className="flex-1 h-12 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#333333] transition-all"
                        >
                            RETAINED
                        </button>
                        <button 
                            onClick={() => handleMark('Struggled')}
                            className="flex-1 h-12 border border-[#EBEBEB] text-[#111111] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#FAFAFA] transition-all"
                        >
                            MISSED
                        </button>
                    </>
                ) : (
                    <div className={`w-full py-3 rounded-xl text-center text-[11px] font-bold uppercase tracking-widest border ${
                        currentQ.status === 'Correct' 
                            ? 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]' 
                            : 'bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]'
                    }`}>
                        {currentQ.status === 'Correct' ? 'VERIFIED_STABLE' : 'FLAGGED_DRIFT'}
                    </div>
                )}
            </div>
        </div>

        {/* Stats Row */}
        <div className="flex border-t border-[#EBEBEB] mt-10 pt-6">
           <div className="flex-1 text-center border-r border-[#EBEBEB]">
             <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest mb-1">TOTAL</div>
             <div className="text-[24px] font-bold text-[#111111] tracking-tighter">{total}</div>
           </div>
           <div className="flex-1 text-center border-r border-[#EBEBEB]">
             <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest mb-1">PASS</div>
             <div className="text-[24px] font-bold text-[#22C55E] tracking-tighter">{correct}</div>
           </div>
           <div className="flex-1 text-center">
             <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest mb-1">FAIL</div>
             <div className="text-[24px] font-bold text-[#EF4444] tracking-tighter">{struggled}</div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full transition-all duration-300 relative group h-full
      ${isMorphic ? 'glass-card p-8 rounded-2xl morphic-hover border-none shadow-none' : 'px-12 py-8 border-b border-[#EBEBEB] bg-white'}
      ${isDone && !isMorphic ? 'bg-[#F0FDF4]' : ''}
      ${isDone && isMorphic ? 'ring-2 ring-[#22C55E]/20 bg-[#F0FDF4]/40' : ''}
      ${style.hover}
      ${isDone ? 'border-l-[3px] border-l-[#22C55E]' : isInProgress ? 'border-l-[3px] border-l-[#F59E0B]' : 'border-l-0'}
    `}>
      
      {/* ROW 1: META */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`pill-badge ${style.bg} ${style.text}`}>
            {type.replace(/([A-Z])/g, ' $1')}
          </span>
          
          <div className="flex items-center gap-1.5 ml-2">
            {isDone && (
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-[#22C55E]">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-medium text-[#22C55E]">Done</span>
              </div>
            )}
            {isInProgress && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></div>
                <span className="text-[11px] font-medium text-[#F59E0B]">In progress</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-[12px] text-[#A1A1AA] font-mono">{getEstTime()}</div>
      </div>

      {/* ROW 2: TITLE */}
      <div className="mt-3">
        <h2 className={`text-[20px] font-semibold tracking-tight ${isDone ? 'text-[#71717A]' : 'text-[#111111]'}`}>
          {type === 'spine' && data.topicToday}
          {type === 'softSkill' && data.skillName}
          {type === 'payableSkill' && data.topicName}
          {type === 'project' && data.projectName}
          {type === 'survival' && `BREAKAWAY: ${data.gapName}`}
          {type === 'questions' && 'MEMORY CORE // SM-2'}
        </h2>
      </div>

      {/* ROW 3: DESCRIPTION */}
      <div className="mt-1.5">
        <p className={`text-[14px] leading-relaxed max-w-2xl transition-all ${isDone ? 'text-[#A1A1AA]' : 'text-[#71717A]'} ${expanded ? '' : 'line-clamp-2'}`}>
          {type === 'spine' && data.microtaskToday}
          {type === 'softSkill' && data.prompt}
          {type === 'payableSkill' && data.prompt}
          {type === 'project' && data.description}
          {type === 'survival' && `Critical gap in ${data.gapName} detected ${data.daysSinceOpen} days ago.`}
          {type === 'questions' && 'Sequential retrieval of high-drift concepts from the Technium.'}
        </p>
        <button 
           onClick={() => setExpanded(!expanded)}
           className="text-[11px] font-medium text-[#A1A1AA] hover:text-[#111111] mt-1 uppercase tracking-widest"
        >
            {expanded ? 'Show Less' : 'Details'}
        </button>
      </div>

      {/* ROW 4: ACTIONS */}
      <div className="mt-5 flex gap-2">
        {type !== 'questions' && (
          <>
            {!isDone && (
              <button 
                onClick={() => onUpdate({ status: 'Done', syncStatus: 'Done' })}
                className="craft-button-primary"
              >
                Mark Done
              </button>
            )}
            <button 
              onClick={onOpenChat}
              className="craft-button-secondary"
            >
              Open Intel
            </button>
            {!isDone && !isInProgress && (
              <button 
                onClick={() => onUpdate({ status: 'InProgress' })}
                className="craft-button-secondary"
              >
                Focus
              </button>
            )}
            {isDone && (
              <button 
                onClick={() => onUpdate({ status: 'NotStarted' })}
                className="text-[12px] text-[#A1A1AA] hover:text-[#111111] underline underline-offset-4 ml-4 font-medium"
              >
                Undo
              </button>
            )}
          </>
        )}
      </div>

      {/* QUESTIONS SPECIAL RENDER */}
      {type === 'questions' && renderQuestions()}
    </div>
  );
}
