import { create } from 'zustand';

export type RenderMode = 'command' | 'work' | 'depth';

export interface LayerToggles {
    nodes: boolean;
    map: boolean;
    log: boolean;
    edges: boolean;
    intel: boolean;
}

interface BrainState {
    renderMode: RenderMode;
    setRenderMode: (mode: RenderMode) => void;
    
    layers: LayerToggles;
    toggleLayer: (layer: keyof LayerToggles) => void;
    setLayer: (layer: keyof LayerToggles, value: boolean) => void;
}

export const useBrainStore = create<BrainState>((set) => ({
    renderMode: 'command', // Command is the default home
    setRenderMode: (mode) => set({ renderMode: mode }),
    
    layers: {
        nodes: true, // nodes always on by default in canvas
        map: false,
        log: false,
        edges: false,
        intel: false,
    },
    toggleLayer: (layer) => set((state) => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] }
    })),
    setLayer: (layer, value) => set((state) => ({
        layers: { ...state.layers, [layer]: value }
    }))
}));
