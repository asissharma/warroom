// ── FILE: hooks/useDashboard.ts ──
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '@/types';

interface UseDashboardReturn {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch('/api/dashboard', { signal: controller.signal })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((d: DashboardData) => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    setError(err.message ?? 'Failed to load dashboard');
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, [tick]);

    const refresh = useCallback(() => setTick(t => t + 1), []);

    return { data, loading, error, refresh };
}
