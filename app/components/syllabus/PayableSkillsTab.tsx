'use client';

import React, { useState, useEffect } from 'react';

interface PayableSkillsTabProps {
  onSelectItem: (item: any) => void;
}

export default function PayableSkillsTab({ onSelectItem }: PayableSkillsTabProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/skills');
        const data = await res.json();
        if (data.success) {
          // Filter for unique payable skills
          const filtered = data.data.filter((s: any) => s.type === 'payable' || s.type === 'technical');
          setSkills(filtered);
        }
      } catch (e) {
        console.error('Failed to fetch payable skills:', e);
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

  return (
    <div className="animate-fade-slide">
      <div className="syll-list">
        {skills.map((s) => (
          <div
            key={s._id}
            onClick={() => onSelectItem({ ...s, source: 'payable_skills' })}
            className="syll-row-card"
            style={{ padding: '18px 24px' }}
          >
            <div className="syll-row-card__left" style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: '#111111', marginBottom: 4 }}>
                {s.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Progress bar */}
                <div style={{ width: 120, height: 4, background: '#F4F4F5', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.completionPercent || 0}%`, background: '#9A3412', borderRadius: 100, transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: '#71717A', fontWeight: 500 }}>
                  {s.completionPercent || 0}%
                </span>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: 100,
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                background: '#FFF7ED',
                color: '#9A3412',
              }}>
                {s.chapter ? `Chapter ${s.chapter}` : 'Technical'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
