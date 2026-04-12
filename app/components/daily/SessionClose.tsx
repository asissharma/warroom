'use client';

import React, { useState } from 'react';

interface SessionCloseProps {
  onCloseSession: (note: string) => Promise<any>;
}

export default function SessionClose({ onCloseSession }: SessionCloseProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleClone = async () => {
    if (note.length < 20) return;
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
      <div className="mt-8 p-6 bg-zinc-900 border border-zinc-700 text-center font-mono space-y-4">
        <h2 className="text-xl text-zinc-100 font-bold uppercase tracking-widest">Session Closed</h2>
        <div className="text-4xl text-emerald-500 font-bold">+{result.momentumScore.toFixed(1)}</div>
        <div className="text-zinc-500 text-sm uppercase tracking-widest">Momentum Score Added</div>
        
        <div className="mt-6 pt-6 border-t border-zinc-800 text-left">
          <h3 className="text-amber-500 text-xs uppercase tracking-widest mb-2">Tomorrow's Focus</h3>
          <p className="text-zinc-300">{result.tomorrowFocus}</p>
        </div>
      </div>
    );
  }

  const isValid = note.length >= 20;

  return (
    <div className="mt-8 pt-8 border-t border-zinc-800 font-mono">
      <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">Honest Note</h3>
      <p className="text-xs text-zinc-500 mb-4">Required: Min 20 characters. Reflect honestly.</p>
      
      <textarea 
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full h-32 bg-black border border-zinc-700 p-4 text-zinc-300 text-sm focus:outline-none focus:border-amber-500 transition-colors mb-2 resize-none"
        placeholder="What felt fragile? Did you actually master it? Any specific blockers?"
      />
      {!isValid && <div className="text-amber-500 text-xs text-right mb-4">{Math.max(0, 20 - note.length)} more characters required</div>}
      {isValid && <div className="text-emerald-500 text-xs text-right mb-4 tracking-widest uppercase">Valid Ready</div>}

      <button 
        onClick={handleClone}
        disabled={!isValid || submitting}
        className={`w-full py-4 font-bold tracking-widest uppercase transition-all shadow-lg ${
          isValid 
            ? 'bg-zinc-100 text-black hover:bg-white shadow-zinc-100/20' 
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none'
        }`}
      >
        {submitting ? 'CLOSING ENGINE...' : 'CLONE SESSION'}
      </button>
    </div>
  );
}
