'use client';

import React, { useState } from 'react';
import SmartTextarea from '../shared/SmartTextarea';

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
    if (res && res.session) {
      setResult(res.session);
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
            {result.score}
        </div>
        <div className="session-closed__label">
            Daily Score
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
              &quot;Next focus: {result.tomorrowFocus?.nextTopic || 'Keep reviewing.'}&quot;
            </p>
            {result.tomorrowFocus?.topGap && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#BE123C' }}>
                    Addressing: {result.tomorrowFocus.topGap}
                </div>
            )}
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
      
      <SmartTextarea
        value={note}
        onChange={setNote}
        placeholder="What felt fragile? Did you actually master it? Any specific blockers?"
        rows={{ min: 4, max: 8 }}
        minLength={20}
        showCounter={true}
        maxLength={1000}
        variant="close"
      />

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
