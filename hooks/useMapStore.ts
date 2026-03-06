import { create } from 'zustand'

interface ViewportState {
    x: number
    y: number
    zoom: number
}

interface MapState {
    activeTab: 'TIMELINE' | 'CANVAS' | 'PROGRESS'
    openTopicKey: string | null
    connectionsVisible: boolean
    canvasViewport: ViewportState

    // Actions
    setActiveTab: (tab: 'TIMELINE' | 'CANVAS' | 'PROGRESS') => void
    setOpenTopicKey: (topicKey: string | null) => void
    toggleConnections: () => void
    setCanvasViewport: (viewport: ViewportState) => void
}

export const useMapStore = create<MapState>((set) => ({
    activeTab: 'TIMELINE',
    openTopicKey: null,
    connectionsVisible: false,
    canvasViewport: { x: 0, y: 0, zoom: 0.5 },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setOpenTopicKey: (topicKey) => set({ openTopicKey: topicKey }),
    toggleConnections: () => set((state) => ({ connectionsVisible: !state.connectionsVisible })),
    setCanvasViewport: (viewport) => set({ canvasViewport: viewport })
}))
