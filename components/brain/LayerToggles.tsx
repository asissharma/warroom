'use client';

import { useEffect } from 'react';
import { useBrainStore } from '@/store/brainStore';

export function LayerToggles() {
    const { renderMode, setRenderMode, layers, toggleLayer } = useBrainStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input/textarea
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
                case 'm':
                    toggleLayer('map');
                    break;
                case 'l':
                    toggleLayer('log');
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
        <div className="fixed bottom-6 left-6 z-[9000] flex flex-col gap-2">
            <div className="flex bg-surface border border-borderLo rounded-xl shadow-lg p-1.5 backdrop-blur-md">
                <button
                    onClick={() => toggleLayer('map')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        layers.map ? 'bg-text text-bg shadow-sm' : 'text-muted hover:text-text'
                    }`}
                >
                    [M] Map
                </button>
                <button
                    onClick={() => toggleLayer('log')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        layers.log ? 'bg-yellow-400 text-bg shadow-sm' : 'text-muted hover:text-yellow-400'
                    }`}
                >
                    [L] Log
                </button>
                <button
                    onClick={() => toggleLayer('edges')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        layers.edges ? 'bg-text text-bg shadow-sm' : 'text-muted hover:text-text'
                    }`}
                >
                    Edges
                </button>
                <div className="w-px bg-borderLo mx-1" />
                <button
                    onClick={() => toggleLayer('intel')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        layers.intel ? 'bg-accent/20 text-accent border border-accent/30' : 'text-muted hover:text-text'
                    }`}
                >
                    [I] Intel
                </button>
            </div>
            
            <div className="flex bg-surface2 border border-borderLo rounded-xl shadow-lg p-1.5 backdrop-blur-md self-start text-xs font-mono text-muted uppercase tracking-widest">
                <span>[ESC] TO HOME · [D] SPATIAL 3D</span>
            </div>
        </div>
    );
}
