'use client';

import React from 'react';

type Screen = 'DAILY' | 'SYLLABUS' | 'SETTINGS';

interface GlobalNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function GlobalNav({ activeScreen, onScreenChange }: GlobalNavProps) {
  const navItems: { id: Screen; label: string; icon: string }[] = [
    { id: 'DAILY', label: 'Daily', icon: '⚡' },
    { id: 'SYLLABUS', label: 'Syllabus', icon: '📚' },
    { id: 'SETTINGS', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="global-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onScreenChange(item.id)}
          className={`global-nav__item ${activeScreen === item.id ? 'global-nav__item--active' : ''}`}
        >
          <span className="global-nav__icon">{item.icon}</span>
          <span className="global-nav__label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
