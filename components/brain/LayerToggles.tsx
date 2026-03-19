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
                case 'p':
                    setRenderMode(renderMode === 'phases' ? 'work' : 'phases');
                    break;
                case 's':
                    setRenderMode(renderMode === 'syllabus' ? 'work' : 'syllabus');
                    break;
                case 'i':
                    toggleLayer('intel');
                    break;
                // Number keys 1-8 to jump to phases
                default:
                    const num = parseInt(e.key);
                    if (num >= 1 && num <= 8) {
                        setRenderMode('phases');
                        // Could also set selected phase in PhaseNavigator via store
                    }
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
                onClick={() => setRenderMode(renderMode === 'syllabus' ? 'work' : 'syllabus')}
                className={`flex bg-surface/80 border rounded-xl shadow-lg px-3 py-1.5 backdrop-blur-md text-xs font-bold uppercase tracking-widest transition-all ${
                    renderMode === 'syllabus' ? 'bg-accent/20 text-accent border-accent/30' : 'text-muted hover:text-text border-borderLo'
                }`}
            >
                [S] Syllabus
            </button>
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
