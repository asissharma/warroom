'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CaptureBarProps {
  sessionDay: number;
  activeTopics: { id: string, name: string, type: string }[];
  onSuccess?: (msg: string) => void;
}

export default function CaptureBar({ sessionDay, activeTopics, onSuccess }: CaptureBarProps) {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string, name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'general', name: 'General Note', type: 'NODE' },
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
      console.error('Failed to capture note:', err);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full relative border-t border-[#EBEBEB] bg-white p-4">
      {/* Topic Selection Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 left-4 right-4 bg-white border border-[#EBEBEB] rounded-xl shadow-xl z-[110] overflow-hidden">
           <div className="max-h-[200px] overflow-y-auto py-1">
             {menuItems.map((item, i) => (
               <div
                 key={item.id}
                 className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                   i === selectedIndex ? 'bg-[#F4F4F5] text-[#111111]' : 'text-[#71717A] hover:bg-[#FAFAFA]'
                 }`}
                 onClick={() => {
                    if (item.id !== 'general') setSelectedTopic({ id: item.id, name: item.name });
                    else setSelectedTopic(null);
                    setInput('');
                    setIsMenuOpen(false);
                    inputRef.current?.focus();
                 }}
               >
                 <span className="text-[13px] font-medium">{item.name}</span>
                 <span className="text-[10px] text-[#A1A1AA] font-mono">{item.type}</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={status === 'syncing'}
            placeholder={selectedTopic ? `Capturing for ${selectedTopic.name}...` : "Add a note or capture..."}
            className="w-full h-10 bg-[#F4F4F5] border-none rounded-lg px-4 text-[13px] text-[#111111] focus:ring-1 focus:ring-[#111111]/10 outline-none placeholder:text-[#A1A1AA]"
          />
          {selectedTopic && (
            <button 
              onClick={() => setSelectedTopic(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#A1A1AA] hover:text-[#111111]"
            >
              ✕
            </button>
          )}
        </div>
        
        <button
           onClick={handleSync}
           disabled={!input.trim() || status === 'syncing'}
           className={`h-10 px-4 rounded-lg text-[13px] font-semibold transition-all ${
             status === 'success' 
               ? 'bg-[#22C55E] text-white' 
               : 'bg-[#111111] text-white hover:bg-[#333333] disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA]'
           }`}
        >
           {status === 'idle' && 'Save Note'}
           {status === 'syncing' && '...'}
           {status === 'success' && '✓'}
        </button>
      </div>
    </div>
  );
}
