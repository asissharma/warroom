'use client';

import { useBrainStore } from '@/store/brainStore';

export function LogLayer() {
    const { layers } = useBrainStore();

    if (!layers.log) return null;

    return (
        <div className="absolute bottom-24 right-8 bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 rounded-xl shadow-lg z-50 pointer-events-none flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="text-xs font-mono tracking-widest uppercase text-yellow-400">Journal Overlay Active</div>
        </div>
    );
}
