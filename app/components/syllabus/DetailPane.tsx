'use client';

import React, { useState } from 'react';

interface DetailPaneProps {
  item: any;
  onClose: () => void;
}

export default function DetailPane({ item: initialItem, onClose }: DetailPaneProps) {
  const [item, setItem] = useState(initialItem);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);


  // Edit states
  const [editStatus, setEditStatus] = useState(initialItem?.status || '');
  const [editDifficulty, setEditDifficulty] = useState(initialItem?.difficulty || initialItem?.depthReached || 1);
  const [editNotes, setEditNotes] = useState(initialItem?.description || initialItem?.microtask || initialItem?.notes || initialItem?.prompt || '');

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = { status: editStatus };
      if (item.difficulty !== undefined) updateData.difficulty = Number(editDifficulty);
      else if (item.depthReached !== undefined) updateData.depthReached = Number(editDifficulty);

      if (item.description !== undefined) updateData.description = editNotes;
      else if (item.microtask !== undefined) updateData.microtask = editNotes;
      else if (item.notes !== undefined) updateData.notes = editNotes;
      else updateData.prompt = editNotes;

      const res = await fetch('/api/syllabus/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: item.source,
          refId: item._id,
          updateData
        })
      });

      if (res.ok) {
        setItem({ ...item, ...updateData });
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Failed to update detail item', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiAction = async (action: string) => {
    setAiLoading(action);
    setAiResult(null);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item._id })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.response);
      } else {
        setAiResult(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error('AI Action failed', e);
      setAiResult('Connection failed.');
    } finally {
      setAiLoading(null);
    }
  };


  // Compute remaining keys for Metadata area (filter out standard UI fields & react internals)
  const excludeKeys = ['_id', '__v', 'source', 'status', 'difficulty', 'depthReached', 'description', 'microtask', 'notes', 'prompt', 'topic', 'name', 'text', 'concept', 'completionPercent', 'timesStruggled', 'flagCount', 'lastReview', 'lastAddressed'];
  const metadataEntries = Object.entries(item).filter(([k]) => !excludeKeys.includes(k) && typeof item[k] !== 'object');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FAFAFA', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px', borderBottom: '1px solid #EBEBEB', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          {isEditing ? (
            <select 
              value={editStatus} 
              onChange={e => setEditStatus(e.target.value)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid #EBEBEB',
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="pending">Pending / Unseen</option>
              <option value="in-progress">In Progress / Learning</option>
              <option value="completed">Completed / Mastered</option>
              <option value="surface">Surface</option>
              <option value="review">Review</option>
              <option value="retired">Retired</option>
              <option value="open">Open (Gap)</option>
              <option value="closed">Closed (Gap)</option>
            </select>
          ) : (
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 500, ...getStatusColors(item.status),
            }}>
              {item.status || 'Active'}
            </span>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              disabled={isSaving}
              style={{
                padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EBEBEB', background: isEditing ? '#111111' : '#FFFFFF', color: isEditing ? '#FFFFFF' : '#111111', borderRadius: 8, cursor: isSaving ? 'wait' : 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
              }}
            >
              {isSaving ? '...' : isEditing ? 'Save' : 'Edit'}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EBEBEB', background: '#FFFFFF', borderRadius: 8, cursor: 'pointer', fontSize: 16, color: '#71717A', transition: 'all 0.15s ease',
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {sourceLabels[item.source] || item.source || 'Detail'}
        </div>

        <h2 style={{
          fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: '#111111', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em',
        }}>
          {item.topic || item.name || item.text || item.concept || 'Untitled Item'}
        </h2>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: '12px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #EBEBEB' }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 4 }}>Depth / Difficulty</div>
            {isEditing ? (
              <input type="number" value={editDifficulty} onChange={e => setEditDifficulty(e.target.value)} style={{ width: '100%', fontSize: 16, fontWeight: 700, padding: 4, border: '1px solid #EBEBEB', borderRadius: 4 }} />
            ) : (
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em' }}>
                {item.difficulty || item.depthReached || 1}
              </div>
            )}
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
      <div style={{ padding: '24px 28px', flex: 1 }}>
        
        {/* Core Info - description/notes */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Notes & Description</div>
          {isEditing ? (
            <textarea 
              value={editNotes} 
              onChange={e => setEditNotes(e.target.value)} 
              rows={4}
              style={{ width: '100%', fontSize: 14, padding: 12, border: '1px solid #EBEBEB', borderRadius: 8, resize: 'vertical' }} 
            />
          ) : (
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#3F3F46', lineHeight: 1.7, borderLeft: '2px solid #EBEBEB', paddingLeft: 16, margin: 0,
            }}>
              {item.description || item.microtask || item.notes || item.prompt || 'No notes available for this item.'}
            </p>
          )}
        </div>

        {/* Action Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          <div style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 6 }}>Struggles</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111111' }}>
              {item.timesStruggled || item.flagCount || 0}
            </div>
          </div>
          <div style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 6 }}>Last Reviewed</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>
              {item.lastReview || item.lastAddressed || item.updatedAt ? new Date(item.lastReview || item.lastAddressed || item.updatedAt).toLocaleDateString() : '—'}
            </div>
          </div>
        </div>

        {/* Technical Metadata Collapsible */}
        <div style={{ borderTop: '1px solid #EBEBEB', paddingTop: 16, marginBottom: 20 }}>
          <button 
            onClick={() => setShowMetadata(!showMetadata)}
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#71717A', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ transform: showMetadata ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>›</span>
            Developer Metadata
          </button>
          
          {showMetadata && (
            <div style={{ marginTop: 12, background: '#F4F4F5', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid #E4E4E7' }}>
                <span style={{ fontSize: 11, color: '#A1A1AA' }}>_id</span>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#52525B' }}>{item._id}</span>
              </div>
              {metadataEntries.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid #E4E4E7', gap: 16 }}>
                  <span style={{ fontSize: 11, color: '#A1A1AA' }}>{k}</span>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#52525B', wordBreak: 'break-all', textAlign: 'right' }}>
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI ACTION PANEL */}
        <div style={{ borderTop: '1px solid #EBEBEB', paddingTop: 24 }}>
             <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Agentic Assistance</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                 <AiActionButton 
                    label="Teach Me" 
                    icon="🧠" 
                    onClick={() => handleAiAction('teach')}
                    loading={aiLoading === 'teach'}
                 />
                 <AiActionButton 
                    label="Analyse Gap" 
                    icon="🔍" 
                    onClick={() => handleAiAction('analyze')}
                    loading={aiLoading === 'analyze'}
                 />
                 <AiActionButton 
                    label="Practice Drill" 
                    icon="⚔️" 
                    onClick={() => handleAiAction('practice')}
                    loading={aiLoading === 'practice'}
                 />
                 <AiActionButton 
                    label="Summarize" 
                    icon="📝" 
                    onClick={() => handleAiAction('summarize')}
                    loading={aiLoading === 'summarize'}
                 />
             </div>

             {aiResult && (
                 <div className="animate-fade-slide" style={{ 
                    marginTop: 20, 
                    padding: 16, 
                    background: '#FFFFFF', 
                    borderRadius: 12, 
                    border: '1px solid #111111',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#111111',
                    whiteSpace: 'pre-wrap',
                    position: 'relative'
                 }}>
                     <button 
                        onClick={() => setAiResult('')}
                        style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}
                     >✕</button>
                     <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', marginBottom: 10, textTransform: 'uppercase' }}>
                        AI_{aiLoading?.toUpperCase() || 'RESULT'} // DONE
                     </div>
                     {aiResult}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
}

function AiActionButton({ label, icon, onClick, loading }: any) {
    return (
        <button 
            onClick={onClick}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                height: 42,
                borderRadius: 10,
                border: '1px solid #EBEBEB',
                background: '#FFFFFF',
                fontSize: 13,
                fontWeight: 500,
                color: '#111111',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#111111'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#EBEBEB'}
        >
            {loading ? '...' : (
                <>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    {label}
                </>
            )}
        </button>
    );
}

function getStatusColors(status: string): { background: string; color: string } {
  if (!status) return { background: '#F4F4F5', color: '#71717A' };
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'done' || s === 'retired' || s === 'mastered') return { background: '#F0FDF4', color: '#166534' };
  if (s === 'in-progress' || s === 'active' || s === 'surface' || s === 'solid' || s === 'learning') return { background: '#E0F2FE', color: '#0369A1' };
  if (s === 'overdue' || s === 'critical' || s === 'open') return { background: '#FEF2F2', color: '#DC2626' };
  if (s === 'review') return { background: '#FEF08A', color: '#854D0E' };
  return { background: '#F4F4F5', color: '#71717A' };
}
