'use client';

import React from 'react';

interface SyllabusRowProps {
  config: {
    slug: string;
    enabled: boolean;
    weight: number;
    maxPerSession: number;
  };
  name: string;
  onChange: (slug: string, updates: any) => void;
}

export default function SyllabusRow({ config, name, onChange }: SyllabusRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row__info">
        <div className="settings-row__name">{name}</div>
        <div className="settings-row__slug">{config.slug}</div>
      </div>

      <div className="settings-row__controls">
        {/* Toggle */}
        <div className="settings-control">
          <label className="settings-label">Enabled</label>
          <button 
            onClick={() => onChange(config.slug, { enabled: !config.enabled })}
            className={`settings-toggle ${config.enabled ? 'settings-toggle--active' : ''}`}
          >
            <div className="settings-toggle__dot" />
          </button>
        </div>

        {/* Weight */}
        <div className="settings-control">
          <label className="settings-label">Weight (1-10)</label>
          <input 
            type="number"
            min="1"
            max="10"
            value={config.weight}
            onChange={(e) => onChange(config.slug, { weight: parseInt(e.target.value) || 1 })}
            className="settings-input settings-input--number"
          />
        </div>

        {/* Max Per Session */}
        <div className="settings-control">
          <label className="settings-label">Max Items</label>
          <input 
            type="number"
            min="1"
            value={config.maxPerSession}
            onChange={(e) => onChange(config.slug, { maxPerSession: parseInt(e.target.value) || 1 })}
            className="settings-input settings-input--number"
          />
        </div>
      </div>
    </div>
  );
}
