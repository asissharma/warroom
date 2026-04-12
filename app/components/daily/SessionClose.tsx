'use client';

import React, { useState, useEffect } from 'react';

interface SessionCloseProps {
  onCloseSession: (note: string) => Promise<any>;
}

export default function SessionClose({ onCloseSession }: SessionCloseProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showEnabledAnim, setShowEnabledAnim] = useState(false);

  const isValid = note.length >= 20;

  useEffect(() => {
    if (isValid && !showEnabledAnim) {
        setShowEnabledAnim(true);
    } else if (!isValid) {
        setShowEnabledAnim(false);
    }
  }, [isValid]);

  const handleClone = async () => {
    if (!isValid) return;
    setSubmitting(true);
    const res = await onCloseSession(note);
    if (res && res.success) {
      setResult(res);
    } else {
        alert(res?.error || 'Failed to close session');
    }
    setSubmitting(false);
  };

  if (result) {
    return (
      <div className="w-full px-12 py-16 bg-white border-t border-[#EBEBEB] animate-hud-fade">
        <div className="max-w-xl mx-auto text-center">
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.4em] mb-4">Neural_Compilation_Success</div>
            <div className="text-[48px] font-bold text-[#111111] tracking-tighter mb-2">
                +{result.momentumScore.toFixed(1)}
            </div>
            <div className="text-[12px] font-mono text-[#A1A1AA] uppercase tracking-widest mb-10">Momentum Units Logged</div>
            
            <div className="text-left bg-[#FAFAFA] border border-[#EBEBEB] p-8 rounded-2xl">
                <h3 className="text-[10px] font-mono font-bold text-[#111111] uppercase tracking-widest mb-4">Tomorrow's Core Intent</h3>
                <p className="text-[15px] text-[#71717A] leading-relaxed italic">"{result.tomorrowFocus || 'No focus captured'}"</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-12 py-16 bg-white border-t border-[#EBEBEB]">
      <div className="flex justify-between items-end mb-4">
        <div>
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] mb-1">HONEST_REFLECTION</div>
            <div className="text-[14px] text-[#71717A]">Capture the drift. What felt fragile today?</div>
        </div>
        <div className={`text-[12px] font-medium ${isValid ? 'text-[#22C55E]' : 'text-[#A1A1AA]'}`}>
            {note.length} / 20 MIN
        </div>
      </div>
      
      <div className="relative">
        <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full min-h-[160px] bg-[#F8F8F8] border border-[#EBEBEB] rounded-xl p-6 text-[14px] text-[#111111] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#A1A1AA] focus:ring-4 focus:ring-black/5 transition-all resize-none leading-relaxed"
            placeholder="What felt fragile? Did you actually master it? Any specific blockers?"
        />
        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-wider">
            {note.length} CHARS
        </div>
      </div>

      <button 
        onClick={handleClone}
        disabled={!isValid || submitting}
        className={`mt-6 w-full h-[52px] rounded-xl font-semibold text-[14px] tracking-tight transition-all duration-200 
          ${isValid 
            ? 'bg-[#111111] text-white hover:bg-[#333333] cursor-pointer' 
            : 'bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed'}
          ${showEnabledAnim ? 'animate-[scaleUp_0.2s_ease-out]' : ''}
        `}
      >
        {submitting ? 'COMPILING...' : 'CLONE SESSION'}
      </button>
    </div>
  );
}
