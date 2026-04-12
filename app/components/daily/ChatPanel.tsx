'use client';

import React, { useState } from 'react';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contextType?: string;
  onCapture: (type: string, content: string) => void;
  onDrift: () => void;
}

export default function ChatPanel({ isOpen, onClose, contextType, onCapture, onDrift }: ChatPanelProps) {
  const [inputStr, setInputStr] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [turnCount, setTurnCount] = useState(0);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputStr.trim()) return;

    if (inputStr.startsWith('/')) {
      const parts = inputStr.split(' ');
      const cmd = parts[0].substring(1);
      const content = parts.slice(1).join(' ');
      
      if (['note', 'insight', 'link', 'connection'].includes(cmd)) {
        onCapture(cmd, content);
        setMessages([...messages, { role: 'system', content: `[Captured ${cmd.toUpperCase()}]` }]);
        setInputStr('');
        return;
      }
    }

    setMessages([...messages, { role: 'user', content: inputStr }]);
    setInputStr('');
    setTurnCount(prev => prev + 1);

    // Drift Detection Simulation (e.g., > 5 turns triggers prompt)
    if (turnCount > 4) {
      onDrift();
      setMessages(prev => [...prev, { role: 'system', content: `[DRIFT DETECTED] Please return to syllabus focus. (-0.5 momentum)` }]);
      setTurnCount(0); // reset drift counter
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: `[AI Response simulating interaction in context of ${contextType}]` }]);
      }, 500);
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-1/3 bg-black border-l border-zinc-800 flex flex-col font-mono z-50 shadow-2xl">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest">
          SYS.CHAT // <span className="text-blue-400">{contextType || 'GENERAL'}</span>
        </h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white px-2"> [CLOSE] </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-zinc-300 text-right' : msg.role === 'system' ? 'text-amber-500 text-center font-bold tracking-widest text-xs' : 'text-blue-200'}`}>
            {msg.role === 'ai' && <span className="text-blue-500 mr-2">AI&gt;</span>}
            {msg.role === 'user' && <span className="text-zinc-500 mr-2">&lt;USER</span>}
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex gap-2 mb-2">
            {/* Quick Commands */}
            <button onClick={() => setInputStr('/expand ')} className="text-xs bg-zinc-800 px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-700">/expand</button>
            <button onClick={() => setInputStr('/qa ')} className="text-xs bg-zinc-800 px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-700">/qa</button>
            <button onClick={() => setInputStr('/insight ')} className="text-xs bg-emerald-900/40 text-emerald-500 hover:bg-emerald-900/80 px-2 py-1">/insight</button>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputStr}
            onChange={e => setInputStr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="// Enter command or question..."
            className="flex-1 bg-black border border-zinc-700 p-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleSend} className="bg-zinc-800 text-zinc-300 px-4 hover:bg-zinc-700 text-sm uppercase tracking-wider">Send</button>
        </div>
      </div>
    </div>
  );
}
