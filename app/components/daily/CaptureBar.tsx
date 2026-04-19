'use client';

import React, { useState, useEffect, useRef } from 'react';
import SmartTextarea from '../shared/SmartTextarea';

interface CaptureBarProps {
  sessionDay: number;
  activeTopics: { id: string, name: string, type: string, refId?: string | null, blockLabel?: string }[];
  onSuccess?: (msg: string) => void;
}

type CaptureType = 'note' | 'insight' | 'bookmark' | 'connection';

const CAPTURE_TYPES: { id: CaptureType; label: string }[] = [
  { id: 'note', label: 'Note' },
  { id: 'insight', label: 'Insight' },
  { id: 'bookmark', label: 'Bookmark' },
  { id: 'connection', label: 'Connection' },
];

interface TagResult {
  manualTags: string[];
  aiTags: string[];
  dayTag: string;
}

export default function CaptureBar({ sessionDay, activeTopics, onSuccess }: CaptureBarProps) {
  const [input, setInput] = useState('');
  const [captureType, setCaptureType] = useState<CaptureType>('note');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string, name: string, refId?: string | null, blockLabel?: string } | null>(null);
  const [savedTags, setSavedTags] = useState<TagResult | null>(null);
  const [tagsFading, setTagsFading] = useState(false);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'general', name: 'General Note', type: 'NODE', refId: null as string | null, blockLabel: '' },
    ...activeTopics.map(t => ({ ...t, type: (t.blockLabel || t.type).toUpperCase(), refId: t.refId || null, blockLabel: t.blockLabel || t.type }))
  ];

  // Handle / command palette trigger
  useEffect(() => {
    if (input === '/') {
      setIsMenuOpen(true);
      setSelectedIndex(0);
    } else if (!input.startsWith('/')) {
      setIsMenuOpen(false);
    }
  }, [input]);

  // Auto-dismiss tags after 4s
  useEffect(() => {
    if (savedTags) {
      const fadeTimer = setTimeout(() => setTagsFading(true), 3500);
      const clearTimer = setTimeout(() => { setSavedTags(null); setTagsFading(false); }, 4000);
      return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
    }
  }, [savedTags]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isMenuOpen) {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % menuItems.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        const selected = menuItems[selectedIndex];
        if (selected.id !== 'general') {
          setSelectedTopic({ id: selected.id, name: selected.name, refId: selected.refId, blockLabel: selected.blockLabel });
        } else {
          setSelectedTopic(null);
        }
        setInput('');
        setIsMenuOpen(false);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setInput('');
      }
    }
  };

  const handleSync = async () => {
    if (!input.trim() || status === 'syncing') return;
    setStatus('syncing');
    try {
      const res = await fetch('/api/session/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: captureType,
          note: input,
          blockType: selectedTopic?.id || null,
          refId: selectedTopic?.refId || null,
          refName: selectedTopic?.name || null,
          topicId: selectedTopic?.refId || selectedTopic?.id || null,
          sessionDay
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setInput('');
        setSelectedTopic(null);

        // Show returned tags
        if (data.manualTags || data.aiTags) {
          setSavedTags({
            manualTags: data.manualTags || [],
            aiTags: data.aiTags || [],
            dayTag: `day-${sessionDay}`,
          });
        }

        if (onSuccess) onSuccess(data.aiSummary);
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error('Failed to capture note:', err);
      setStatus('idle');
    }
  };

  const showSend = input.trim().length > 0 && status !== 'syncing';

  return (
    <div className="capture-bar">
      {/* Type selector row */}
      <div className="capture-bar__type-row">
        {CAPTURE_TYPES.map(ct => (
          <button
            key={ct.id}
            className={`capture-type-pill ${captureType === ct.id ? 'capture-type-pill--active' : ''}`}
            onClick={() => setCaptureType(ct.id)}
          >
            {ct.label}
          </button>
        ))}

        {/* Topic chip */}
        {selectedTopic && (
          <span className="capture-bar__topic-chip">
            {selectedTopic.name}
            <button
              className="capture-bar__topic-chip-x"
              onClick={() => setSelectedTopic(null)}
            >
              ✕
            </button>
          </span>
        )}
      </div>

      {/* Input area with command palette */}
      <div className="capture-bar__input-wrap" ref={inputWrapRef} onKeyDown={handleKeyDown}>
        {/* Command palette popup */}
        {isMenuOpen && (
          <div className="capture-palette">
            <div className="capture-palette__list">
              {menuItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`capture-palette__item ${i === selectedIndex ? 'capture-palette__item--active' : ''}`}
                  onClick={() => {
                    if (item.id !== 'general') setSelectedTopic({ id: item.id, name: item.name, refId: item.refId, blockLabel: item.blockLabel });
                    else setSelectedTopic(null);
                    setInput('');
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="capture-palette__item-name">{item.name}</span>
                  <span className="capture-palette__item-type">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SmartTextarea
          value={input}
          onChange={setInput}
          onSubmit={handleSync}
          placeholder={selectedTopic ? `Capturing for ${selectedTopic.name}...` : 'Capture a thought... type / for topics'}
          disabled={status === 'syncing'}
          submitOnEnter={true}
          showCounter={false}
          rows={{ min: 1, max: 4 }}
          variant="capture"
        />

        {/* Send button (arrow-up icon) */}
        <button
          className={`capture-bar__send ${showSend ? 'capture-bar__send--visible' : ''} ${status === 'success' ? 'capture-bar__send--success' : ''}`}
          onClick={handleSync}
          disabled={!showSend}
        >
          {status === 'success' ? (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8.5L6.5 12L13 4" />
            </svg>
          ) : status === 'syncing' ? (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M8 2a6 6 0 105.28 3.14" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 12V4M4 7l4-4 4 4" />
            </svg>
          )}
        </button>
      </div>

      {/* Tag pills — shown after save, auto-dismiss */}
      {savedTags && (
        <div className={`capture-tags ${tagsFading ? 'capture-tags--fading' : ''}`}>
          {savedTags.manualTags.map(tag => (
            <span key={`m-${tag}`} className="capture-tag capture-tag--manual">#{tag}</span>
          ))}
          {savedTags.aiTags.map(tag => (
            <span key={`a-${tag}`} className="capture-tag capture-tag--ai">{tag}</span>
          ))}
          <span className="capture-tag capture-tag--day">{savedTags.dayTag}</span>
        </div>
      )}
    </div>
  );
}
