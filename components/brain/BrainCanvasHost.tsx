'use client';

import { useBrainStore } from '@/store/brainStore';
import { WorkCanvas } from './WorkCanvas';
import { LayerToggles } from './LayerToggles';
import { MapLayer } from './MapLayer';
import { LogLayer } from './LogLayer';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the 3D canvas so we don't block the initial page load with Three.js
const DepthCanvas = lazy(() => import('./DepthCanvas').then(mod => ({ default: mod.DepthCanvas })));

export function BrainCanvasHost() {
    const { renderMode } = useBrainStore();

    if (renderMode === 'command') return null;

    return (
        <div className="absolute inset-0 z-0 bg-bg overflow-hidden">
            <WorkCanvas active={renderMode === 'work'} />
            
            {renderMode === 'depth' && (
                <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/90 backdrop-blur-md z-[50]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-accent" />
                            <div className="text-sm font-mono tracking-widest uppercase text-muted">Initializing Spatial Architecture</div>
                        </div>
                    </div>
                }>
                    <DepthCanvas active={renderMode === 'depth'} />
                </Suspense>
            )}

            <MapLayer />
            <LogLayer />
            <LayerToggles />
        </div>
    );
}
