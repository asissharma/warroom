// ── FILE: hooks/useLog.ts ──
'use client';
import { useState, useEffect, useCallback } from 'react';

export type LogType = 'win' | 'skip' | 'key' | 'block';

export interface LogRecord {
    _id: string;
    dayN: number;
    text: string;
    type: LogType;
    createdAt: string;
}

interface UseLogReturn {
    records: LogRecord[];
    loading: boolean;
    error: string | null;
    filter: LogType | 'all';
    setFilter: (f: LogType | 'all') => void;
    addLog: (text: string, type: LogType) => Promise<void>;
}

export function useLog(): UseLogReturn {
    const [allRecords, setAllRecords] = useState<LogRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<LogType | 'all'>('all');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch('/api/log?limit=50', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                setAllRecords(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    setError(err.message ?? 'Failed to load logs');
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    const addLog = useCallback(async (text: string, type: LogType) => {
        const optimistic: LogRecord = {
            _id: `temp_${Date.now()}`,
            dayN: 0,
            text,
            type,
            createdAt: new Date().toISOString(),
        };
        setAllRecords(prev => [optimistic, ...prev]);
        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, type }),
            });
            if (!res.ok) throw new Error('POST failed');
            const created: LogRecord = await res.json();
            setAllRecords(prev =>
                prev.map(r => (r._id === optimistic._id ? created : r))
            );
        } catch {
            setAllRecords(prev => prev.filter(r => r._id !== optimistic._id));
        }
    }, []);

    const records =
        filter === 'all' ? allRecords : allRecords.filter(r => r.type === filter);

    return { records, loading, error, filter, setFilter, addLog };
}
