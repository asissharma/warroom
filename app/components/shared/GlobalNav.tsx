'use client';

import React from 'react';

type Screen = 'DAILY' | 'SYLLABUS' | 'SETTINGS';

interface GlobalNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function GlobalNav({ activeScreen, onScreenChange }: GlobalNavProps) {
  const navItems: { id: Screen; label: string }[] = [
    { id: 'DAILY', label: 'Daily' },
    { id: 'SYLLABUS', label: 'Syllabus' },
    { id: 'SETTINGS', label: 'Settings' },
  ];

  return (
    <div className="global-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onScreenChange(item.id)}
          className={`global-nav__item ${activeScreen === item.id ? 'global-nav__item--active' : ''}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
