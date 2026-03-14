'use client';

import { useBrainStore } from '@/store/brainStore';

export function MapLayer() {
    const { layers } = useBrainStore();

    if (!layers.map) return null;

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-surface border border-borderLo px-6 py-3 rounded-full shadow-lg z-50 pointer-events-none flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <div className="text-sm font-bold tracking-wider uppercase">180-Day Spine Overlay Active</div>
        </div>
    );
}
