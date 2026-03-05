'use client';

import { useUser } from '@/hooks/useUser';
import MissionClock from '@/components/config/MissionClock';
import LoadPanel from '@/components/config/LoadPanel';
import DangerZone from '@/components/config/DangerZone';
import { Settings, Loader2 } from 'lucide-react'

export default function ConfigPage() {
    const { user, loading: userLoading, error: userError, updateUser } = useUser();

    if (userLoading) return (
        <div className="flex items-center justify-center min-h-[100dvh]">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    )
    if (userError) return <div className="p-10 text-center text-red-500">Error: {userError}</div>;
    if (!user) return null;

    const handleClearCarry = async () => {
        const res = await fetch('/api/carryforward', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to clear carry-forwards');
        window.location.reload();
    };

    const handleReset = async () => {
        const res = await fetch('/api/user/reset', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to reset progress');
        window.location.reload();
    };

    return (
        <div className="content-z pb-32 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 min-h-[100dvh]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderLo">
                <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center border border-borderLo">
                    <Settings className="w-5 h-5 text-muted2" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-text">SYSTEM CONFIG</h1>
                    <p className="text-xs text-muted font-mono tracking-wider uppercase">User ID: default</p>
                </div>
            </div>

            <div className="space-y-6">
                <MissionClock user={user as any} onUpdate={updateUser as any} />
                <LoadPanel questionsPerDay={user.preferences.questionsPerDay} onUpdate={(qpd) => updateUser({ preferences: { ...user.preferences, questionsPerDay: qpd } } as any)} />
                <DangerZone carryForwardCount={0} onClearCarry={handleClearCarry} onReset={handleReset} />
            </div>
        </div>
    );
}
