'use client';

import { useBrainStore } from '@/store/brainStore';
import { WorkCanvas } from './WorkCanvas';
import { LayerToggles } from './LayerToggles';
import { MapLayer } from './MapLayer';
import { LogLayer } from './LogLayer';
import { PhaseNavigator } from './PhaseNavigator';

export function BrainCanvasHost() {
    const { renderMode } = useBrainStore();

    if (renderMode === 'command') return null;

    return (
        <div className="absolute inset-0 z-0 bg-bg overflow-hidden">
            <WorkCanvas active={renderMode === 'work'} />

            {/* 2D Phase Navigator - replaces 3D DepthCanvas */}
            <PhaseNavigator />

            <MapLayer />
            <LogLayer />
            <LayerToggles />
        </div>
    );
}
