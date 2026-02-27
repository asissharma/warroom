// ── FILE: app/config/page.tsx ──
'use client';
import { useUser } from '@/hooks/useUser';
import { useDashboard } from '@/hooks/useDashboard';
import MissionClock from '@/components/config/MissionClock';
import LoadPanel from '@/components/config/LoadPanel';
import ProgressSnapshot from '@/components/config/ProgressSnapshot';
import DangerZone from '@/components/config/DangerZone';

function Skeleton() {
    return (
        <div className="max-w-[700px] mx-auto px-4 pb-24 pt-6 animate-pulse space-y-4">
            <div className="h-12 w-48 bg-surface2 rounded mb-6" />
            <div className="h-64 bg-surface2 rounded-lg" />
            <div className="h-40 bg-surface2 rounded-lg" />
            <div className="h-48 bg-surface2 rounded-lg" />
            <div className="h-64 border border-danger/40 rounded-lg" />
        </div>
    );
}

export default function ConfigPage() {
    const { user, loading: userLoading, error: userError, updateUser } = useUser();
    const { data: dashboardData, loading: dashLoading } = useDashboard();

    if (userLoading || dashLoading) return <Skeleton />;
    if (userError) return (
        <div className="max-w-[700px] mx-auto px-4 pt-10 text-center">
            <div className="font-mono text-danger text-[12px]">API ERROR: {userError}</div>
        </div>
    );
    if (!user || !dashboardData) return null;

    const stats = [
        { label: 'Total Tasks', value: dashboardData.totalTasksDone, color: 'acid' },
        { label: 'Days Completed', value: dashboardData.totalDaysCompleted, color: 'success' },
        { label: 'Longest Streak', value: dashboardData.longestStreak, color: 'accent' },
    ];

    const handleClearCarry = async () => {
        const res = await fetch('/api/carryforward', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to clear carry-forwards');
        // Let SWR/refresh handle the UI update or force a reload
        window.location.reload();
    };

    const handleReset = async () => {
        const res = await fetch('/api/user/reset', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to reset progress');
    };

    return (
        <div className="max-w-[700px] mx-auto px-4 pb-16 pt-6 content-z">
            <div className="mb-6">
                <div className="font-bebas text-[36px] tracking-wide" style={{ background: 'linear-gradient(90deg, #7c5cfc, #c8ff00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    INTEL·OS CONFIG
                </div>
                <div className="font-mono text-[11px] text-muted2 mt-1">Adjust only with intention.</div>
            </div>

            <MissionClock user={user as any} onUpdate={updateUser as any} />
            <LoadPanel questionsPerDay={user.preferences.questionsPerDay} onUpdate={(qpd) => updateUser({ preferences: { ...user.preferences, questionsPerDay: qpd } } as any)} />
            <ProgressSnapshot stats={stats} />
            <DangerZone carryForwardCount={dashboardData.carryForwardCount} onClearCarry={handleClearCarry} onReset={handleReset} />
        </div>
    );
}
