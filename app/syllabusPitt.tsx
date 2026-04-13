'use client';

import React, { useState, useEffect } from 'react';
import TechSpineTab from '@/app/components/syllabus/TechSpineTab';
import QuestionsTab from '@/app/components/syllabus/QuestionsTab';
import ProjectsTab from '@/app/components/syllabus/ProjectsTab';
import SoftSkillsTab from '@/app/components/syllabus/SoftSkillsTab';
import PayableSkillsTab from '@/app/components/syllabus/PayableSkillsTab';
import SurvivalTab from '@/app/components/syllabus/SurvivalTab';
import DetailPane from '@/app/components/syllabus/DetailPane';

type TabType = 'ALL' | 'SPINE' | 'QUESTIONS' | 'PROJECTS' | 'SOFT_SKILLS' | 'PAYABLE_SKILLS' | 'SURVIVAL';

export default function SyllabusPitt() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [stats, setStats] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/syllabus');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error('Failed to fetch syllabus stats', e);
      }
    }
    fetchStats();
  }, []);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'ALL', label: 'Dashboard', icon: '◰' },
    { id: 'SPINE', label: 'Tech Spine', icon: '☰' },
    { id: 'QUESTIONS', label: 'Protocols', icon: '?' },
    { id: 'PROJECTS', label: 'Builds', icon: '🏗' },
    { id: 'SOFT_SKILLS', label: 'Soft Skills', icon: '☯' },
    { id: 'PAYABLE_SKILLS', label: 'Payable Assets', icon: '🧩' },
    { id: 'SURVIVAL', label: 'Survival areas', icon: '⚠' },
  ];

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden relative font-sans text-[#111111]">
      <div className="scanline opacity-[0.03]" />
      
      {/* LEFT NAVIGATION SIDEBAR (Secondary) */}
      <div className="w-[240px] border-right border-[#EBEBEB] flex flex-col pt-12 bg-[#FAFAFA]/50 backdrop-blur-sm z-10">
        <div className="px-8 mb-10">
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] mb-1">SYLLABUS_Pitt</div>
            <h1 className="text-xl serif font-bold tracking-tight">Command Center</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-[13px] rounded-xl transition-all
                ${activeTab === tab.id 
                  ? 'bg-white text-[#111111] shadow-sm border border-[#EBEBEB] font-bold' 
                  : 'text-[#71717A] hover:bg-white/50 hover:text-[#111111]'}
              `}
            >
              <span className="opacity-50 font-mono text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-[#EBEBEB]">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest">Global Priority</span>
                <span className="text-[10px] font-mono text-rose-500 font-bold px-1.5 py-0.5 bg-rose-50 rounded italic">CRITICAL</span>
            </div>
            <div className="h-1 w-full bg-[#EBEBEB] rounded-full overflow-hidden">
                <div className="h-full bg-black" style={{ width: '64%' }}></div>
            </div>
        </div>
      </div>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* HEADER BAR */}
        <header className="h-[72px] border-b border-[#EBEBEB] flex items-center justify-between px-10 shrink-0">
            <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-[#111111] animate-pulse" />
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#71717A]">
                    Systems_Operational // <span className="text-[#111111] font-bold">{activeTab}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="text-[9px] font-mono uppercase text-[#A1A1AA] mb-0.5">Coverage</div>
                    <div className="text-[14px] font-bold tracking-tight">
                        {stats ? `${Math.round((stats.spine / 150) * 100)}%` : '--'}
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-[#EBEBEB]" />
                <button className="px-4 py-2 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#333333] transition-all">
                    Sync_Manifest
                </button>
            </div>
        </header>

        {/* DUAL PANE CONTENT */}
        <main className="flex-1 flex overflow-hidden">
          {/* LIST PANE (Pane A) */}
          <div className={`flex-1 overflow-y-auto hide-scrollbar p-10 bg-white transition-all duration-500 ${selectedItem ? 'max-w-[65%]' : 'max-w-full'}`}>
            <div className="max-w-5xl mx-auto">
              {activeTab === 'ALL' && <BentoOverview stats={stats} />}
              {activeTab === 'SPINE' && <TechSpineTab onSelectItem={setSelectedItem} />}
              {activeTab === 'QUESTIONS' && <QuestionsTab onSelectItem={setSelectedItem} />}
              {activeTab === 'PROJECTS' && <ProjectsTab onSelectItem={setSelectedItem} />}
              {activeTab === 'SOFT_SKILLS' && <SoftSkillsTab onSelectItem={setSelectedItem} />}
              {activeTab === 'PAYABLE_SKILLS' && <PayableSkillsTab onSelectItem={setSelectedItem} />}
              {activeTab === 'SURVIVAL' && <SurvivalTab onSelectItem={setSelectedItem} />}
            </div>
          </div>

          {/* INTELLIGENCE CONTEXT PANE (Pane B) */}
          {selectedItem && (
            <div className="w-[35%] border-left border-[#EBEBEB] bg-[#FAFAFA] flex flex-col animate-in slide-in-from-right duration-300">
               <DetailPane 
                 item={selectedItem} 
                 onClose={() => setSelectedItem(null)} 
               />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BentoOverview({ stats }: { stats: any }) {
    return (
        <div className="space-y-10">
            <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2 p-8 border border-[#EBEBEB] rounded-[32px] bg-white hover:border-[#111111] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0F2FE]/30 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-6 underline decoration-[#0369A1]/30">Curriculum_Progress</div>
                    <div className="text-6xl font-black italic tracking-tighter mb-4">
                        {stats ? Math.round((stats.spine / 150) * 100) : '--'}%
                    </div>
                    <p className="text-[13px] text-[#71717A] max-w-[200px]">Total technical nodes successfully assimilated into long-term memory.</p>
                </div>
                
                <div className="p-8 border border-[#EBEBEB] rounded-[32px] bg-white hover:shadow-xl transition-all">
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl mb-6">⚠</div>
                    <div className="text-4xl font-bold mb-1 tracking-tight">{stats?.openGaps || '0'}</div>
                    <div className="text-[12px] font-mono text-[#A1A1AA] uppercase">Open_Gaps</div>
                </div>

                <div className="p-8 border border-[#EBEBEB] rounded-[32px] bg-white hover:shadow-xl transition-all">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-6">?</div>
                    <div className="text-4xl font-bold mb-1 tracking-tight">{stats?.questions || '0'}</div>
                    <div className="text-[12px] font-mono text-[#A1A1AA] uppercase">Protocol_Qs</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 p-8 border border-[#EBEBEB] rounded-[32px] bg-white hover:shadow-md transition-all">
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-4">Soft_Skills</div>
                    <div className="text-3xl font-bold mb-2">35</div>
                    <div className="text-[11px] text-[#71717A]">Active Heuristics</div>
                </div>
                <div className="col-span-1 p-8 border border-[#EBEBEB] rounded-[32px] bg-white hover:shadow-md transition-all">
                    <div className="text-[9px] font-mono text-[#A1A1AA] uppercase mb-4">Payable_Assets</div>
                    <div className="text-3xl font-bold mb-2">12</div>
                    <div className="text-[11px] text-[#71717A]">Marketable Nodes</div>
                </div>
                <div className="p-8 border-2 border-dashed border-[#EBEBEB] rounded-[32px] flex flex-col items-center justify-center text-center hover:bg-[#FAFAFA] transition-all cursor-pointer">
                    <button className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center text-2xl mb-4">+</button>
                    <h3 className="font-bold text-[14px]">Update</h3>
                </div>
            </div>
        </div>
    );
}
