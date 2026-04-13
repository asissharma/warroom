'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contextType?: string;
  onCapture: (type: string, content: string) => void;
  onDrift: () => void;
}

export default function ChatPanel({ isOpen, onClose, contextType, onCapture, onDrift }: ChatPanelProps) {
  const [inputStr, setInputStr] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  // Friendly context name
  const contextLabel = contextType
    ?.replace(/_/g, ' ')
    .replace(/SM2/i, '')
    .trim() || 'General';

  const handleSend = () => {
    if (!inputStr.trim()) return;

    if (inputStr.startsWith('/')) {
      const parts = inputStr.split(' ');
      const cmd = parts[0].substring(1);
      const content = parts.slice(1).join(' ');
      
      if (['note', 'insight', 'link', 'connection'].includes(cmd)) {
        onCapture(cmd, content);
        setMessages([...messages, { role: 'system', content: `Captured ${cmd}` }]);
        setInputStr('');
        return;
      }
    }

    setMessages([...messages, { role: 'user', content: inputStr }]);
    setInputStr('');
    setTurnCount(prev => prev + 1);

    if (turnCount > 4) {
      onDrift();
      setMessages(prev => [...prev, { role: 'system', content: 'Drift detected — refocus on your block.' }]);
      setTurnCount(0);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: `[AI response for ${contextLabel}]` }]);
      }, 500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header__title">{contextLabel}</div>
        <button className="chat-header__close" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div className="chat-messages hide-scrollbar">
        {messages.length === 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#A1A1AA', 
            fontSize: 13 
          }}>
            Ask a question about this block...
          </div>
        )}
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={
              msg.role === 'user' ? 'chat-msg--user' :
              msg.role === 'system' ? 'chat-msg--system' :
              'chat-msg--ai'
            }
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input at bottom of RIGHT panel */}
      <div className="chat-input-area">
        <input 
          type="text" 
          value={inputStr}
          onChange={e => setInputStr(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
