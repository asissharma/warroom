// ── FILE: app/dashboard/page.tsx ──
'use client';
import { useDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/dashboard/StatCard';
import Heatmap from '@/components/dashboard/Heatmap';
import PhaseArcs from '@/components/dashboard/PhaseArcs';
import SkillBars from '@/components/dashboard/SkillBars';
import VelocityWidget from '@/components/dashboard/VelocityWidget';
import { Trophy, Clock, Zap, AlertTriangle } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <div className="font-mono text-[9px] tracking-[3px] text-muted2 uppercase mb-3">{title}</div>
            {children}
        </div>
    );
}

function Skeleton() {
    return (
        <div className="max-w-[760px] mx-auto px-4 pb-8 pt-6 animate-pulse space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(i => <div key={i} className="h-24 bg-surface2 rounded-lg" />)}
            </div>
            <div className="h-40 bg-surface2 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-20 bg-surface2 rounded-lg" />)}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { data, loading, error } = useDashboard();

    if (loading) return <Skeleton />;
    if (error) return (
        <div className="max-w-[760px] mx-auto px-4 pt-10 text-center">
            <div className="font-mono text-danger text-[12px]">API ERROR: {error}</div>
        </div>
    );
    if (!data) return null;

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

    return (
        <div className="max-w-[760px] mx-auto px-4 pb-8 pt-6 content-z">
            <div className="font-bebas text-[36px] tracking-wide mb-6">DASHBOARD</div>

            {/* Section 1: Vital Stats */}
            <Section title="Vital Stats">
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                    <StatCard label="STREAK" value={data.currentStreak} color="accent" subtitle="days" />
                    <StatCard label="COMPLETED" value={data.totalDaysCompleted} color="success" subtitle="of 180 days" />
                    <StatCard label="TASKS" value={data.totalTasksDone} color="acid" subtitle="total done" />
                    <StatCard label="CARRIED" value={data.carryForwardCount} color="warning" subtitle="tasks pending" />
                </div>
            </Section>

            {/* Section 2: Heatmap */}
            <Section title="180-Day Activity Grid">
                <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-4">
                    <Heatmap cells={data.completionHeatmap} />
                </div>
            </Section>

            {/* Section 3: Phase Progress */}
            <Section title="Phase Progress">
                <PhaseArcs phases={data.phaseProgress} />
            </Section>

            {/* Section 4: Skill Bars */}
            <Section title="Skill Levels">
                <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-5">
                    <SkillBars />
                </div>
            </Section>

            {/* Section 5: Velocity */}
            <Section title="Task Velocity — Last 7 Days">
                <div className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-5">
                    <VelocityWidget dailyData={last7} avgTasksPerDay={data.avgTasksPerDay} />
                </div>
            </Section>

            {/* Section 6: Recent Logs */}
            <Section title="Recent Logs">
                <div className="space-y-2">
                    {data.recentLogs.slice(0, 5).map((log, i) => {
                        const borderColor: Record<string, string> = {
                            win: '#00e5a0', skip: '#3d3d55', key: '#7c5cfc', block: '#ff3b4e'
                        };
                        return (
                            <div
                                key={i}
                                className="bg-surface border border-[rgba(255,255,255,0.055)] rounded-lg p-3 flex gap-3"
                                style={{ borderLeftWidth: '3px', borderLeftColor: borderColor[log.type] ?? '#3d3d55' }}
                            >
                                <span className="text-[18px] shrink-0">{recentLogTypeIcon[log.type] ?? '📝'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-body text-[13px] text-text truncate">{log.text}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-[9px] uppercase text-muted2 bg-surface2 px-1.5 py-0.5 rounded">
                                            {log.type}
                                        </span>
                                        <span className="font-mono text-[9px] text-muted2">Day {log.dayN}</span>
                                        <span className="font-mono text-[9px] text-muted2">{timeAgo(log.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {data.recentLogs.length === 0 && (
                        <div className="font-mono text-[11px] text-muted2 text-center py-6">No logs yet</div>
                    )}
                </div>
            </Section>
        </div>
    );
}
