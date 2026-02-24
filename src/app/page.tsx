'use client';
import { useState, useEffect } from 'react';
import { useLearningOS } from '@/hooks/useLearningOS';
import BottomNav from '@/components/BottomNav';
import DashboardView from '@/components/views/DashboardView';
import VaultView from '@/components/views/VaultView';
import AnalyticsView from '@/components/views/AnalyticsView';
import ConfigView from '@/components/views/ConfigView';

export default function MobileEngineDashboard() {
    const { state, isLoaded, pullMoreWork, toggleTask, updateStartDate, nukeState } = useLearningOS();
    const [activeTab, setActiveTab] = useState('dash');
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated || !isLoaded) {
        return <div className="flex h-screen w-screen items-center justify-center font-sys text-[var(--text-muted)]">Booting Sequence...</div>;
    }

    // Determine Day
    const start = new Date(state.start);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(Math.abs(today.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const currentDay = (today >= start) ? diffDays + 1 : 1;

    return (
        <div className="flex flex-col h-[100dvh] w-full relative bg-transparent">
            {/* Mobile Header */}
            <header className="p-4 flex justify-between items-center bg-[var(--surface-glass)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--glass-border)] shadow-[var(--glass-shadow)] z-20 sticky top-0">
                <div className="logo-block">
                    <h1 className="text-[1.3rem] tracking-[-0.5px] font-sys font-bold leading-tight">OS // PASTEL</h1>
                    <p className="font-mono text-[0.75rem] text-[var(--text-muted)] mt-0.5">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="bg-[var(--surface-alt)] text-[var(--accent-purple)] px-3 py-1.5 rounded-full text-[0.8rem] font-bold font-mono">
                    DAY {currentDay}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[90px] bg-transparent">
                {activeTab === 'dash' && (
                    <DashboardView
                        state={state}
                        onToggleTask={toggleTask}
                        onPullWork={pullMoreWork}
                    />
                )}
                {activeTab === 'vault' && <VaultView state={state} />}
                {activeTab === 'stats' && <AnalyticsView state={state} />}
                {activeTab === 'config' && (
                    <ConfigView
                        state={state}
                        onSaveStart={updateStartDate}
                        onNuke={nukeState}
                    />
                )}
            </main>

            {/* Bottom Nav */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}
