'use client';

import React, { useState, useEffect } from 'react';
import SyllabusSkeleton from '@/app/components/shared/SyllabusSkeleton';

interface SoftSkillsTabProps {
  onSelectItem: (item: any) => void;
}

export default function SoftSkillsTab({ onSelectItem }: SoftSkillsTabProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/skills');
        const data = await res.json();
        if (data.success) {
          // Filter for unique soft skills
          const filtered = data.data.filter((s: any) => s.type === 'soft');
          setSkills(filtered);
        }
      } catch (e) {
        console.error('Failed to fetch soft skills:', e);
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
            onClick={() => onSelectItem({ ...s, source: 'soft_skills' })}
            className="syll-row-card"
            style={{ padding: '18px 24px' }}
          >
            <div className="syll-row-card__left" style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: '#111111', marginBottom: 2 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: '#71717A' }}>
                {s.prompt || 'Soft skill objective'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                color: '#166534',
              }}>
                {s.completionPercent || 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
