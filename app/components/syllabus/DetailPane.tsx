'use client';

import React from 'react';

interface DetailPaneProps {
  item: any;
  onClose: () => void;
}

export default function DetailPane({ item, onClose }: DetailPaneProps) {
  if (!item) return null;

  const sourceLabels: Record<string, string> = {
    spine: 'Tech Spine',
    questions: 'Questions',
    projects: 'Projects',
    soft_skills: 'Soft Skills',
    payable_skills: 'Payable Skills',
    gaps: 'Gap Tracker',
    survival: 'Gap Tracker',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FAFAFA', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #EBEBEB', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: 11,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            ...getStatusColors(item.status),
          }}>
            {item.status || 'Active'}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #EBEBEB',
              background: '#FFFFFF',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              color: '#71717A',
              transition: 'all 0.15s ease',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {sourceLabels[item.source] || item.source || 'Detail'}
        </div>

        <h2 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 28,
          color: '#111111',
          lineHeight: 1.2,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}>
          {item.topic || item.name || item.text || item.concept}
        </h2>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: '12px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #EBEBEB' }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 4 }}>Depth</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em' }}>
              {item.difficulty || item.depthReached || 1}
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #EBEBEB' }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 4 }}>Completion</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em' }}>
              {item.completionPercent || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px', flex: 1 }}>
        {/* Description */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Notes</div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: '#71717A',
            lineHeight: 1.7,
            borderLeft: '2px solid #EBEBEB',
            paddingLeft: 16,
            margin: 0,
          }}>
            {item.description || item.microtask || item.notes || item.prompt || 'No notes available for this item.'}
          </p>
        </div>

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 6 }}>Struggles</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111111' }}>
              {item.timesStruggled || item.flagCount || 0}
            </div>
          </div>
          <div style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 6 }}>Last Reviewed</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>
              {item.lastReview || item.lastAddressed || '—'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button className="btn-primary" style={{ flex: 1, height: 40, borderRadius: 10 }}>
            Drill Down
          </button>
          <button className="btn-secondary" style={{ flex: 1, height: 40, borderRadius: 10 }}>
            Flag
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusColors(status: string): { background: string; color: string } {
  if (!status) return { background: '#F4F4F5', color: '#71717A' };
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'done' || s === 'retired' || s === 'mastered') return { background: '#F0FDF4', color: '#166534' };
  if (s === 'in-progress' || s === 'active' || s === 'surface' || s === 'solid') return { background: '#E0F2FE', color: '#0369A1' };
  if (s === 'overdue' || s === 'critical') return { background: '#FEF2F2', color: '#DC2626' };
  return { background: '#F4F4F5', color: '#71717A' };
}
