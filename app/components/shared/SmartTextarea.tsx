'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface SmartTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  showCounter?: boolean;
  autoFocus?: boolean;
  submitOnEnter?: boolean;
  rows?: { min: number; max: number };
  className?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'capture' | 'close';
}

export default function SmartTextarea({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type something...',
  disabled = false,
  maxLength,
  minLength,
  showCounter = true,
  autoFocus = false,
  submitOnEnter = false,
  rows = { min: 1, max: 6 },
  className = '',
  footer,
  variant = 'default',
}: SmartTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Reset to min to measure properly
    el.style.height = 'auto';

    const lineHeight = 22; // matches CSS line-height
    const paddingY = 24;   // 12px top + 12px bottom
    const minH = rows.min * lineHeight + paddingY;
    const maxH = rows.max * lineHeight + paddingY;

    const scrollH = el.scrollHeight;
    const newH = Math.max(minH, Math.min(scrollH, maxH));

    el.style.height = `${newH}px`;
    el.style.overflowY = scrollH > maxH ? 'auto' : 'hidden';
  }, [rows.min, rows.max]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && onSubmit) {
        onSubmit();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
    onChange(newVal);
  };

  const charCount = value.trim().length;
  const isUnderMin = minLength ? charCount < minLength : false;

  const containerClass = [
    'smart-textarea',
    `smart-textarea--${variant}`,
    disabled ? 'smart-textarea--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="smart-textarea__input"
        rows={rows.min}
      />

      {/* Footer row: counter + custom actions */}
      {(showCounter || footer) && (
        <div className="smart-textarea__footer">
          <div className="smart-textarea__meta">
            {showCounter && (
              <span className={`smart-textarea__counter ${isUnderMin ? 'smart-textarea__counter--warn' : ''}`}>
                {charCount}{maxLength ? ` / ${maxLength}` : ''}
              </span>
            )}
            {submitOnEnter && (
              <span className="smart-textarea__hint">
                ↵ send · ⇧↵ newline
              </span>
            )}
          </div>
          {footer && (
            <div className="smart-textarea__actions">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
