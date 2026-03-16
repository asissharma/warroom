// ── FILE: hooks/useDay.ts ──
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { DayPayload } from '@/types';

interface UseDayReturn {
    data: DayPayload | null;
    loading: boolean;
    error: string | null;
    toggleTask: (taskId: string, completed: boolean, carryId?: string) => Promise<void>;
    markComplete: (forceComplete?: boolean) => Promise<void>;
    refetch: () => void;
}

export function useDay(): UseDayReturn {
    const [data, setData] = useState<DayPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const togglingRef = useRef<Set<string>>(new Set());

    const fetchDay = useCallback(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
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

    useEffect(() => {
        fetchDay();
    }, [fetchDay]);

    const toggleTask = useCallback(async (
        taskId: string,
        completed: boolean,
        carryId?: string
    ) => {
        // Debounce: prevent multiple rapid clicks on same task
        if (togglingRef.current.has(taskId)) return;
        togglingRef.current.add(taskId);

        const prev = data;
        const prevDayN = prev?.dayN;

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
                body: JSON.stringify({ dayN: prevDayN, taskId, completed, carryId }),
            });
            if (!res.ok) throw new Error('Task toggle failed');
            const result = await res.json();
            // Update with actual server state
            if (result.completedTaskIds) {
                setData(current => current ? { ...current, completedTaskIds: result.completedTaskIds } : current);
            }
        } catch (err) {
            console.error('Task toggle error:', err);
            setError('Failed to update task');
            setData(prev);
        } finally {
            togglingRef.current.delete(taskId);
        }
    }, [data]);

    const markComplete = useCallback(async (forceComplete = false) => {
        const prev = data;
        if (!prev) return;

        // Show completing state immediately
        setData(current => current ? { ...current, dayComplete: true } : current);

        try {
            const res = await fetch('/api/day/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dayN: prev.dayN, force: forceComplete }),
            });
            if (!res.ok) throw new Error('Mark complete failed');

            // Clear data and refetch to get next day's tasks
            setTimeout(() => {
                setData(null); // Clear to show loading state
                fetchDay();
            }, 300);
        } catch (err) {
            console.error('Mark complete error:', err);
            setError('Failed to complete day');
            setData(prev);
        }
    }, [data, fetchDay]);

    // Expose refetch for manual refresh
    const refetch = useCallback(() => {
        setData(null);
        fetchDay();
    }, [fetchDay]);

    return { data, loading, error, toggleTask, markComplete, refetch };
}