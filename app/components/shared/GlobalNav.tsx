'use client';

import React from 'react';

type Screen = 'DAILY' | 'SYLLABUS' | 'SETTINGS';

interface GlobalNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function GlobalNav({ activeScreen, onScreenChange }: GlobalNavProps) {
  const navItems: { id: Screen; label: string; icon: string }[] = [
    { id: 'DAILY', label: 'Daily', icon: '◈' },
    { id: 'SYLLABUS', label: 'Syllabus', icon: '◎' },
    { id: 'SETTINGS', label: 'Settings', icon: '⚙' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 flex gap-1 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300
              ${activeScreen === item.id 
                ? 'bg-white text-[#111111] shadow-lg scale-[1.02]' 
                : 'text-white/50 hover:text-white hover:bg-white/5'}
            `}
          >
            <span className="font-mono text-[14px] leading-none">{item.icon}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
              {item.label}
            </span>
            
            {activeScreen === item.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#111111] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
