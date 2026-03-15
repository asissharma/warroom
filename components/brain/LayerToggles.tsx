'use client';

import { useEffect } from 'react';
import { useBrainStore } from '@/store/brainStore';

export function LayerToggles() {
    const { renderMode, setRenderMode, layers, toggleLayer } = useBrainStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            switch (e.key.toLowerCase()) {
                case 'escape':
                    setRenderMode('command');
                    break;
                case 'b':
                    setRenderMode(renderMode === 'work' ? 'command' : 'work');
                    break;
                case 'd':
                    setRenderMode(renderMode === 'depth' ? 'work' : 'depth');
                    break;
                case 'i':
                    toggleLayer('intel');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [renderMode, setRenderMode, toggleLayer]);

    if (renderMode === 'command') return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9000] flex items-center gap-2">
            <div className="flex bg-surface/80 border border-borderLo rounded-xl shadow-lg p-1.5 backdrop-blur-md text-xs font-mono text-muted uppercase tracking-widest">
                <span>[ESC] Home</span>
            </div>
            <button
                onClick={() => toggleLayer('intel')}
                className={`flex bg-surface/80 border rounded-xl shadow-lg px-3 py-1.5 backdrop-blur-md text-xs font-bold uppercase tracking-widest transition-all ${
                    layers.intel ? 'bg-accent/20 text-accent border-accent/30' : 'text-muted hover:text-text border-borderLo'
                }`}
            >
                [I] Intel
            </button>
        </div>
    );
}
