'use client';

import React, { useEffect, useState } from 'react';
import CarryForwardBanner from './components/daily/CarryForwardBanner';
import BlockCard from './components/daily/BlockCard';
import ChatPanel from './components/daily/ChatPanel';
import SessionClose from './components/daily/SessionClose';

export default function DailyScreen() {
  const [session, setSession] = useState<any>(null);
  const [carryForward, setCarryForward] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('');
  const [driftCount, setDriftCount] = useState(0);

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
    // Optimistic update locally
    setSession((prev: any) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [blockType]: { ...prev.blocks[blockType], ...updateData }
      }
    }));

    // Save to DB
    try {
      await fetch('/api/daily/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session._id, blockType, updateData })
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
        body: JSON.stringify({ sessionId: session._id, honestNote: note, driftEventsCount: driftCount })
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to close session:', e);
      return { success: false, error: 'Network failure' };
    }
  };

  const openChatFor = (context: string) => {
    setActiveContext(context);
    setChatOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-zinc-500 font-mono italic animate-pulse">Initializing Session Engine...</div>;
  }

  if (!session) {
    return <div className="p-8 text-red-500 font-mono">Failed to load session. Database offline?</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 relative selection:bg-slate-200 selection:text-slate-900">
      <header className="mb-20 mt-12 flex flex-col md:flex-row items-baseline justify-between font-mono tracking-[0.2em] border-b border-slate-100 pb-8">
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full border border-blue-200 animate-pulse"></span>
            WAR_CORE // ACTIVE
          </div>
          <h1 className="text-2xl font-light text-slate-800 uppercase tracking-[0.4em]">DIRECTIVE_{session.dayNumber}</h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-8 text-[10px] text-slate-400 uppercase tracking-widest">
          <div className="flex flex-col">
             <span className="text-slate-300 mb-1">PHASE</span>
             <span className="text-slate-600 font-bold">{session.phase}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-slate-300 mb-1">LATENCY</span>
             <span className="text-slate-600 font-bold">4.2ms</span>
          </div>
          <div className="flex flex-col">
             <span className="text-slate-300 mb-1">MOMENTUM</span>
             <span className="text-emerald-500 font-bold">STABLE</span>
          </div>
        </div>
      </header>

      <CarryForwardBanner items={carryForward} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative mt-10 pb-10">
        {session.blocks.spine && (
          <div className="col-span-12 md:col-span-7 animate-fly-in stagger-1 z-10">
            <div className="animate-float h-full transition-transform hover:scale-[1.02] duration-500">
              <BlockCard 
                type="spine" 
                data={session.blocks.spine} 
                onUpdate={(data) => handleUpdateBlock('spine', data)} 
                onOpenChat={() => openChatFor('TECH_SPINE')}
              />
            </div>
          </div>
        )}
        
        {session.blocks.survival && (
           <div className="col-span-12 md:col-span-5 animate-fly-in stagger-2 z-20">
            <div className="animate-float-delayed h-full transition-transform hover:scale-[1.02] duration-500">
              <BlockCard 
                type="survival" 
                data={session.blocks.survival} 
                onUpdate={(data) => handleUpdateBlock('survival', data)} 
                onOpenChat={() => openChatFor('SURVIVAL_MODE')}
              />
            </div>
          </div>
        )}

        {session.blocks.softSkill && (
          <div className="col-span-12 md:col-span-4 animate-fly-in stagger-3 z-10">
            <div className="animate-float-fast h-full transition-transform hover:scale-[1.02] duration-500">
              <BlockCard 
                type="softSkill" 
                data={session.blocks.softSkill} 
                onUpdate={(data) => handleUpdateBlock('softSkill', data)} 
                onOpenChat={() => openChatFor('SOFT_SKILL')}
              />
            </div>
          </div>
        )}
        
        {session.blocks.payableSkill && (
          <div className="col-span-12 md:col-span-8 animate-fly-in stagger-4 z-10">
            <div className="animate-float h-full transition-transform hover:scale-[1.02] duration-500">
              <BlockCard 
                type="payableSkill" 
                data={session.blocks.payableSkill} 
                onUpdate={(data) => handleUpdateBlock('payableSkill', data)} 
                onOpenChat={() => openChatFor('PAYABLE_SKILL')}
              />
            </div>
          </div>
        )}
        
        {session.blocks.project && (
          <div className="col-span-12 md:col-span-12 animate-fly-in stagger-5 z-30 mb-8">
            <div className="animate-float-delayed h-full transition-transform hover:scale-[1.01] duration-500">
              <BlockCard 
                type="project" 
                data={session.blocks.project} 
                onUpdate={(data) => handleUpdateBlock('project', data)} 
                onOpenChat={() => openChatFor('PROJECT_BUILD')}
              />
            </div>
          </div>
        )}

        {session.blocks.questions && (
          <div className="col-span-12 md:col-span-12 animate-fly-in stagger-6 relative z-10">
            <div className="animate-float-fast h-full transition-transform hover:scale-[1.01] duration-500">
              <BlockCard 
                type="questions" 
                data={session.blocks.questions} 
                onUpdate={(data) => handleUpdateBlock('questions', data)} 
                onOpenChat={() => openChatFor('QUESTIONS_SM2')}
              />
            </div>
          </div>
        )}
      </div>

      {!session.isClosed && (
          <SessionClose onCloseSession={handleCloseSession} />
      )}

      {session.isClosed && (
        <div className="mt-12 py-8 border-t border-slate-200 text-center font-mono">
            <h2 className="text-xs text-slate-500 uppercase tracking-[0.3em] mb-2">SESSION COMPILED</h2>
            <p className="text-slate-400 text-[10px] tracking-widest">MOMENTUM LOGGED. OFFLINE.</p>
        </div>
      )}

      <ChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        contextType={activeContext}
        onDrift={() => setDriftCount(prev => prev + 1)}
        onCapture={(type, content) => {
          console.log('Captured', type, content);
          // Future: Save to captures DB
        }}
      />
    </div>
  );
}
