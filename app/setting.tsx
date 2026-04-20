'use client';

import React, { useState, useEffect } from 'react';
import SyllabusRow from '@/app/components/settings/SyllabusRow';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<any>(null);
  const [registry, setRegistry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [settingsRes, registryRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/syllabus')
        ]);
        
        const settingsData = await settingsRes.json();
        const registryData = await registryRes.json();
        
        setSettings(settingsData);
        setRegistry(registryData.registry || []);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSyllabusChange = (slug: string, updates: any) => {
    setIsDirty(true);
    setSettings((prev: any) => {
      const existing = prev.syllabusConfig.find((s: any) => s.slug === slug);
      if (existing) {
        return {
          ...prev,
          syllabusConfig: prev.syllabusConfig.map((s: any) => 
            s.slug === slug ? { ...s, ...updates } : s
          )
        };
      } else {
        // Add new entry
        return {
          ...prev,
          syllabusConfig: [...prev.syllabusConfig, { slug, ...updates, weight: 1, maxPerSession: 1 }]
        };
      }
    });
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    setIsDirty(true);
    setSettings((prev: any) => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setIsDirty(false);
      }
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
      <div className="animate-pulse font-mono text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA]">
          Syncing_Settings...
      </div>
    </div>
  );

  return (
    <div className="settings-container animate-fade-slide">
      <div className="settings-header">
        <h1 className="settings-title">Control Center</h1>
        <p style={{ color: '#71717A', fontSize: 14, marginTop: 8 }}>Tune your WarRoom priority engine and active protocols.</p>
      </div>

      {/* ── GENERAL SECTION ─────────────────────────── */}
      <div className="settings-section">
        <h2 className="settings-section__title">General Configuration</h2>
        <div className="settings-row">
            <div className="settings-row__info">
                <div className="settings-row__name">Default Session Duration</div>
                <div className="settings-row__slug">Minutes allocated for a new daily session</div>
            </div>
            <div className="settings-row__controls">
                <select 
                    value={settings.defaultSessionMinutes}
                    onChange={(e) => handleFieldChange('global', 'defaultSessionMinutes', parseInt(e.target.value))}
                    className="settings-input"
                    style={{ width: 140 }}
                >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                </select>
            </div>
        </div>
      </div>

      {/* ── SYLLABUS SECTION ────────────────────────── */}
      <div className="settings-section">
        <h2 className="settings-section__title">Curriculum Priorities</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {registry.map(syl => {
            const config = settings.syllabusConfig.find((c: any) => c.slug === syl.slug) || {
              slug: syl.slug,
              enabled: false,
              weight: 1,
              maxPerSession: 1
            };
            return (
              <SyllabusRow 
                key={syl.slug}
                name={syl.name}
                config={config}
                onChange={handleSyllabusChange}
              />
            );
          })}
        </div>
      </div>

      {/* ── ENGINE SECTION ──────────────────────────── */}
      <div className="settings-section">
        <h2 className="settings-section__title">Engine Constants (SM-2)</h2>
        <div className="settings-row">
            <div className="settings-row__info">
                <div className="settings-row__name">Flag Thresholds</div>
                <div className="settings-row__slug">Number of struggles before escalating a gap</div>
            </div>
            <div className="settings-row__controls">
                <div className="settings-control">
                    <label className="settings-label">Medium</label>
                    <input 
                        type="number"
                        value={settings.sm2.mediumThreshold}
                        onChange={(e) => handleFieldChange('sm2', 'mediumThreshold', parseInt(e.target.value))}
                        className="settings-input settings-input--number"
                    />
                </div>
                <div className="settings-control">
                    <label className="settings-label">Critical</label>
                    <input 
                        type="number"
                        value={settings.sm2.criticalThreshold}
                        onChange={(e) => handleFieldChange('sm2', 'criticalThreshold', parseInt(e.target.value))}
                        className="settings-input settings-input--number"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* ── AI SECTION ──────────────────────────────── */}
      <div className="settings-section">
        <h2 className="settings-section__title">AI Integration</h2>
        <div className="settings-row">
            <div className="settings-row__info">
                <div className="settings-row__name">Model Routing</div>
                <div className="settings-row__slug">Primary model for generation and analysis</div>
            </div>
            <div className="settings-row__controls" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                <div className="settings-control" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <label className="settings-label" style={{ marginBottom: 0 }}>Enable Agentic Features</label>
                    <button 
                        onClick={() => handleFieldChange('ai', 'enabled', !settings.ai.enabled)}
                        className={`settings-toggle ${settings.ai.enabled ? 'settings-toggle--active' : ''}`}
                    >
                        <div className="settings-toggle__dot" />
                    </button>
                </div>
                <input 
                    type="text"
                    placeholder="Main Model (e.g. gemini-3-flash)"
                    value={settings.ai.teachModel}
                    onChange={(e) => handleFieldChange('ai', 'teachModel', e.target.value)}
                    className="settings-input"
                    style={{ width: 240 }}
                />
            </div>
        </div>
      </div>

      {/* ── SAVE BAR ────────────────────────────────── */}
      {isDirty && (
        <div className="settings-save-bar">
          <span style={{ fontSize: 13, fontWeight: 500 }}>You have unsaved changes</span>
          <button 
            className="settings-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
