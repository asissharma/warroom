'use client';

import React, { useEffect, useState } from 'react';
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

// Map DB slugs to UI keys
const SLUG_TO_KEY: Record<string, string> = {
  'tech-spine': 'spine',
  'soft-skills': 'softSkill',
  'payable-skills': 'payableSkill',
  'projects': 'project',
  'questions': 'questions',
  'survival-gaps': 'survival',
};

export default function DailyScreen() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rightTab, setRightTab] = useState<'ACTIVITY' | 'ASSISTANT'>('ACTIVITY');
  const [activeContext, setActiveContext] = useState<string>('');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/session/today');
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // --- Group Items for UI Modules ---
  const groupItems = (items: any[]) => {
    const groups: Record<string, any> = {
        questions: { items: [], status: 'NotStarted', correct: 0, struggled: 0, total: 0 }
    };
    
    items.forEach(item => {
        const key = SLUG_TO_KEY[item.syllabusSlug];
        if (!key) return;

        if (key === 'questions') {
            groups.questions.items.push({
                id: item._id,
                text: item.title,
                theme: item.meta?.theme || '',
                status: item.sm2?.nextReviewDate && new Date(item.sm2.nextReviewDate).setHours(0,0,0,0) > new Date().setHours(0,0,0,0) 
                        ? (item.sm2.interval > 1 ? 'Correct' : 'Struggled') : 'Pending'
            });
            // We'll overlay local session results onto this later
        } else {
            // Single item blocks
            groups[key] = {
                ...item,
                id: item._id,
                // Status mapping: if the item's status is 'done', marked it as 'Done' for UI
                status: item.status === 'done' ? 'Done' : (item.status === 'in_progress' ? 'InProgress' : 'NotStarted')
            };
        }
    });

    // Map Session Results to the grouped items
    session.results.forEach((r: any) => {
        const itemKey = items.find(i => i._id === r.itemId)?.syllabusSlug;
        const uiKey = SLUG_TO_KEY[itemKey || ''];

        if (uiKey === 'questions') {
            const q = groups.questions.items.find((qi: any) => qi.id === r.itemId);
            if (q) {
                q.status = r.result === 'done' ? 'Correct' : (r.result === 'struggled' ? 'Struggled' : 'Pending');
            }
        } else if (uiKey) {
            groups[uiKey].status = r.result === 'done' ? 'Done' : (r.result === 'struggled' ? 'InProgress' : 'NotStarted');
        }
    });

    // Finalize questions stats
    groups.questions.total = groups.questions.items.length;
    groups.questions.correct = groups.questions.items.filter((q: any) => q.status === 'Correct').length;
    groups.questions.struggled = groups.questions.items.filter((q: any) => q.status === 'Struggled').length;
    if (groups.questions.total > 0 && (groups.questions.correct + groups.questions.struggled === groups.questions.total)) {
        groups.questions.status = 'Done';
    } else if (groups.questions.correct + groups.questions.struggled > 0) {
        groups.questions.status = 'Partial';
    }

    return groups;
  };

  const uiBlocks = groupItems(session.populatedItems || []);

  const handleUpdateItem = async (itemId: string, result: 'done' | 'struggled' | 'skipped') => {
    try {
      const res = await fetch(`/api/session/item/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          result, 
          sessionDate: session.date 
        })
      });
      if (res.ok) {
        // Reload session data to reflect changes
        await loadData();
      }
    } catch (e) {
      console.error('Failed to update item:', e);
    }
  };

  const handleCloseSession = async (note: string) => {
    try {
      const res = await fetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session._id, honestNote: note })
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      }
      return data;
    } catch (e) {
      console.error('Failed to close session:', e);
      return { success: false, error: 'Network failure' };
    }
  };

  const handleOpenChat = (contextType: string, _contextData?: any) => {
    setActiveContext(contextType);
    setRightTab('ASSISTANT');
    if (!rightPanelOpen) setRightPanelOpen(true);
  };

  // Build topics for CaptureBar
  const richTopics = session.populatedItems?.filter((i: any) => i.syllabusSlug !== 'questions').map((i: any) => ({
      id: i.syllabusSlug,
      name: i.title,
      type: i.syllabusSlug,
      refId: i._id,
      blockLabel: BLOCK_LABELS[SLUG_TO_KEY[i.syllabusSlug]] || i.syllabusSlug
  })) || [];

  const doneCount = Object.keys(uiBlocks).filter(k => uiBlocks[k].status === 'Done').length;
  const totalCount = Object.keys(uiBlocks).length;



  const handleCopyTasks = () => {
    const items = session.populatedItems || [];
    const lines: string[] = [`📋 WARROOM — Day ${session.dayNumber} | ${new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, ''];

    // Group by syllabus slug 
    const grouped: Record<string, any[]> = {};
    items.forEach((item: any) => {
      const slug = item.syllabusSlug;
      if (!grouped[slug]) grouped[slug] = [];
      grouped[slug].push(item);
    });

    Object.entries(grouped).forEach(([slug, groupItems]) => {
      const uiKey = SLUG_TO_KEY[slug] || slug;
      const label = BLOCK_LABELS[uiKey] || slug.toUpperCase();
      lines.push(`── ${label} ──`);
      groupItems.forEach((item: any) => {
        const result = session.results?.find((r: any) => r.itemId === item._id);
        const icon = result ? (result.result === 'done' ? '✅' : result.result === 'struggled' ? '❌' : '⬜') : '⬜';
        lines.push(`${icon} ${item.title}`);
      });
      lines.push('');
    });

    lines.push(`Score: ${session.score ?? '—'} | Blocks Done: ${doneCount}/${totalCount}`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>

      {/* ── TOP BAR ─────────────────────────────────── */}
      <div className="top-bar">
        <div className="top-bar__directive">
          DIRECTIVE_{session.dayNumber}
        </div>

        <div className="top-bar__pills">
          <span className="top-bar__pill">{session.dayNumber > 0 ? 'Foundation' : 'Initializing'}</span>
          <span className="top-bar__pill">{session.score !== null ? `${session.score} score` : 'Active'}</span>
          <span className="top-bar__pill">Day {session.dayNumber}</span>
        </div>

        <div className="top-bar__progress" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
            {doneCount} / {totalCount}
          </div>
          <div style={{ width: 100, height: 6, background: '#F4F4F5', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: '#111111', 
              width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ───────────────────────────────── */}
      <div className="main-layout">

        <div className={`left-panel hide-scrollbar ${!rightPanelOpen ? 'left-panel--expanded' : ''}`} 
             style={{ transition: 'width 0.3s ease' }}>

          {/* ── COPY TASKS CARD ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', background: '#FFFFFF', borderRadius: 12,
            border: '1px solid #EBEBEB',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Today&apos;s Tasks</div>
                <div style={{ fontSize: 11, color: '#A1A1AA' }}>{(session.populatedItems || []).length} items across {totalCount} blocks</div>
              </div>
            </div>
            <button
              onClick={handleCopyTasks}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: copied ? '1px solid #111' : '1px solid #EBEBEB',
                background: copied ? '#111' : '#FFF',
                color: copied ? '#FFF' : '#111',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {copied ? '✓ Copied!' : '⎘ Copy All'}
            </button>
          </div>
          {uiBlocks.questions && uiBlocks.questions.items.length > 0 && (
            <BlockCard
              type="questions"
              data={uiBlocks.questions}
              onUpdate={(up) => {
                  if (up.syncQuestion) {
                      handleUpdateItem(up.syncQuestion.id, up.syncQuestion.status === 'Correct' ? 'done' : 'struggled');
                  }
              }}
              onOpenChat={() => handleOpenChat('QUESTIONS_SM2')}
            />
          )}

          {['spine', 'project', 'softSkill', 'payableSkill', 'survival'].map(key => {
              const block = uiBlocks[key];
              if (!block) return null;
              return (
                <BlockCard
                  key={key}
                  type={key}
                  data={block}
                  onUpdate={(up) => {
                      const res = up.status === 'Done' ? 'done' : (up.status === 'Skipped' ? 'skipped' : 'struggled');
                      handleUpdateItem(block._id, res);
                  }}
                  onOpenChat={() => handleOpenChat(key.toUpperCase())}
                />
              );
          })}

          {session.status !== 'completed' && (
            <SessionClose onCloseSession={handleCloseSession} />
          )}

          {session.status === 'completed' && (
            <div className="session-closed">
              <div style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 8 }}>Session Complete</div>
              <div style={{ fontSize: 16, color: '#111111', fontWeight: 500 }}>
                Day {session.dayNumber} is closed. Score: {session.score}
              </div>
              {session.tomorrowFocus && (
                  <div style={{ marginTop: 12, fontSize: 14, color: '#4B5563' }}>
                      Tomorrow&apos;s Focus: {session.tomorrowFocus.nextTopic || 'Keep pushing!'}
                  </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className={`right-panel hide-scrollbar ${!rightPanelOpen ? 'right-panel--collapsed' : ''}`}>
          {rightPanelOpen && (
            <>
              <button className="right-panel-toggle" onClick={() => setRightPanelOpen(false)}>›</button>

              <div style={{ display: 'flex', borderBottom: '1px solid #EBEBEB', padding: '16px 24px 0 24px' }}>
                <button onClick={() => setRightTab('ACTIVITY')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: rightTab === 'ACTIVITY' ? '#111111' : '#A1A1AA', borderBottom: rightTab === 'ACTIVITY' ? '2px solid #111111' : '2px solid transparent' }}>Logging</button>
                <button onClick={() => setRightTab('ASSISTANT')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: rightTab === 'ASSISTANT' ? '#111111' : '#A1A1AA', borderBottom: rightTab === 'ASSISTANT' ? '2px solid #111111' : '2px solid transparent' }}>AI</button>
              </div>

              {rightTab === 'ASSISTANT' ? (
                <ChatPanel isOpen={true} onClose={() => setRightTab('ACTIVITY')} contextType={activeContext} onDrift={() => {}} onCapture={() => {}} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 0', background: '#FAFAFA' }}>
                    <div style={{ margin: '0 24px 24px 24px', padding: 20, background: '#FFFFFF', borderRadius: 12, border: '1px solid #EBEBEB' }}>
                        <div style={{ fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', marginBottom: 8 }}>Session Health</div>
                        <div style={{ fontSize: 32, fontWeight: 300, color: '#111111' }}>{session.score || '0'}</div>
                    </div>

                    <div style={{ flex: 1, padding: '0 24px' }}>
                        {session.gapAlert && (
                            <div style={{ padding: 12, background: session.gapAlert.severity === 'critical' ? '#FEF2F2' : '#FFFBEB', borderRadius: 8, border: '1px solid currentColor', color: session.gapAlert.severity === 'critical' ? '#991B1B' : '#92400E', fontSize: 13 }}>
                                ⚠ {session.gapAlert.days} days since last session. Drift detected.
                            </div>
                        )}
                        {/* Carry Forward Display could go here */}
                    </div>

                    <div style={{ padding: '16px 24px' }}>
                        <CaptureBar sessionDay={session.dayNumber} activeTopics={richTopics} />
                    </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
