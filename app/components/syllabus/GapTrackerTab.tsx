'use client';

import React, { useState, useEffect } from 'react';

interface GapTrackerTabProps {
  onSelectItem: (item: any) => void;
}

export default function GapTrackerTab({ onSelectItem }: GapTrackerTabProps) {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/gaps');
        const data = await res.json();
        if (data.success) {
          setGaps(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch gaps:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
        <div style={{ width: 28, height: 28, border: '2px solid #111111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Loading...</div>
      </div>
    );
  }

  const criticalCount = gaps.filter(g => g.severity === 'critical').length;

  const depthLabels = ['Introduced', 'Explained', 'Drilled'];

  const getSeverityStyle = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
    if (s === 'medium') return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
    return { bg: '#F4F4F5', color: '#71717A', border: '#EBEBEB' };
  };

  const getSourceBadge = (sourceType: string) => {
    const s = (sourceType || '').toLowerCase();
    if (s === 'spine' || s === 'tech') return { bg: '#E0F2FE', color: '#0369A1', label: 'Tech Spine' };
    if (s === 'soft' || s === 'softskill') return { bg: '#F0FDF4', color: '#166534', label: 'Soft Skills' };
    if (s === 'payable') return { bg: '#FFF7ED', color: '#9A3412', label: 'Payable' };
    if (s === 'project') return { bg: '#FAF5FF', color: '#7E22CE', label: 'Project' };
    if (s === 'questions' || s === 'question') return { bg: '#FFF1F2', color: '#BE123C', label: 'Questions' };
    if (s === 'survival') return { bg: '#FFFBEB', color: '#92400E', label: 'Survival' };
    return { bg: '#F4F4F5', color: '#71717A', label: sourceType || 'System' };
  };

  return (
    <div className="animate-fade-slide">
      {/* Gap debt bar */}
      {criticalCount > 0 && (
        <div style={{
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: 10,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: '#92400E' }}>
            ⚠ {criticalCount} critical gap{criticalCount !== 1 ? 's' : ''} need attention
          </span>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            color: '#F59E0B',
            cursor: 'pointer',
            fontWeight: 500,
          }}>
            View all
          </button>
        </div>
      )}

      {/* Gap list */}
      {gaps.length === 0 ? (
        <div style={{
          padding: '80px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: '#FFFFFF',
          border: '1px dashed #EBEBEB',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛡</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111111', marginBottom: 6 }}>No Open Gaps</div>
          <div style={{ fontSize: 13, color: '#A1A1AA' }}>All tracked concepts are on track.</div>
        </div>
      ) : (
        <div className="syll-list" style={{ gap: 10 }}>
          {gaps.map((gap) => {
            const sevStyle = getSeverityStyle(gap.severity);
            const sourceBadge = getSourceBadge(gap.sourceType);
            const depthReached = gap.depthReached || 0;

            return (
              <div
                key={gap._id}
                onClick={() => onSelectItem({ ...gap, source: 'gaps' })}
                className="syll-row-card"
                style={{ padding: '20px 24px', flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }}
              >
                {/* Row 1: concept + severity badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: '#111111' }}>
                    {gap.concept}
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    background: sevStyle.bg,
                    color: sevStyle.color,
                    border: `1px solid ${sevStyle.border}`,
                  }}>
                    {gap.severity || 'low'}
                  </span>
                </div>

                {/* Row 2: source badge + flagged + last addressed */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    background: sourceBadge.bg,
                    color: sourceBadge.color,
                  }}>
                    {sourceBadge.label}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: "'Inter', sans-serif", color: '#A1A1AA' }}>
                    Flagged {gap.flagCount || 1} time{(gap.flagCount || 1) !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: "'Inter', sans-serif", color: '#A1A1AA' }}>
                    Last addressed: Day {gap.lastAddressed || '—'}
                  </span>
                </div>

                {/* Row 3: depth progress bar */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ width: '100%', height: 3, background: '#F4F4F5', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(depthReached / 3) * 100}%`, background: '#111111', borderRadius: 100, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{
                    marginTop: 6,
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#A1A1AA',
                  }}>
                    Depth: {depthLabels.slice(0, depthReached).join(' / ') || 'None'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
