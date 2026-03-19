import { create } from 'zustand';

export type RenderMode = 'command' | 'work' | 'phases' | 'syllabus';

export interface LayerToggles {
    nodes: boolean;
    map: boolean;
    log: boolean;
    edges: boolean;
    intel: boolean;
}

export interface DataFilters {
    projects: boolean;
    spine: boolean;
    skills: boolean;
    survival: boolean;
    questions: boolean;
}

interface BrainState {
    renderMode: RenderMode;
    setRenderMode: (mode: RenderMode) => void;

    layers: LayerToggles;
    toggleLayer: (layer: keyof LayerToggles) => void;
    setLayer: (layer: keyof LayerToggles, value: boolean) => void;

    filters: DataFilters;
    toggleFilter: (filter: keyof DataFilters) => void;
}

export const useBrainStore = create<BrainState>((set) => ({
    renderMode: 'command',
    setRenderMode: (mode) => set({ renderMode: mode }),

    layers: {
        nodes: true,
        map: false,
        log: false,
        edges: false,
        intel: false,
    },
    toggleLayer: (layer) => set((state) => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
    setLayer: (layer, value) => set((state) => ({
        layers: { ...state.layers, [layer]: value },
    })),

    filters: {
        projects: true,
        spine: true,
        skills: true,
        survival: true,
        questions: true,
    },
    toggleFilter: (filter) => set((state) => ({
        filters: { ...state.filters, [filter]: !state.filters[filter] },
    })),
}));
