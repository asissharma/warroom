'use client';

import { useBrainStore } from '@/store/brainStore';
import { WorkCanvas } from './WorkCanvas';
import { LayerToggles } from './LayerToggles';
import { MapLayer } from './MapLayer';
import { LogLayer } from './LogLayer';
import { SyllabusExplorer } from './SyllabusExplorer';

export function BrainCanvasHost() {
    const { renderMode } = useBrainStore();

    if (renderMode === 'command') return null;

    return (
        <div className="absolute inset-0 z-0 bg-bg overflow-hidden">
            <WorkCanvas active={renderMode === 'work'} />

            {/* Syllabus Explorer - Full skill network & syllabus */}
            <SyllabusExplorer />

            <MapLayer />
            <LogLayer />
            <LayerToggles />
        </div>
    );
}