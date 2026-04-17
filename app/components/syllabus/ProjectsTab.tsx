'use client';

import React, { useState, useEffect } from 'react';
import SyllabusSkeleton from '@/app/components/shared/SyllabusSkeleton';

interface ProjectsTabProps {
  onSelectItem: (item: any) => void;
}

export default function ProjectsTab({ onSelectItem }: ProjectsTabProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/syllabus/projects');
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch projects:', e);
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
        {projects.map((p) => {
          const carry = p.carryForwardCount || 0;
          const statusStyle = getProjectStatus(p.status);

          return (
            <div
              key={p._id}
              onClick={() => onSelectItem({ ...p, source: 'projects' })}
              className="syll-row-card"
              style={{ padding: '18px 24px' }}
            >
              <div className="syll-row-card__left" style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: '#111111', marginBottom: 4 }}>
                  {p.name || 'Untitled Project'}
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  color: '#71717A',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxWidth: 400,
                  lineHeight: 1.5,
                }}>
                  {p.description || 'No description'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {/* Carry forward badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  background: carry >= 3 ? '#FEF2F2' : '#F4F4F5',
                  color: carry >= 3 ? '#DC2626' : '#71717A',
                }}>
                  Retries: {carry}
                </span>

                {/* Status badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                }}>
                  {p.status || 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getProjectStatus(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'done' || s === 'completed') return { bg: '#F0FDF4', color: '#166534' };
  if (s === 'inprogress' || s === 'in-progress') return { bg: '#FAF5FF', color: '#7E22CE' };
  return { bg: '#F4F4F5', color: '#71717A' };
}
