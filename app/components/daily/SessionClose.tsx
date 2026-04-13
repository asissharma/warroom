'use client';

import React, { useState, useEffect } from 'react';

interface SessionCloseProps {
  onCloseSession: (note: string) => Promise<any>;
}

export default function SessionClose({ onCloseSession }: SessionCloseProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const isValid = note.length >= 20;

  const handleClose = async () => {
    if (!isValid) return;
    setSubmitting(true);
    const res = await onCloseSession(note);
    if (res && res.success) {
      setResult(res);
    } else {
        alert(res?.error || 'Failed to close session');
    }
    setSubmitting(false);
  };

  if (result) {
    return (
      <div className="session-closed animate-hud-fade">
        <div style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 8, letterSpacing: '0.04em' }}>
          Day Complete
        </div>
        <div className="session-closed__score">
            +{result.momentumScore.toFixed(1)}
        </div>
        <div className="session-closed__label">
            Momentum earned
        </div>
        
        {result.tomorrowFocus && (
          <div style={{ 
            textAlign: 'left', 
            background: '#F8F8F8', 
            border: '1px solid #EBEBEB', 
            padding: 20, 
            borderRadius: 10,
            maxWidth: 480,
            margin: '0 auto'
          }}>
            <div style={{ fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontWeight: 600 }}>
              Tomorrow&apos;s Focus
            </div>
            <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
              &quot;{result.tomorrowFocus}&quot;
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="close-day">
      <div className="close-day__label">
        Honest Reflection
      </div>
      <div className="close-day__subtitle">
        What felt fragile? What did you actually learn?
      </div>
      
      <div style={{ position: 'relative' }}>
        <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            className="close-day__textarea"
            placeholder="What felt fragile? Did you actually master it? Any specific blockers?"
        />
        <div className="close-day__counter">
            {note.length} / 20
        </div>
      </div>

      <button 
        onClick={handleClose}
        disabled={!isValid || submitting}
        className={`close-day__btn ${isValid ? 'close-day__btn--enabled' : 'close-day__btn--disabled'}`}
      >
        {submitting ? 'Closing...' : 'Close Day'}
      </button>
    </div>
  );
}
