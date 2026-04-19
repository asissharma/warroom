'use client';

import React, { useState, useEffect } from 'react';
import SyllabusSkeleton from '@/app/components/shared/SyllabusSkeleton';

interface SyllabusListViewProps {
  slug: string;
  itemType: string;
  onSelectItem: (item: any) => void;
}

export default function SyllabusListView({ slug, itemType, onSelectItem }: SyllabusListViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/syllabus/${slug}`);
        const data = await res.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (e) {
        console.error(`Failed to fetch items for ${slug}:`, e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) return <SyllabusSkeleton />;

  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return item.status === 'in_progress';
    if (filter === 'done') return item.status === 'done';
    return true;
  });

  return (
    <div className="animate-fade-slide">
      <div className="syll-filter-row">
        {['all', 'in-progress', 'done'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`syll-filter-pill ${filter === f ? 'syll-filter-pill--active' : ''}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="syll-list">
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#A1A1AA' }}>No items found.</div>
        ) : (
          filtered.map(item => (
            <div
              key={item._id}
              onClick={() => onSelectItem({ ...item, source: slug })}
              className="syll-row-card"
            >
              <div className="syll-row-card__left">
                <div className="syll-row-card__name">{item.title}</div>
                <div className="syll-row-card__meta">
                  {itemType === 'question' ? `Difficulty: ${item.difficulty || 1}` : item.phase || 'General'}
                  {item.sm2 && ` • Next Review: ${new Date(item.sm2.nextReviewDate).toLocaleDateString()}`}
                </div>
              </div>
              <div className="syll-row-card__right">
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  let bg = '#F4F4F5', color = '#71717A', label = status;

  if (s === 'done' || s === 'completed' || s === 'mastered') {
    bg = '#F0FDF4'; color = '#166534'; label = 'Done';
  } else if (s === 'in_progress' || s === 'active') {
    bg = '#E0F2FE'; color = '#0369A1'; label = 'Active';
  } else if (s === 'not_started') {
    bg = '#F4F4F5'; color = '#71717A'; label = 'Pending';
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
