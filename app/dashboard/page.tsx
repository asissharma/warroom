// ── FILE: app/dashboard/page.tsx ──
'use client';
import { useDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/dashboard/StatCard';
import Heatmap from '@/components/dashboard/Heatmap';
import PhaseArcs from '@/components/dashboard/PhaseArcs';
import SkillBars from '@/components/dashboard/SkillBars';
import VelocityWidget from '@/components/dashboard/VelocityWidget';
import { Trophy, Clock, Zap, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getDayN } from '@/lib/dayEngine';

function Skeleton() {
    return (
        <div className="h-[100dvh] overflow-hidden flex flex-col p-4 gap-4 bg-bg">
            <div className="h-8 w-48 bg-surface2 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-surface rounded-lg animate-pulse" />)}
            </div>
            <div className="flex-1 flex gap-4 min-h-0">
                <div className="flex-[2] bg-surface rounded-lg animate-pulse" />
                <div className="flex-1 bg-surface rounded-lg animate-pulse" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { data, loading, error } = useDashboard();
    const startDate = useStore(s => s.startDate);

    if (loading) return <Skeleton />;
    if (error) return (
        <div className="max-w-[760px] mx-auto px-4 pt-10 text-center">
            <div className="font-mono text-danger text-[12px]">API ERROR: {error}</div>
        </div>
    );
    if (!data) return null;

    const currentDayN = startDate ? getDayN(new Date(startDate)) : 1;

    // Build last-7-days velocity data from heatmap
    const todayStr = new Date().toISOString().split('T')[0];
    const last7 = [...data.completionHeatmap]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7)
        .reverse()
        .map(c => ({ date: c.date, taskCount: c.taskCount, isToday: c.date === todayStr }));

    const recentLogTypeIcon: Record<string, string> = {
        win: '🏆', skip: '⏭', key: '💡', block: '🚧',
    };

    function timeAgo(iso: string): string {
        const diff = Date.now() - new Date(iso).getTime();
        const h = Math.round(diff / 3600000);
        if (h < 1) return 'just now';
        if (h < 24) return `${h}h ago`;
        return `${Math.round(h / 24)}d ago`;
    }

    // Build last-14-days for streak visualization
    const last14Dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d.toISOString().split('T')[0];
    });

    return (
        /* ── Cockpit Shell ── */
        <div className="h-[100dvh] overflow-hidden flex flex-col content-z">

            {/* ── TOP STATUS BAR ── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-surface/60 backdrop-blur-sm">
                <span className="font-bebas text-lg tracking-widest text-text">DASHBOARD</span>
            </div>

            {/* ── MAIN GRID ── */}
            <div className="flex-1 overflow-hidden flex flex-col gap-3 px-4 py-3 min-h-0 pb-32">

                {/* ROW 1: Vital Stats & Streak */}
                <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="STREAK" value={data.currentStreak} color="accent" subtitle="days" />
                    <StatCard label="COMPLETED" value={data.totalDaysCompleted} color="success" subtitle="of 180 days" />
                    <StatCard label="TASKS" value={data.totalTasksDone} color="acid" subtitle="total done" />
                    <StatCard label="CARRIED" value={data.carryForwardCount} color="warning" subtitle="tasks pending" />
                </div>

                {/* MIDDLE & BOTTOM PANELS */}
                <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0 overflow-y-auto lg:overflow-hidden scrollbar-thin lg:scrollbar-none">

                    {/* LEFT COL: Heatmap & Phase Progress */}
                    <div className="flex-[5] flex flex-col gap-3 min-h-0 shrink-0 lg:shrink">
                        {/* Heatmap Area */}
                        <div className="shrink-0 bg-surface border border-border shadow-sm rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                                <div className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase">180-Day Grid</div>
                                <div className="flex items-center gap-0.5">
                                    {last14Dates.slice(7).map((dateStr) => {
                                        const isToday = dateStr === todayStr;
                                        const isComplete = data.completionHeatmap.find((h: any) => h.date === dateStr)?.isComplete;
                                        return <div key={dateStr} className={`w-2 h-3 rounded-[1px] ${isComplete ? 'bg-success' : 'bg-surface2'} ${isToday ? 'border border-acid' : ''}`} />
                                    })}
                                </div>
                            </div>
                            <Heatmap cells={data.completionHeatmap} currentDayN={currentDayN} />
                        </div>

                        {/* Phase Progress */}
                        <div className="flex-1 bg-surface border border-border shadow-sm rounded-lg p-3 flex flex-col min-h-0 overflow-hidden">
                            <div className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-2 shrink-0">Phase Progress</div>
                            <PhaseArcs phases={data.phaseProgress} heatmap={data.completionHeatmap} />
                        </div>
                    </div>

                    {/* RIGHT COL: Skills, Velocity, Logs */}
                    <div className="flex-[4] flex flex-col gap-3 min-h-0 shrink-0 lg:shrink">

                        <div className="flex-[3] bg-surface border border-border shadow-sm rounded-lg p-3 flex flex-col min-h-0">
                            <div className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-2">Skill Levels</div>
                            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
                                <SkillBars />
                            </div>
                        </div>

                        <div className="shrink-0 bg-surface border border-border shadow-sm rounded-lg p-3">
                            <div className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-2">Task Velocity (7D)</div>
                            <VelocityWidget dailyData={last7} avgTasksPerDay={data.avgTasksPerDay} />
                        </div>

                        <div className="flex-[4] flex flex-col bg-surface border border-border shadow-sm rounded-lg p-3 min-h-0">
                            <div className="font-mono text-[9px] tracking-[2px] text-muted2 uppercase mb-2 shrink-0">Recent Logs</div>
                            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                                {data.recentLogs.map((log: any, i: number) => {
                                    const bc: Record<string, string> = { win: '#10b981', skip: '#9ca3af', key: '#6366f1', block: '#ef4444' };
                                    return (
                                        <div key={i} className="bg-surface2 rounded p-2 flex gap-2 border-l-[3px]" style={{ borderColor: bc[log.type] || '#9ca3af' }}>
                                            <div className="text-[14px] shrink-0 mt-0.5">{recentLogTypeIcon[log.type] || '📝'}</div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-text font-body text-[12px] leading-snug line-clamp-2">{log.text}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="font-mono text-[9px] text-muted2">D{log.dayN}</span>
                                                    <span className="font-mono text-[9px] text-muted2">{timeAgo(log.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
