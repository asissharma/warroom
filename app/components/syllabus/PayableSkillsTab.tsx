'use client';

import React, { useState, useEffect } from 'react';
import SyllabusSkeleton from '@/app/components/shared/SyllabusSkeleton';

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
    return <SyllabusSkeleton />;
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
