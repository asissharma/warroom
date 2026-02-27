// ── FILE: hooks/useSkills.ts ──
'use client';
import { useState, useEffect, useCallback } from 'react';

export type SkillBarKey =
    | 'python_algo_oop'
    | 'databases_concurrency'
    | 'js_node_security'
    | 'ml_ai_mlops'
    | 'build_output';

export interface SkillBar {
    key: SkillBarKey;
    value: number;
    level: number;
}

interface UseSkillsReturn {
    bars: SkillBar[];
    loading: boolean;
    error: string | null;
    bumpSkill: (barKey: SkillBarKey) => Promise<void>;
}

export function useSkills(): UseSkillsReturn {
    const [bars, setBars] = useState<SkillBar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch('/api/skill', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                setBars(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    setError(err.message ?? 'Failed to load skills');
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    const bumpSkill = useCallback(async (barKey: SkillBarKey) => {
        const prev = bars;
        // Optimistic +5
        setBars(current =>
            current.map(b =>
                b.key === barKey
                    ? { ...b, value: Math.min(b.value + 5, 100) }
                    : b
            )
        );
        try {
            const res = await fetch('/api/skill', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barKey, delta: 5 }),
            });
            if (!res.ok) throw new Error('PATCH failed');
            const updated: SkillBar = await res.json();
            setBars(current =>
                current.map(b => (b.key === updated.key ? updated : b))
            );
        } catch {
            setBars(prev);
        }
    }, [bars]);

    return { bars, loading, error, bumpSkill };
}
