'use client';

import React, { useState, useEffect } from 'react';
import TechSpineTab from '@/app/components/syllabus/TechSpineTab';
import QuestionsTab from '@/app/components/syllabus/QuestionsTab';
import ProjectsTab from '@/app/components/syllabus/ProjectsTab';
import SoftSkillsTab from '@/app/components/syllabus/SoftSkillsTab';
import PayableSkillsTab from '@/app/components/syllabus/PayableSkillsTab';
import GapTrackerTab from '@/app/components/syllabus/GapTrackerTab';
import DetailPane from '@/app/components/syllabus/DetailPane';

type TabType = 'OVERVIEW' | 'SPINE' | 'QUESTIONS' | 'PROJECTS' | 'SOFT_SKILLS' | 'PAYABLE_SKILLS' | 'GAP_TRACKER';

export default function SyllabusPitt() {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [stats, setStats] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/syllabus');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error('Failed to fetch syllabus stats', e);
      }
    }
    fetchStats();
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'SPINE', label: 'Tech Spine' },
    { id: 'QUESTIONS', label: 'Questions' },
    { id: 'PROJECTS', label: 'Projects' },
    { id: 'SOFT_SKILLS', label: 'Soft Skills' },
    { id: 'PAYABLE_SKILLS', label: 'Payable' },
    { id: 'GAP_TRACKER', label: 'Gap Tracker' },
  ];

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

        <button className="syll-topbar__ai-btn">AI Analysis</button>
      </div>

      {/* ── CONTENT AREA ────────────────────────────── */}
      <div className="syll-content-wrapper">
        <div className={`syll-content ${selectedItem ? 'syll-content--with-detail' : ''}`}>
          {activeTab === 'OVERVIEW' && <OverviewCards stats={stats} />}
          {activeTab === 'SPINE' && <TechSpineTab onSelectItem={setSelectedItem} />}
          {activeTab === 'QUESTIONS' && <QuestionsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'PROJECTS' && <ProjectsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'SOFT_SKILLS' && <SoftSkillsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'PAYABLE_SKILLS' && <PayableSkillsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'GAP_TRACKER' && <GapTrackerTab onSelectItem={setSelectedItem} />}
        </div>

        {selectedItem && (
          <div className="syll-detail-pane">
            <DetailPane
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── OVERVIEW TAB — STAT CARDS ───────────────────── */
function OverviewCards({ stats }: { stats: any }) {
  const progress = stats ? Math.round((stats.spine / 150) * 100) : 0;
  const openGaps = stats?.openGaps || 0;
  const questions = stats?.questions || 0;
  const softSkills = stats?.softSkills || 35;
  const payableSkills = stats?.payableSkills || 12;

  return (
    <div className="syll-overview animate-fade-slide">
      {/* Top row — 3 stat cards */}
      <div className="syll-overview__row">
        <div className="syll-stat-card">
          <div className="syll-stat-card__label">PROGRESS</div>
          <div className="syll-stat-card__value" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {stats ? `${progress}%` : '--'}
          </div>
          <div className="syll-stat-card__subtitle">Topics with Surface+ depth</div>
        </div>

        <div className="syll-stat-card">
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

        <div className="syll-stat-card">
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
    </div>
  );
}
