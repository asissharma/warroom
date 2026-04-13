'use client';

import React, { useState } from 'react';
import TechSpineTab from './components/syllabus/TechSpineTab';
import QuestionsTab from './components/syllabus/QuestionsTab';
import ProjectsTab from './components/syllabus/ProjectsTab';
import SkillsTab from './components/syllabus/SkillsTab';
import GapTrackerTab from './components/syllabus/GapTrackerTab';
import DetailPanel from './components/syllabus/DetailPanel';

type TabType = 'ALL' | 'SPINE' | 'QUESTIONS' | 'PROJECTS' | 'SKILLS' | 'GAPS';

export default function SyllabusPitt() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [stats, setStats] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  React.useEffect(() => {
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

  const tabs: { id: TabType; label: string }[] = [
    { id: 'ALL', label: 'Overview' },
    { id: 'SPINE', label: 'Tech Spine' },
    { id: 'QUESTIONS', label: 'Questions' },
    { id: 'PROJECTS', label: 'Projects' },
    { id: 'SKILLS', label: 'Skills' },
    { id: 'GAPS', label: 'Survival' },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#FAFAFA] overflow-hidden relative tactical-grid">
      <div className="scanline" />
      
      {/* HEADER */}
      <div className="px-9 pt-10 pb-6 border-b border-[#EBEBEB] bg-white">
        <div className="flex justify-between items-end">
          <div>
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.15em] mb-1">SYLLABUS_PITT // CORE</div>
            <h1 className="text-[40px] serif text-[#111111] leading-none tracking-tight">Tactical Overview</h1>
          </div>
          
          <div className="flex gap-8 mb-1">
            <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-[0.1em] mb-1">Open Gaps</div>
                <div className="text-[24px] font-bold text-rose-500 tracking-tighter">
                  {stats ? stats.openGaps.toString().padStart(2, '0') : '--'}
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-[#A1A1AA] tracking-[0.1em] mb-1">Coverage</div>
                <div className="text-[24px] font-bold text-[#111111] tracking-tighter">
                  {stats ? `${Math.round((stats.spine / 150) * 100)}%` : '--'}
                </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-8 mt-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                pb-4 text-[13px] font-medium transition-all relative
                ${activeTab === tab.id ? 'text-[#111111]' : 'text-[#A1A1AA] hover:text-[#71717A]'}
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#111111]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-9">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'ALL' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Tech Spine" stat={`${stats?.spine || 0} Topics`} sub="Tracked Progress" color="spine" />
                <SummaryCard title="Questions" stat={`${stats?.questions || 0} Qs`} sub="Spaced Repetition" color="questions" />
                <SummaryCard title="Projects" stat={`${stats?.projects || 0} Items`} sub="Active Build Order" color="project" />
              </div>
              
              <div className="p-8 border border-[#EBEBEB] rounded-2xl bg-white shadow-sm">
                 <div className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.15em] mb-6">Global_Intelligence_Pulse</div>
                 <div className="h-32 flex items-center justify-center border-2 border-dashed border-[#EBEBEB] rounded-xl">
                    <span className="text-[13px] text-[#A1A1AA] font-mono italic">Analysis_Engine_Ready_For_Input...</span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'SPINE' && <TechSpineTab onSelectItem={setSelectedItem} />}
          {activeTab === 'QUESTIONS' && <QuestionsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'PROJECTS' && <ProjectsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'SKILLS' && <SkillsTab onSelectItem={setSelectedItem} />}
          {activeTab === 'GAPS' && <GapTrackerTab onSelectItem={setSelectedItem} />}
        </div>
      </div>

      {/* DETAIL OVERLAY */}
      {selectedItem && (
          <DetailPanel 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
      )}
    </div>
  );
}

function SummaryCard({ title, stat, sub, color }: { title: string, stat: string, sub: string, color: string }) {
    const colorMap: any = {
        spine: 'bg-[#E0F2FE] text-[#0369A1]',
        questions: 'bg-[#FFF1F2] text-[#BE123C]',
        project: 'bg-[#FAF5FF] text-[#7E22CE]',
        soft: 'bg-[#F0FDF4] text-[#166534]',
        payable: 'bg-[#FFF7ED] text-[#9A3412]',
        survival: 'bg-[#FFFBEB] text-[#92400E]',
    };

    return (
        <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300">
            <div className={`w-fit px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider mb-4 ${colorMap[color]}`}>
                {title}
            </div>
            <div className="text-[28px] font-bold text-[#111111] tracking-tight mb-1">{stat}</div>
            <div className="text-[13px] text-[#71717A] tracking-tight">{sub}</div>
        </div>
    );
}
