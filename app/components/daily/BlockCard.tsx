'use client';

import React, { useState } from 'react';

interface BlockCardProps {
  type: string;
  data: any;
  onUpdate: (data: any) => void;
  onOpenChat: () => void;
  isMorphic?: boolean;
}

const BLOCK_LABELS: Record<string, string> = {
  spine: 'SPINE',
  softSkill: 'SOFT SKILL',
  payableSkill: 'PAYABLE SKILL',
  project: 'PROJECT',
  questions: 'QUESTIONS',
  survival: 'SURVIVAL',
};

const PASTEL_STYLES: Record<string, { bg: string; text: string }> = {
  spine: { bg: '#E0F2FE', text: '#0369A1' },
  softSkill: { bg: '#F0FDF4', text: '#166534' },
  payableSkill: { bg: '#FFF7ED', text: '#9A3412' },
  project: { bg: '#FAF5FF', text: '#7E22CE' },
  questions: { bg: '#FFF1F2', text: '#BE123C' },
  survival: { bg: '#FFFBEB', text: '#92400E' },
};

const EST_TIMES: Record<string, string> = {
  spine: '25m',
  softSkill: '15m',
  payableSkill: '20m',
  project: '45m',
  questions: '12m',
  survival: '10m',
};

export default function BlockCard({ type, data, onUpdate, onOpenChat }: BlockCardProps) {
  const [blockNote, setBlockNote] = useState(data.note || '');
  const [noteSaved, setNoteSaved] = useState(!!data.note);

  if (!data) return null;

  const isDone = data.status === 'Done' || data.isDone;
  const isInProgress = data.status === 'Partial' || data.status === 'InProgress';
  const style = PASTEL_STYLES[type] || PASTEL_STYLES.spine;
  const label = BLOCK_LABELS[type] || type;
  const estTime = EST_TIMES[type] || '15m';

  let cardClass = 'block-card';
  if (isDone) cardClass += ' block-card--done';
  else if (isInProgress) cardClass += ' block-card--in-progress';

  let dotClass = 'block-card__status-dot block-card__status-dot--grey';
  if (isDone) dotClass = 'block-card__status-dot block-card__status-dot--green';
  else if (isInProgress) dotClass = 'block-card__status-dot block-card__status-dot--amber';

  const getTitle = () => {
    switch (type) {
      case 'spine': return data.topicToday;
      case 'softSkill': return data.skillName;
      case 'payableSkill': return data.topicName;
      case 'project': return data.projectName;
      case 'survival': return data.gapName;
      case 'questions': return 'Memory Check';
      default: return type;
    }
  };

  const getDesc = () => {
    switch (type) {
      case 'spine': return data.microtaskToday;
      case 'softSkill': return data.prompt;
      case 'payableSkill': return data.prompt;
      case 'project': return data.description;
      case 'survival': return `Critical gap detected ${data.daysSinceOpen} days ago. Review and close.`;
      case 'questions': return 'Spaced repetition check — answer from memory.';
      default: return '';
    }
  };

  // Handle note save — persists via onUpdate
  const handleSaveNote = () => {
    if (blockNote.trim().length < 5) return;
    onUpdate({ note: blockNote.trim() });
    setNoteSaved(true);
  };

  // "Mark Done" requires a saved note
  const canMarkDone = noteSaved && blockNote.trim().length >= 5;

  const handleMarkDone = () => {
    if (!canMarkDone) return;
    onUpdate({ status: 'Done', syncStatus: 'Done', note: blockNote.trim() });
  };

  return (
    <div className={cardClass}>
      {/* ROW 1: Badge + time + status dot */}
      <div className="block-card__row1">
        <span 
          className="block-card__badge"
          style={{ background: style.bg, color: style.text }}
        >
          {label}
        </span>
        <div className="block-card__meta-right">
          <span className="block-card__time">{estTime}</span>
          <div className={dotClass} />
        </div>
      </div>

      {/* ROW 2: Title */}
      <div className="block-card__title" style={isDone ? { color: '#71717A' } : {}}>
        {getTitle()}
      </div>

      {/* ROW 3: Description */}
      {type !== 'questions' && (
        <div className="block-card__desc" style={isDone ? { color: '#A1A1AA' } : {}}>
          {getDesc()}
        </div>
      )}

      {/* QUESTIONS SPECIAL RENDER */}
      {type === 'questions' && (
        <QuestionsView data={data} onUpdate={onUpdate} />
      )}

      {/* ── COMPULSORY NOTE ───────────────────────────── */}
      {type !== 'questions' && (
        <div className="block-note" style={{ marginTop: 16 }}>
          <div className="block-note__label">
            {isDone ? 'Your note' : 'Note'} 
            <span className="block-note__required">required</span>
          </div>
          <textarea
            value={blockNote}
            onChange={e => { setBlockNote(e.target.value); setNoteSaved(false); }}
            placeholder="What did you learn? What felt difficult?"
            className="block-note__textarea"
            disabled={isDone}
            rows={2}
          />
          <div className="block-note__footer">
            <span className="block-note__counter">{blockNote.trim().length} chars</span>
            {!isDone && blockNote.trim().length >= 5 && !noteSaved && (
              <button className="block-note__save" onClick={handleSaveNote}>
                Save
              </button>
            )}
            {noteSaved && (
              <span className="block-note__saved">✓ Saved</span>
            )}
          </div>
        </div>
      )}

      {/* ROW 4: Actions (non-questions) */}
      {type !== 'questions' && (
        <div className="block-card__actions">
          {isDone ? (
            <>
              <span className="btn-done-pill">✓ Done</span>
              <button 
                onClick={() => onUpdate({ status: 'NotStarted' })}
                className="btn-text"
              >
                Undo
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleMarkDone}
                className="btn-primary"
                disabled={!canMarkDone}
                style={!canMarkDone ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                title={!canMarkDone ? 'Save a note first (min 5 chars)' : ''}
              >
                Mark Done
              </button>
              <button 
                onClick={onOpenChat}
                className="btn-secondary"
              >
                Open Chat
              </button>
              <button
                onClick={() => onUpdate({ status: 'Skipped' })}
                className="btn-text"
              >
                Skip
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


/* ── QUESTIONS SUB-COMPONENT ─────────────────────── */

function QuestionsView({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  // Per-question notes: { [questionId]: string }
  const [qNotes, setQNotes] = useState<Record<string, string>>({});
  // Track which notes are saved
  const [qNotesSaved, setQNotesSaved] = useState<Record<string, boolean>>({});
  
  const { items, correct, struggled, total } = data;
  if (!items || items.length === 0) return null;

  const answered = items.filter((q: any) => q.status === 'Correct' || q.status === 'Struggled').length;
  const allAnswered = answered === total;

  const currentQ = items[qIndex];
  const isAnswered = currentQ?.status === 'Correct' || currentQ?.status === 'Struggled';
  const currentNote = qNotes[currentQ?.id] || '';
  const currentNoteSaved = qNotesSaved[currentQ?.id] || false;

  const handleMark = (status: 'Correct' | 'Struggled') => {
    // Must have a note before marking
    if (currentNote.trim().length < 3) return;
    
    onUpdate({ 
      syncQuestion: { id: currentQ.id, status },
      questionNote: { id: currentQ.id, note: currentNote.trim() }
    });
    setQNotesSaved(prev => ({ ...prev, [currentQ.id]: true }));
    
    // Auto-advance with fade
    setTimeout(() => {
      if (qIndex < items.length - 1) {
        setQIndex(qIndex + 1);
        setFadeKey(prev => prev + 1);
      }
    }, 300);
  };

  // All answered → show stats
  if (allAnswered) {
    return (
      <div className="question-view">
        <div style={{ fontSize: 14, color: '#71717A', marginBottom: 16, textAlign: 'center' }}>
          All {total} questions answered
        </div>
        <div className="question-stats">
          <div className="question-stats__cell">
            <div className="question-stats__label">Total</div>
            <div className="question-stats__value" style={{ color: '#111111' }}>{total}</div>
          </div>
          <div className="question-stats__cell">
            <div className="question-stats__label">Pass</div>
            <div className="question-stats__value" style={{ color: '#22C55E' }}>{correct}</div>
          </div>
          <div className="question-stats__cell">
            <div className="question-stats__label">Fail</div>
            <div className="question-stats__value" style={{ color: '#EF4444' }}>{struggled}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-view">
      {/* Counter */}
      <div className="question-counter">
        {qIndex + 1} of {total}
      </div>

      {/* Question text with fade */}
      <div key={fadeKey} className="animate-fade-slide">
        <div className="question-text">
          {currentQ.text}
        </div>
      </div>

      {/* Per-question note — COMPULSORY */}
      <div className="block-note" style={{ marginBottom: 16 }}>
        <div className="block-note__label">
          Your reflection 
          <span className="block-note__required">required</span>
        </div>
        <input
          type="text"
          value={currentNote}
          onChange={e => {
            setQNotes(prev => ({ ...prev, [currentQ.id]: e.target.value }));
            setQNotesSaved(prev => ({ ...prev, [currentQ.id]: false }));
          }}
          placeholder={isAnswered ? 'Noted' : 'Why do you know this? Or why not?'}
          className="block-note__input"
          disabled={isAnswered}
        />
      </div>

      {/* Action buttons */}
      {!isAnswered ? (
        <div className="question-actions">
          <button 
            className="btn-got-it" 
            onClick={() => handleMark('Correct')}
            disabled={currentNote.trim().length < 3}
            style={currentNote.trim().length < 3 ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
          >
            ✓ Got It
          </button>
          <button 
            className="btn-missed" 
            onClick={() => handleMark('Struggled')}
            disabled={currentNote.trim().length < 3}
            style={currentNote.trim().length < 3 ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
          >
            ✗ Missed
          </button>
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '10px 0', 
          fontSize: 13, 
          color: currentQ.status === 'Correct' ? '#166534' : '#BE123C',
          marginBottom: 16
        }}>
          {currentQ.status === 'Correct' ? '✓ Got it' : '✗ Missed'}
        </div>
      )}

      {/* Progress bar */}
      <div className="question-progress-bar">
        <div 
          className="question-progress-bar__fill"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
