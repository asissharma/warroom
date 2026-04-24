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
    <div className="syll" style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>

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
          {activeTab === 'OVERVIEW' && <OverviewCards stats={stats} highlights={highlights} registry={registry} onSelectItem={setSelectedItem} />}
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

/* ── OVERVIEW TAB — RICH DASHBOARD ───────── */
function OverviewCards({ stats, highlights, registry, onSelectItem }: { stats: any; highlights: any; registry: any[]; onSelectItem?: (item: any) => void }) {
  if (!stats) return <div style={{ padding: 40, color: '#A1A1AA', textAlign: 'center' }}>Loading overview...</div>;

  const domains = stats.domains || {};
  const totalItems = stats.totalItems || 0;
  const totalMastered = Object.values(domains).reduce((a: number, d: any) => a + (d.mastered || 0), 0);
  const masteryPercent = totalItems > 0 ? Math.round((totalMastered / totalItems) * 100) : 0;

  const DOMAIN_COLORS: Record<string, string> = {
    'tech-spine': '#0EA5E9', 'questions': '#F43F5E', 'projects': '#8B5CF6',
    'soft-skills': '#22C55E', 'payable-skills': '#F97316', 'survival-gaps': '#EAB308',
    'system-design-questions': '#6366F1', 'courses': '#14B8A6'
  };

  return (
    <div className="syll-overview animate-fade-slide">

      {/* ─── TOP METRICS ROW ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="syll-stat-card" style={{ borderLeft: '3px solid #111' }}>
          <div className="syll-stat-card__label">MASTERY</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{masteryPercent}%</div>
          <div style={{ height: 4, background: '#F4F4F5', borderRadius: 100, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${masteryPercent}%`, background: '#111', borderRadius: 100, transition: 'width 0.5s ease' }} />
          </div>
          <div className="syll-stat-card__subtitle">{totalMastered} / {totalItems} items mastered</div>
        </div>

        <div className="syll-stat-card" style={{ borderLeft: `3px solid ${stats.openGaps > 0 ? '#EF4444' : '#22C55E'}` }}>
          <div className="syll-stat-card__label">OPEN GAPS</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: stats.openGaps > 0 ? '#EF4444' : '#22C55E' }}>{stats.openGaps}</div>
          <div className="syll-stat-card__subtitle">Flagged concepts needing work</div>
        </div>

        <div className="syll-stat-card" style={{ borderLeft: `3px solid ${stats.totalOverdue > 0 ? '#F59E0B' : '#22C55E'}` }}>
          <div className="syll-stat-card__label">OVERDUE</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: stats.totalOverdue > 0 ? '#F59E0B' : '#22C55E' }}>{stats.totalOverdue}</div>
          <div className="syll-stat-card__subtitle">Items past review date</div>
        </div>
      </div>

      {/* ─── PER-DOMAIN BREAKDOWN ─── */}
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        Domain Breakdown
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {registry.map((syll: any) => {
          const d = domains[syll.slug] || { total: 0, mastered: 0, in_progress: 0, not_started: 0, overdue: 0 };
          const pct = d.total > 0 ? Math.round((d.mastered / d.total) * 100) : 0;
          const color = DOMAIN_COLORS[syll.slug] || '#71717A';
          return (
            <div key={syll.slug} style={{
              background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 12,
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'border-color 0.2s', cursor: 'default'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{syll.name}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA' }}>{d.total}</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, background: '#F4F4F5', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.5s ease' }} />
              </div>
              {/* Micro stats */}
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#71717A' }}>
                <span>✓ {d.mastered}</span>
                <span>⟳ {d.in_progress}</span>
                <span style={{ color: d.overdue > 0 ? '#F59E0B' : '#71717A' }}>⚠ {d.overdue}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 500, color: '#111' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── HIGHLIGHTS: OVERDUE / GAPS / ACTIVE ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {highlights?.overdue?.length > 0 && (
          <HighlightSection
            title="Overdue for Review"
            items={highlights.overdue}
            onSelectItem={onSelectItem}
            badgeColor="#FEF3C7"
            badgeTextColor="#92400E"
            badgeField={(item: any) => {
              const d = item.sm2?.nextReviewDate ? new Date(item.sm2.nextReviewDate) : null;
              if (!d) return 'overdue';
              const days = Math.floor((Date.now() - d.getTime()) / 86400000);
              return `${days}d overdue`;
            }}
          />
        )}

        {highlights?.gaps?.length > 0 && (
          <HighlightSection
            title="Critical Gaps"
            items={highlights.gaps}
            onSelectItem={onSelectItem}
            badgeColor="#FEF2F2"
            badgeTextColor="#DC2626"
            badgeField={(item: any) => item.gap?.severity || 'gap'}
          />
        )}

        {highlights?.spine?.length > 0 && (
          <HighlightSection title="Active Tech Spine" items={highlights.spine} onSelectItem={onSelectItem} />
        )}

        {highlights?.projects?.length > 0 && (
          <HighlightSection title="Active Projects" items={highlights.projects} onSelectItem={onSelectItem} />
        )}
      </div>
    </div>
  );
}

function HighlightSection({ title, items, onSelectItem, badgeColor, badgeTextColor, badgeField }: {
  title: string; items: any[]; onSelectItem?: (item: any) => void;
  badgeColor?: string; badgeTextColor?: string; badgeField?: (item: any) => string;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{title}</div>
      <div className="syll-list">
        {items.map((item: any) => (
          <div key={item._id} className="syll-row-card" onClick={() => onSelectItem && onSelectItem({ ...item, source: item.syllabusSlug })}>
            <div className="syll-row-card__left">
              <div className="syll-row-card__name">{item.title}</div>
              <div className="syll-row-card__meta">{item.syllabusSlug}</div>
            </div>
            {badgeField && (
              <div className="syll-row-card__right">
                <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, background: badgeColor || '#F4F4F5', color: badgeTextColor || '#71717A' }}>
                  {badgeField(item)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

