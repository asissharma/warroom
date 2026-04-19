'use client';

import React, { useState, useEffect } from 'react';
import SyllabusListView from '@/app/components/syllabus/SyllabusListView';
import GapTrackerTab from '@/app/components/syllabus/GapTrackerTab';
import DetailPane from '@/app/components/syllabus/DetailPane';
import ChatPanel from '@/app/components/daily/ChatPanel';

type TabType = 'OVERVIEW' | 'GAP_TRACKER' | string;

export default function SyllabusPitt() {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [registry, setRegistry] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [highlights, setHighlights] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegistryAndStats() {
      try {
        const res = await fetch('/api/syllabus');
        const data = await res.json();
        if (data.success) {
          setRegistry(data.registry || []);
          setStats(data.stats);
          setHighlights(data.highlights);
        }
      } catch (e) {
        console.error('Failed to fetch syllabus data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchRegistryAndStats();
  }, []);

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview' },
    ...registry.map(s => ({ id: s.slug, label: s.name })),
    { id: 'GAP_TRACKER', label: 'Gap Tracker' },
  ];

  const activeSyllabus = registry.find(s => s.slug === activeTab);

  return (
    <div className="syll" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>

      {/* ── TOP BAR ─────────────────────────────────── */}
      <div className="syll-topbar">
        <div className="syll-topbar__title">Syllabus</div>

        <div className="syll-topbar__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedItem(null); }}
              className={`syll-topbar__tab ${activeTab === tab.id ? 'syll-topbar__tab--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          className="syll-topbar__ai-btn"
          onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          style={{ background: isAiPanelOpen ? '#111111' : 'transparent', color: isAiPanelOpen ? '#FFFFFF' : '#71717A' }}
        >
          {isAiPanelOpen ? 'Close Analysis' : 'AI Analysis'}
        </button>
      </div>

      {/* ── CONTENT AREA ────────────────────────────── */}
      <div className="syll-content-wrapper">
        <div className={`syll-content ${selectedItem ? 'syll-content--with-detail' : ''}`}>
          {activeTab === 'OVERVIEW' && <OverviewCards stats={stats} highlights={highlights} onSelectItem={setSelectedItem} />}
          {activeTab === 'GAP_TRACKER' && <GapTrackerTab onSelectItem={setSelectedItem} />}
          
          {/* Dynamic Syllabus Rendering */}
          {activeSyllabus && (
            <SyllabusListView 
              slug={activeSyllabus.slug} 
              itemType={activeSyllabus.itemType} 
              onSelectItem={setSelectedItem} 
            />
          )}
        </div>

        {selectedItem && (
          <div className="syll-detail-pane">
            <DetailPane
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          </div>
        )}

        {/* AI ANALYSIS PANEL */}
        {isAiPanelOpen && (
          <div className="syll-ai-pane" style={{ width: '40%', borderLeft: '1px solid #EBEBEB', background: '#FAFAFA', overflowY: 'auto' }}>
            <ChatPanel
              isOpen={isAiPanelOpen}
              onClose={() => setIsAiPanelOpen(false)}
              contextType="SYLLABUS_OVERVIEW"
              onDrift={() => {}}
              onCapture={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── OVERVIEW TAB — STAT CARDS & DASHBOARD ───────── */
function OverviewCards({ stats, highlights, onSelectItem }: { stats: any; highlights: any; onSelectItem?: (item: any) => void }) {
  const progress = stats ? Math.min(100, Math.round((stats.spine / 150) * 100)) : 0;
  const openGaps = stats?.openGaps || 0;
  const questions = stats?.questions || 0;
  const softSkills = stats?.softSkills || 0;
  const payableSkills = stats?.payableSkills || 0;

  return (
    <div className="syll-overview animate-fade-slide">
      {/* Top row — 3 stat cards */}
      <div className="syll-overview__row">
        <div className="syll-stat-card syll-stat-card--accent-sky">
          <div className="syll-stat-card__label">PROGRESS</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {stats ? `${progress}%` : '--'}
          </div>
          <div className="syll-stat-card__subtitle">Topics with Surface+ depth</div>
        </div>

        <div className={`syll-stat-card ${openGaps > 0 ? 'syll-stat-card--accent-amber' : 'syll-stat-card--accent-green'}`}>
          <div className="syll-stat-card__label">OPEN GAPS</div>
          <div
            className="syll-stat-card__value"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              color: openGaps > 0 ? '#EF4444' : '#22C55E',
            }}
          >
            {openGaps}
          </div>
          <div className="syll-stat-card__subtitle">Flagged concepts needing work</div>
        </div>

        <div className="syll-stat-card syll-stat-card--accent-rose">
          <div className="syll-stat-card__label">QUESTIONS</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {questions}
          </div>
          <div className="syll-stat-card__subtitle">Active in SM-2 rotation</div>
        </div>
      </div>

      {/* Second row — 2 stat cards */}
      <div className="syll-overview__row syll-overview__row--2col">
        <div className="syll-stat-card syll-stat-card--accent-mint">
          <div className="syll-stat-card__label">SOFT SKILLS</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {softSkills}
          </div>
          <div className="syll-stat-card__subtitle">Skills tracked</div>
        </div>

        <div className="syll-stat-card syll-stat-card--accent-peach">
          <div className="syll-stat-card__label">PAYABLE SKILLS</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {payableSkills}
          </div>
          <div className="syll-stat-card__subtitle">Skills tracked</div>
        </div>
      </div>

      {/* Third section — Active Curriculum Dashboard */}
      {highlights && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {highlights.spine?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 12 }}>Active Tech Spine Topics</div>
              <div className="syll-list">
                {highlights.spine.map((s: any) => (
                  <div key={s._id} className="syll-row-card" onClick={() => onSelectItem && onSelectItem({ ...s, source: 'tech-spine' })}>
                    <div className="syll-row-card__left">
                      <div className="syll-row-card__name">{s.title}</div>
                      <div className="syll-row-card__meta">Progress: {s.completedCount > 0 ? 'Mastered' : s.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {highlights.projects?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 12 }}>Active Projects</div>
              <div className="syll-list">
                {highlights.projects.map((p: any) => (
                  <div key={p._id} className="syll-row-card" onClick={() => onSelectItem && onSelectItem({ ...p, source: 'projects' })}>
                    <div className="syll-row-card__left">
                      <div className="syll-row-card__name">{p.title}</div>
                      <div className="syll-row-card__meta" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.meta?.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {highlights.gaps?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 12 }}>Critical Gaps</div>
              <div className="syll-list">
                {highlights.gaps.map((g: any) => (
                  <div key={g._id} className="syll-row-card" onClick={() => onSelectItem && onSelectItem({ ...g, source: g.syllabusSlug })}>
                    <div className="syll-row-card__left">
                      <div className="syll-row-card__name">{g.title}</div>
                      <div className="syll-row-card__meta">Flag Count: {g.gap?.flagCount}</div>
                    </div>
                    <div className="syll-row-card__right">
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: '#FEF2F2', color: '#DC2626' }}>{g.gap?.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
