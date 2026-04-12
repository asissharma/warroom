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
        <div className="absolute bottom-full mb-2 left-0 w-full glass-card rounded-xl overflow-hidden animate-hud-fade border border-[#EBEBEB] z-[110]">
           <div className="p-3 border-b border-[#EBEBEB] bg-[#FAFAFA]">
              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest">Select Context</span>
           </div>
           <div className="max-h-48 overflow-y-auto">
             {menuItems.map((item, i) => (
               <div
                 key={item.id}
                 className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                   i === selectedIndex ? 'bg-black text-white' : 'hover:bg-[#FAFAFA] text-[#111111]'
                 }`}
                 onClick={() => {
                    if (item.id !== 'general') setSelectedTopic({ id: item.id, name: item.name });
                    else setSelectedTopic(null);
                    setInput('');
                    setIsMenuOpen(false);
                    inputRef.current?.focus();
                 }}
               >
                 <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                 <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                   i === selectedIndex ? 'border-white/30 text-white/60' : 'border-[#EBEBEB] text-[#A1A1AA]'
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
          placeholder={selectedTopic ? "Capture insight for this topic..." : "Capture Node [ / to select ]"}
          className="w-full h-12 bg-white border border-[#EBEBEB] rounded-full pl-12 pr-24 text-[13px] font-mono focus:outline-none focus:border-[#111111] focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)] transition-all"
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
