'use client';

import React, { useState } from 'react';

interface CarryForwardBannerProps {
  items: { type: string, name: string, status: string, date: string }[];
}

export default function CarryForwardBanner({ items }: CarryForwardBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !items || items.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8 relative font-mono text-xs shadow-sm shadow-rose-100/50 transition-all duration-500">
      <button 
        onClick={() => setDismissed(true)} 
        className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors tracking-widest"
      >
        &#x2715;
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></div>
        <h3 className="text-rose-600 font-light uppercase tracking-[0.2em] text-[10px]">Backlog Detected</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-4 items-baseline text-[10px] tracking-wider text-rose-500/70 border-b border-rose-100/50 pb-2 last:border-0 last:pb-0">
            <span className="text-rose-400/50 w-24">[{item.date}]</span>
            <span className="text-rose-600 font-medium uppercase flex-1">{item.name}</span>
            <span className="text-rose-400 uppercase bg-rose-100/50 px-2 py-0.5 rounded-full">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
