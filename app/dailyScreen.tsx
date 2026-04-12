'use client';

import React, { useEffect, useState, useRef } from 'react';
import BlockCard from './components/daily/BlockCard';
import ChatPanel from './components/daily/ChatPanel';
import SessionClose from './components/daily/SessionClose';
import CaptureBar from './components/daily/CaptureBar';

export default function DailyScreen() {
  const [session, setSession] = useState<any>(null);
  const [carryForward, setCarryForward] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

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
    const { syncQuestion, ...pureUpdateData } = updateData;

    setSession((prev: any) => {
        const next = { ...prev };
        const block = { ...next.blocks[blockType] };

        if (syncQuestion) {
            const items = [...block.items];
            const idx = items.findIndex(q => q.id === syncQuestion.id);
            if (idx !== -1 && items[idx].status === 'Pending') {
                items[idx].status = syncQuestion.status;
                if (syncQuestion.status === 'Correct') block.correct++;
                else if (syncQuestion.status === 'Struggled') block.struggled++;
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
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] animate-pulse">
            Booting_Neural_OS...
        </div>
      </div>
    );
  }

  if (!session) {
    return <div className="h-screen w-full flex items-center justify-center font-mono text-rose-500 bg-[#FAFAFA]">DIRECTIVE_STALLED // DATABASE_OFFLINE</div>;
  }

  const activeTopics = Object.entries(session.blocks)
    .filter(([k, v]: any) => v && k !== 'questions')
    .map(([k, v]: any) => ({
        id: k,
        name: v.topicToday || v.projectName || v.skillName || v.topicName || k,
        type: k
    }));

  return (
    <div className="min-h-screen w-full tactical-grid p-6 relative overflow-x-hidden">
      
      {/* SCANLINE EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
        <div className="scanline"></div>
      </div>

      {/* TOP HEADER MODULES */}
      <div className="grid grid-cols-12 gap-5 mb-5 overflow-visible">
        <div className="col-span-12 md:col-span-3 glass-card p-6 flex flex-col justify-center border-orange-500/20">
            <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-[0.2em] mb-1">Neural_Phase</div>
            <div className="text-[28px] font-bold text-[#111111] tracking-tighter">{session.phase}</div>
        </div>
        
        <div className="col-span-12 md:col-span-6 glass-card p-6 flex flex-col justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-[0.4em] mb-1">Current_Directive</div>
            <h1 className="text-[32px] serif text-[#111111] leading-tight tracking-tight">
                DIRECTIVE_{session.dayNumber}
            </h1>
        </div>

        <div className="col-span-12 md:col-span-3 glass-card p-6 flex flex-col justify-center border-green-500/20">
            <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-[0.2em] mb-1">Momentum_Yield</div>
            <div className="flex items-end gap-3">
                <div className="text-[28px] font-bold text-[#111111] tracking-tighter">{session.momentumScore?.toFixed(1) || '0.0'}</div>
                <div className="text-[10px] font-mono text-green-500 mb-2">▲ LVL_STATIC</div>
            </div>
        </div>
      </div>

      {/* MASONRY NEURAL GRID */}
      <div className="grid grid-cols-12 gap-5 auto-rows-auto">
        
        {/* QUESTIONS: MAIN HUB (SPAN 8) */}
        <div className="col-span-12 lg:col-span-8 row-span-2">
            <div className="glass-card h-full flex flex-col p-2 border-rose-500/10">
                <div className="px-10 pt-8">
                    <div className="font-mono text-[10px] text-rose-500 uppercase tracking-[0.3em] mb-1">Tactical_Retrieval</div>
                    <div className="text-[11px] text-[#A1A1AA]">Memory consolidation logic active.</div>
                </div>
                <BlockCard 
                    type="questions" 
                    data={session.blocks.questions} 
                    onUpdate={(up) => handleUpdateBlock('questions', up)} 
                    onOpenChat={() => {setActiveContext('QUESTIONS_SM2'); setChatOpen(true);}}
                    isMorphic
                />
            </div>
        </div>

        {/* TECH SPINE (SPAN 4) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <BlockCard 
                type="spine" 
                data={session.blocks.spine} 
                onUpdate={(up) => handleUpdateBlock('spine', up)} 
                onOpenChat={() => {setActiveContext('TECH_SPINE'); setChatOpen(true);}}
                isMorphic
            />
        </div>

        {/* PROJECT (SPAN 4) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <BlockCard 
                type="project" 
                data={session.blocks.project} 
                onUpdate={(up) => handleUpdateBlock('project', up)} 
                onOpenChat={() => {setActiveContext('PROJECT'); setChatOpen(true);}}
                isMorphic
            />
        </div>

        {/* SKILLS STACK (SPAN 4) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="flex flex-col gap-5 h-full">
                <BlockCard 
                    type="softSkill" 
                    data={session.blocks.softSkill} 
                    onUpdate={(up) => handleUpdateBlock('softSkill', up)} 
                    onOpenChat={() => {setActiveContext('SOFT_SKILLS'); setChatOpen(true);}}
                    isMorphic
                />
                <BlockCard 
                    type="payableSkill" 
                    data={session.blocks.payableSkill} 
                    onUpdate={(up) => handleUpdateBlock('payableSkill', up)} 
                    onOpenChat={() => {setActiveContext('PAYABLE_SKILLS'); setChatOpen(true);}}
                    isMorphic
                />
            </div>
        </div>

        {/* SURVIVAL / GAP MODULE (SPAN 4) */}
        <div className="col-span-12 lg:col-span-4">
            <BlockCard 
                type="survival" 
                data={session.blocks.survival} 
                onUpdate={(up) => handleUpdateBlock('survival', up)} 
                onOpenChat={() => {setActiveContext('SURVIVAL'); setChatOpen(true);}}
                isMorphic
            />
        </div>

        {/* NEURAL LOG (INTEL FEED) (SPAN 4) */}
        <div className="col-span-12 lg:col-span-4 row-span-1 min-h-[400px]">
            <div className="glass-card h-full p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#A1A1AA]">LOG_v4.2</div>
                <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-[0.2em] mb-6">Neural_Log // Intel</div>
                
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
                    {carryForward.length > 0 ? carryForward.map((item, i) => (
                        <div key={i} className="flex flex-col p-4 bg-black/5 rounded-xl border border-black/5 group-hover:bg-white transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{item.name}</span>
                                <span className="text-[9px] font-mono text-[#A1A1AA]">ROLLOVER</span>
                            </div>
                            <div className="text-[13px] text-[#71717A] leading-relaxed">Yesterday's intent persisted into current session substrate.</div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <div className="w-8 h-[1px] bg-[#111111] mb-2"></div>
                            <span className="text-[11px] font-mono">NOMINAL</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-black/5">
                    <CaptureBar 
                        sessionDay={session.dayNumber} 
                        activeTopics={activeTopics}
                        isHudMode={true}
                        onSuccess={(msg) => {
                            setAiFeedback(msg);
                            setTimeout(() => setAiFeedback(null), 5000);
                        }}
                    />
                </div>
            </div>
        </div>

        {/* SESSION CLOSE (SPAN 8) */}
        <div className="col-span-12 lg:col-span-8">
            <div className="glass-card overflow-hidden">
                {!session.isClosed && <SessionClose onCloseSession={handleCloseSession} />}
                {session.isClosed && (
                    <div className="p-16 text-center bg-white/50 backdrop-blur-md">
                        <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.3em] mb-3">Neural_Protocol_Complete</div>
                        <div className="text-[#111111] font-medium tracking-tight">Offline. No further intent captured for Day {session.dayNumber}.</div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* GLOBAL HUD FEEDBACK */}
      {aiFeedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-hud-fade">
            <div className="bg-[#111111] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 inner-glow">
                <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_10px_#22C55E]"></div>
                <span className="text-[11px] font-mono uppercase tracking-widest">{aiFeedback}</span>
            </div>
        </div>
      )}

      <ChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        contextType={activeContext}
        onDrift={() => {}}
        onCapture={() => {}}
      />
    </div>
  );
}
