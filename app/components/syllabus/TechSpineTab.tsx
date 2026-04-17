'use client';

import React, { useState, useEffect } from 'react';
import SyllabusSkeleton from '@/app/components/shared/SyllabusSkeleton';

interface TechSpineTabProps {
  onSelectItem: (item: any) => void;
}

type FilterType = 'all' | 'foundation' | 'intermediate' | 'advanced';

export default function TechSpineTab({ onSelectItem }: TechSpineTabProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/techspine');
        const data = await res.json();
        if (data.success) {
          setTopics(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch tech spine:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <SyllabusSkeleton />;
  }

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'foundation', label: 'Foundation' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const filtered = filter === 'all'
    ? topics
    : topics.filter(t => (t.phase || '').toLowerCase() === filter);

  return (
    <div className="animate-fade-slide">
      {/* Filter pills */}
      <div className="syll-filter-row">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`syll-filter-pill ${filter === f.id ? 'syll-filter-pill--active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Topic list */}
      <div className="syll-list">
        {filtered.map((item) => (
          <div
            key={item._id}
            onClick={() => onSelectItem({ ...item, source: 'spine' })}
            className="syll-row-card"
          >
            <div className="syll-row-card__left">
              <div className="syll-row-card__name">{item.topic}</div>
              <div className="syll-row-card__meta">
                Day {item.dayStart || 1}–{item.dayEnd || item.week * 7 || 6}
              </div>
            </div>
            <div className="syll-row-card__right">
              <SpineStatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpineStatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  let bg = '#F4F4F5', color = '#71717A', label = 'Not Started';

  if (s === 'completed' || s === 'mastered') {
    bg = '#F0FDF4'; color = '#166534'; label = 'Mastered';
  } else if (s === 'in-progress' || s === 'solid') {
    bg = '#DBEAFE'; color = '#1D4ED8'; label = 'Solid';
  } else if (s === 'surface' || s === 'started') {
    bg = '#E0F2FE'; color = '#0369A1'; label = 'Surface';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: 100,
      fontSize: 12,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      background: bg,
      color: color,
    }}>
      {label}
    </span>
  );
}
