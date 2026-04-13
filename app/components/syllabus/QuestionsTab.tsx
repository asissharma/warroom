'use client';

import React, { useState, useEffect } from 'react';

interface QuestionsTabProps {
  onSelectItem: (item: any) => void;
}

type QFilter = 'all' | 'due' | 'struggling' | 'retired';

export default function QuestionsTab({ onSelectItem }: QuestionsTabProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<QFilter>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/questions');
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data);
          setStats(data.pagination);
        }
      } catch (e) {
        console.error('Failed to fetch questions:', e);
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

  const filters: { id: QFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'due', label: 'Due Today' },
    { id: 'struggling', label: 'Struggling' },
    { id: 'retired', label: 'Retired' },
  ];

  const now = new Date();
  const filtered = questions.filter((q) => {
    if (filter === 'all') return true;
    if (filter === 'due') return q.nextReviewDate && new Date(q.nextReviewDate) <= now;
    if (filter === 'struggling') return (q.timesStruggled || 0) >= 2;
    if (filter === 'retired') return q.status === 'retired';
    return true;
  });

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

      {/* Question list */}
      <div className="syll-list">
        {filtered.map((q) => {
          const correctRate = q.timesCorrect && (q.timesCorrect + (q.timesStruggled || 0)) > 0
            ? Math.round((q.timesCorrect / (q.timesCorrect + (q.timesStruggled || 0))) * 100)
            : null;

          let rateColor = '#A1A1AA';
          if (correctRate !== null) {
            if (correctRate > 70) rateColor = '#22C55E';
            else if (correctRate >= 40) rateColor = '#F59E0B';
            else rateColor = '#EF4444';
          }

          const isDue = q.nextReviewDate && new Date(q.nextReviewDate) <= now;
          const isRetired = q.status === 'retired';

          return (
            <div
              key={q._id}
              onClick={() => onSelectItem({ ...q, source: 'questions' })}
              className="syll-row-card"
              style={{ padding: '16px 24px' }}
            >
              <div className="syll-row-card__left" style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  color: '#111111',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any,
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}>
                  {q.text}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {/* Difficulty badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 100,
                  background: '#F4F4F5',
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                  color: '#71717A',
                  fontWeight: 500,
                }}>
                  {q.difficulty || 1}
                </span>

                {/* Correct rate */}
                {correctRate !== null && (
                  <span style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: rateColor, fontWeight: 600 }}>
                    {correctRate}%
                  </span>
                )}

                {/* Status badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  background: isRetired ? '#F4F4F5' : isDue ? '#FEF2F2' : '#E0F2FE',
                  color: isRetired ? '#71717A' : isDue ? '#DC2626' : '#0369A1',
                }}>
                  {isRetired ? 'retired' : isDue ? 'due' : 'active'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
