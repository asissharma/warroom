// ── FILE: hooks/useUser.ts ──
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { IUser } from '@/types';

interface UseUserReturn {
    user: IUser | null;
    loading: boolean;
    error: string | null;
    updateUser: (patch: Partial<IUser & { startDate: string }>) => Promise<void>;
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch('/api/user', { signal: controller.signal })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((d: IUser) => {
                setUser(d);
                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    setError(err.message ?? 'Failed to load user');
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    const updateUser = useCallback(async (patch: Partial<IUser & { startDate: string }>) => {
        const prev = user;
        // Optimistic update
        setUser(u => u ? { ...u, ...patch } as IUser : u);
        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            });
            if (!res.ok) throw new Error('PATCH failed');
            const updated: IUser = await res.json();
            setUser(updated);
        } catch {
            setUser(prev);
        }
    }, [user]);

    return { user, loading, error, updateUser };
}
