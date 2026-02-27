// ── FILE: hooks/useDay.ts ──
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { DayPayload } from '@/lib/types';

interface UseDayReturn {
    data: DayPayload | null;
    loading: boolean;
    error: string | null;
    toggleTask: (taskId: string, completed: boolean, carryId?: string) => Promise<void>;
    markComplete: () => Promise<void>;
}

export function useDay(): UseDayReturn {
    const [data, setData] = useState<DayPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch('/api/day', { signal: controller.signal })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((d: DayPayload) => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    setError(err.message ?? 'Failed to load day data');
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    const toggleTask = useCallback(async (
        taskId: string,
        completed: boolean,
        carryId?: string
    ) => {
        const prev = data;
        // Optimistic update
        setData(current => {
            if (!current) return current;
            if (completed) {
                return { ...current, completedTaskIds: [...current.completedTaskIds, taskId] };
            } else {
                return { ...current, completedTaskIds: current.completedTaskIds.filter(id => id !== taskId) };
            }
        });
        try {
            const res = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dayN: prev?.dayN, taskId, completed, carryId }),
            });
            if (!res.ok) throw new Error('Task toggle failed');
        } catch {
            setData(prev);
        }
    }, [data]);

    const markComplete = useCallback(async () => {
        const prev = data;
        setData(current => current ? { ...current, dayComplete: true } : current);
        try {
            const res = await fetch('/api/day/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            if (!res.ok) throw new Error('Mark complete failed');
        } catch {
            setData(prev);
        }
    }, [data]);

    return { data, loading, error, toggleTask, markComplete };
}
