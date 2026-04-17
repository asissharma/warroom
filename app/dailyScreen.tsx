'use client';

import React, { useEffect, useState, useRef } from 'react';
import BlockCard from './components/daily/BlockCard';
import ChatPanel from './components/daily/ChatPanel';
import SessionClose from './components/daily/SessionClose';
import CaptureBar from './components/daily/CaptureBar';

const BLOCK_LABELS: Record<string, string> = {
  spine: 'SPINE',
  softSkill: 'SOFT SKILL',
  payableSkill: 'PAYABLE SKILL',
  project: 'PROJECT',
  questions: 'QUESTIONS',
  survival: 'SURVIVAL',
};

export default function DailyScreen() {
  const [session, setSession] = useState<any>(null);
  const [carryForward, setCarryForward] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/daily/session');
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          setCarryForward(data.carryForwardItems || []);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateBlock = async (blockType: string, updateData: any) => {
    const { syncQuestion, questionNote, ...pureUpdateData } = updateData;

    setSession((prev: any) => {
      const next = { ...prev };
      const block = { ...next.blocks[blockType] };

      if (syncQuestion) {
        const items = [...block.items];
        const idx = items.findIndex(q => q.id === syncQuestion.id);
        if (idx !== -1 && items[idx].status !== 'Correct' && items[idx].status !== 'Struggled') {
          items[idx].status = syncQuestion.status;
          if (syncQuestion.status === 'Correct') block.correct++;
          else if (syncQuestion.status === 'Struggled') block.struggled++;
          block.items = items;
        }
      }

      if (questionNote) {
        const items = block.items ? [...block.items] : [];
        const idx = items.findIndex((q: any) => q.id === questionNote.id);
        if (idx !== -1) {
          items[idx] = { ...items[idx], note: questionNote.note };
          block.items = items;
        }
      }

      next.blocks[blockType] = { ...block, ...pureUpdateData };
      return next;
    });

    try {
      await fetch('/api/daily/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: session._id, 
          blockType, 
          updateData: { ...updateData, refId: session.blocks[blockType]?.refId } 
        })
      });
    } catch (e) {
      console.error('Failed to update block in db:', e);
    }
  };

  const handleCloseSession = async (note: string) => {
    try {
      const res = await fetch('/api/daily/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session._id, honestNote: note, driftEventsCount: 0 })
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to close session:', e);
      return { success: false, error: 'Network failure' };
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ fontFamily: 'var(--font-body), Inter, sans-serif', fontSize: 13, color: '#A1A1AA' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body), Inter, sans-serif', fontSize: 14, color: '#BE123C' }}>
        Unable to load session. Check database connection.
      </div>
    );
  }

  // Count completed blocks
  const blockKeys = ['spine', 'softSkill', 'payableSkill', 'project', 'survival', 'questions'];
  const existingBlocks = blockKeys.filter(k => session.blocks[k]);
  const doneBlocks = existingBlocks.filter(k => {
    const b = session.blocks[k];
    return b.status === 'Done' || b.isDone;
  });

  // Build rich topic list for CaptureBar (with real refIds + human names)
  const richTopics = existingBlocks.map(k => {
    const b = session.blocks[k];
    let displayName = BLOCK_LABELS[k] || k;
    // Use the actual task name from the session data
    if (k === 'spine' && b.topicToday) displayName = b.topicToday;
    else if (k === 'softSkill' && b.skillName) displayName = b.skillName;
    else if (k === 'payableSkill' && b.topicName) displayName = b.topicName;
    else if (k === 'project' && b.projectName) displayName = b.projectName;
    else if (k === 'survival' && b.gapName) displayName = b.gapName;
    else if (k === 'questions') displayName = 'Memory Check';
    return {
      id: k,
      name: displayName,
      type: k,
      refId: b.refId || null,              // actual MongoDB ObjectId
      blockLabel: BLOCK_LABELS[k] || k,    // block category label
    };
  });

  // Build feed items from carryForward
  const feedItems = carryForward.map((item, i) => ({
    id: i,
    name: item.name,
    type: item.type || 'general',
    text: `Yesterday's ${item.name} carried forward`,
    time: 'Yesterday'
  }));

  // Block type colors for feed dots
  const blockDotColors: Record<string, string> = {
    spine: '#0369A1',
    softSkill: '#166534',
    payableSkill: '#9A3412',
    project: '#7E22CE',
    questions: '#BE123C',
    survival: '#92400E',
    general: '#A1A1AA',
  };

  const handleOpenChat = (contextType: string) => {
    setActiveContext(contextType);
    setChatOpen(true);
    // Auto-open right panel if collapsed
    if (!rightPanelOpen) setRightPanelOpen(true);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>

      {/* ── TOP BAR ─────────────────────────────────── */}
      <div className="top-bar">
        <div className="top-bar__directive">
          DIRECTIVE_{session.dayNumber}
        </div>

        <div className="top-bar__pills">
          <span className="top-bar__pill">{session.phase}</span>
          <span className="top-bar__pill">{session.momentumScore?.toFixed(1) || '0.0'} momentum</span>
          <span className="top-bar__pill">Day {session.dayNumber}</span>
        </div>

        <div className="top-bar__progress">
          {doneBlocks.length} / {existingBlocks.length} blocks complete
        </div>
      </div>

      {/* ── MAIN AREA ───────────────────────────────── */}
      <div className="main-layout">

        {/* LEFT PANEL — Block cards stacked */}
        <div className={`left-panel hide-scrollbar ${!rightPanelOpen ? 'left-panel--expanded' : ''}`} 
             style={{ transition: 'width 0.3s ease' }}>

          {/* Questions block */}
          {session.blocks.questions && (
            <BlockCard
              type="questions"
              data={session.blocks.questions}
              onUpdate={(up) => handleUpdateBlock('questions', up)}
              onOpenChat={() => handleOpenChat('QUESTIONS_SM2')}
            />
          )}

          {/* Tech Spine */}
          {session.blocks.spine && (
            <BlockCard
              type="spine"
              data={session.blocks.spine}
              onUpdate={(up) => handleUpdateBlock('spine', up)}
              onOpenChat={() => handleOpenChat('TECH_SPINE')}
            />
          )}

          {/* Project */}
          {session.blocks.project && (
            <BlockCard
              type="project"
              data={session.blocks.project}
              onUpdate={(up) => handleUpdateBlock('project', up)}
              onOpenChat={() => handleOpenChat('PROJECT')}
            />
          )}

          {/* Soft Skill */}
          {session.blocks.softSkill && (
            <BlockCard
              type="softSkill"
              data={session.blocks.softSkill}
              onUpdate={(up) => handleUpdateBlock('softSkill', up)}
              onOpenChat={() => handleOpenChat('SOFT_SKILLS')}
            />
          )}

          {/* Payable Skill */}
          {session.blocks.payableSkill && (
            <BlockCard
              type="payableSkill"
              data={session.blocks.payableSkill}
              onUpdate={(up) => handleUpdateBlock('payableSkill', up)}
              onOpenChat={() => handleOpenChat('PAYABLE_SKILLS')}
            />
          )}

          {/* Survival */}
          {session.blocks.survival && (
            <BlockCard
              type="survival"
              data={session.blocks.survival}
              onUpdate={(up) => handleUpdateBlock('survival', up)}
              onOpenChat={() => handleOpenChat('SURVIVAL')}
            />
          )}

          {/* Close Day Section */}
          {!session.isClosed && (
            <SessionClose onCloseSession={handleCloseSession} />
          )}

          {session.isClosed && (
            <div className="session-closed">
              <div style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 8 }}>Session Complete</div>
              <div style={{ fontSize: 16, color: '#111111', fontWeight: 500 }}>
                Day {session.dayNumber} is closed. No further changes.
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Feed or Chat (Collapsible) */}
        <div 
          className={`right-panel hide-scrollbar ${!rightPanelOpen ? 'right-panel--collapsed' : ''}`}
          style={{ position: 'relative', transition: 'width 0.3s ease' }}
        >
          {rightPanelOpen && (
            <>
              {/* Collapse toggle button */}
              <button 
                className="right-panel-toggle" 
                onClick={() => { setChatOpen(false); setRightPanelOpen(false); }}
                title="Collapse panel"
              >
                ›
              </button>

              {chatOpen ? (
                <ChatPanel
                  isOpen={chatOpen}
                  onClose={() => setChatOpen(false)}
                  contextType={activeContext}
                  onDrift={() => { }}
                  onCapture={() => { }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="feed-title">Today&apos;s Feed</div>

                  <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                    {feedItems.length > 0 ? (
                      <div>
                        {feedItems.map((item) => (
                          <div key={item.id} className="feed-item">
                            <div
                              className="feed-item__dot"
                              style={{ background: blockDotColors[item.type] || '#A1A1AA' }}
                            />
                            <div className="feed-item__text">{item.text}</div>
                            <div className="feed-item__time">{item.time}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="feed-empty">
                        No alerts today
                      </div>
                    )}
                  </div>

                  {/* CAPTURE FEATURE — Bottom of right panel */}
                  <CaptureBar
                    sessionDay={session.dayNumber}
                    activeTopics={richTopics}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Expand tab (visible when panel is collapsed) */}
        {!rightPanelOpen && (
          <button 
            className="expand-tab" 
            onClick={() => setRightPanelOpen(true)}
            title="Expand panel"
          >
            ‹
          </button>
        )}

      </div>
    </div>
  );
}
