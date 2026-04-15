'use client';

import React, { useState } from 'react';
import SmartTextarea from '../shared/SmartTextarea';

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

  // Footer for the block note SmartTextarea
  const noteFooter = (
    <>
      {!isDone && blockNote.trim().length >= 5 && !noteSaved && (
        <button className="block-note-save" onClick={handleSaveNote}>
          Save
        </button>
      )}
      {noteSaved && (
        <span className="block-note-saved">
          <span className="block-note-saved__dot" />
          Saved
        </span>
      )}
    </>
  );

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
        <div style={{ marginTop: 16 }}>
          <div className="block-note__label">
            {isDone ? 'Your note' : 'Note'} 
            <span className="block-note__required">required</span>
          </div>
          <SmartTextarea
            value={blockNote}
            onChange={(val) => { setBlockNote(val); setNoteSaved(false); }}
            placeholder="What did you learn? What felt difficult?"
            disabled={isDone}
            rows={{ min: 2, max: 5 }}
            minLength={5}
            showCounter={true}
            footer={noteFooter}
          />
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


/* ── QUESTIONS CAROUSEL SUB-COMPONENT ────────────── */

function QuestionsView({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const { items, correct, struggled, total } = data;

  const [qIndex, setQIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  // Per-question notes: { [questionId]: string }
  const [qNotes, setQNotes] = useState<Record<string, string>>(() => {
    const notes: Record<string, string> = {};
    items?.forEach((q: any) => { if (q.note) notes[q.id] = q.note; });
    return notes;
  });
  // Track which notes are saved
  const [qNotesSaved, setQNotesSaved] = useState<Record<string, boolean>>(() => {
    const saved: Record<string, boolean> = {};
    items?.forEach((q: any) => { if (q.note) saved[q.id] = true; });
    return saved;
  });

  if (!items || items.length === 0) return null;

  const answered = items.filter((q: any) => q.status === 'Correct' || q.status === 'Struggled').length;
  const allAnswered = answered === total;

  const currentQ = items[qIndex];
  const isAnswered = currentQ?.status === 'Correct' || currentQ?.status === 'Struggled';
  const currentNote = qNotes[currentQ?.id] || '';

  // Carousel navigation
  const goTo = (idx: number) => {
    if (idx < 0 || idx >= items.length || idx === qIndex) return;
    setSlideDir(idx > qIndex ? 'right' : 'left');
    setQIndex(idx);
    setFadeKey(prev => prev + 1);
  };

  const goPrev = () => goTo(qIndex - 1);
  const goNext = () => goTo(qIndex + 1);

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
        setSlideDir('right');
        setQIndex(qIndex + 1);
        setFadeKey(prev => prev + 1);
      }
    }, 300);
  };

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
  };

  // Get dot color for a question's status
  const getDotColor = (q: any) => {
    if (q.status === 'Correct') return '#22C55E';
    if (q.status === 'Struggled') return '#EF4444';
    return '#D4D4D8';
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

        {/* Dot indicators — still visible in stats view for review */}
        <div className="q-carousel__dots" style={{ marginTop: 16 }}>
          {items.map((q: any, i: number) => (
            <button
              key={q.id}
              className={`q-carousel__dot ${i === qIndex ? 'q-carousel__dot--current' : ''}`}
              style={{ background: getDotColor(q) }}
              onClick={() => goTo(i)}
              title={`Q${i + 1}: ${q.status}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="question-view" tabIndex={0} onKeyDown={handleKeyDown}>

      {/* ── CAROUSEL HEADER: arrows + counter ── */}
      <div className="q-carousel__header">
        <button
          className="q-carousel__arrow"
          onClick={goPrev}
          disabled={qIndex === 0}
          title="Previous question"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>

        <div className="question-counter">
          {qIndex + 1} / {total}
        </div>

        <button
          className="q-carousel__arrow"
          onClick={goNext}
          disabled={qIndex === items.length - 1}
          title="Next question"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* ── DOT INDICATORS ── */}
      <div className="q-carousel__dots">
        {items.map((q: any, i: number) => (
          <button
            key={q.id}
            className={`q-carousel__dot ${i === qIndex ? 'q-carousel__dot--current' : ''}`}
            style={{ background: getDotColor(q) }}
            onClick={() => goTo(i)}
            title={`Q${i + 1}${q.theme ? ` · ${q.theme}` : ''}`}
          />
        ))}
      </div>

      {/* ── QUESTION CARD with slide animation ── */}
      <div key={fadeKey} className={`animate-fade-slide q-carousel__slide q-carousel__slide--${slideDir}`}>
        {/* Theme badge if available */}
        {currentQ.theme && (
          <div className="q-carousel__theme">{currentQ.theme}</div>
        )}

        <div className="question-text">
          {currentQ.text}
        </div>
      </div>

      {/* Per-question note — COMPULSORY */}
      <div style={{ marginBottom: 16 }}>
        <div className="block-note__label">
          Your reflection 
          <span className="block-note__required">required</span>
        </div>
        <SmartTextarea
          value={currentNote}
          onChange={(val) => {
            setQNotes(prev => ({ ...prev, [currentQ.id]: val }));
            setQNotesSaved(prev => ({ ...prev, [currentQ.id]: false }));
          }}
          placeholder={isAnswered ? 'Noted' : 'Why do you know this? Or why not?'}
          disabled={isAnswered}
          rows={{ min: 1, max: 3 }}
          minLength={3}
          showCounter={false}
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
