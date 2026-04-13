'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CaptureBarProps {
  sessionDay: number;
  activeTopics: { id: string, name: string, type: string }[];
  onSuccess?: (msg: string) => void;
  isHudMode?: boolean;
}

export default function CaptureBar({ sessionDay, activeTopics, onSuccess, isHudMode }: CaptureBarProps) {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string, name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'general', name: 'General Capture', type: 'NODE' },
    ...activeTopics.map(t => ({ ...t, type: t.type.toUpperCase() }))
  ];

  useEffect(() => {
    if (input === '/') {
      setIsMenuOpen(true);
      setSelectedIndex(0);
    } else if (!input.startsWith('/')) {
      setIsMenuOpen(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isMenuOpen) {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % menuItems.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        const selected = menuItems[selectedIndex];
        if (selected.id !== 'general') {
            setSelectedTopic({ id: selected.id, name: selected.name });
        } else {
            setSelectedTopic(null);
        }
        setInput('');
        setIsMenuOpen(false);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setInput('');
      }
    } else if (e.key === 'Enter' && input.trim()) {
      handleSync();
    }
  };

  const handleSync = async () => {
    setStatus('syncing');
    try {
      const res = await fetch('/api/daily/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTopic ? 'insight' : 'note',
          note: input,
          topicId: selectedTopic?.id,
          sessionDay
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setInput('');
        setSelectedTopic(null);
        if (onSuccess) onSuccess(data.aiSummary);
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Failed to sync node:', err);
      setStatus('idle');
    }
  };

  return (
    <div className={`w-full relative ${isHudMode ? '' : 'fixed bottom-8 left-1/2 -translate-x-1/2 max-w-xl px-4 z-[100]'}`}>
      {/* Topic Selection Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-4 left-0 w-full glass-card rounded-2xl overflow-hidden animate-hud-fade border border-white/20 shadow-2xl z-[110]">
           <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white/40">
              <span className="text-[10px] font-mono text-[#111111] uppercase tracking-[0.2em] font-bold">Select Intelligence Context</span>
              <div className="flex gap-2">
                 <span className="text-[9px] font-mono bg-black/5 px-2 py-0.5 rounded text-[#A1A1AA]">↑↓ Navigate</span>
                 <span className="text-[9px] font-mono bg-black/5 px-2 py-0.5 rounded text-[#A1A1AA]">↵ Select</span>
              </div>
           </div>
           <div className="max-h-[320px] overflow-y-auto pt-2 pb-2">
             {menuItems.map((item, i) => (
               <div
                 key={item.id}
                 className={`mx-2 px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all rounded-xl ${
                   i === selectedIndex ? 'bg-[#111111] text-white translate-x-1 shadow-lg' : 'hover:bg-black/5 text-[#71717A]'
                 }`}
                 onClick={() => {
                    if (item.id !== 'general') setSelectedTopic({ id: item.id, name: item.name });
                    else setSelectedTopic(null);
                    setInput('');
                    setIsMenuOpen(false);
                    inputRef.current?.focus();
                 }}
               >
                 <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === selectedIndex ? 'bg-white animate-pulse' : 'bg-black/20'}`}></div>
                    <span className="text-[14px] font-medium tracking-tight uppercase tracking-widest">{item.name}</span>
                 </div>
                 <span className={`text-[9px] font-mono px-2 py-1 rounded-md border ${
                   i === selectedIndex ? 'border-white/20 text-white/60 bg-white/10' : 'border-black/10 text-[#A1A1AA]'
                 }`}>
                   {item.type}
                 </span>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Main Input Bar */}
      <div className={`relative transition-all duration-300 ${status === 'syncing' ? 'opacity-70 scale-[0.99]' : 'scale-100'}`}>
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {selectedTopic ? (
            <span className="bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-tighter mr-2">
              {selectedTopic.name.substring(0, 15)}...
            </span>
          ) : (
            <span className="text-[#A1A1AA] font-mono text-xs">/</span>
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status === 'syncing'}
          placeholder={selectedTopic ? `LOGGING_INTEL: ${selectedTopic.name.toUpperCase()}...` : "Neural_Input_v1 [ / for command ]"}
          className="w-full h-11 bg-transparent pl-12 pr-24 text-[13px] font-mono focus:outline-none placeholder:text-[#A1A1AA]/50 text-[#111111] transition-all"
        />

        {/* Status Indicator / Sync Trigger */}
        <div className="absolute right-2 top-1.5 flex gap-2">
            {selectedTopic && (
                <button 
                  onClick={() => setSelectedTopic(null)}
                  className="h-9 px-3 text-[#A1A1AA] hover:text-rose-500 transition-colors text-[10px] uppercase font-bold"
                >
                    Clear
                </button>
            )}
            <button
               onClick={handleSync}
               disabled={!input.trim() || status === 'syncing'}
               className={`h-9 px-5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                 status === 'success' 
                   ? 'bg-[#22C55E] text-white' 
                   : 'bg-black text-white hover:bg-[#333333]'
               }`}
            >
               {status === 'idle' && 'Sync'}
               {status === 'syncing' && '...'}
               {status === 'success' && 'OK'}
            </button>
        </div>
      </div>
    </div>
  );
}
