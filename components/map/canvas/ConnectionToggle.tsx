import { Network } from 'lucide-react'
import { useMapStore } from '@/hooks/useMapStore'

export default function ConnectionToggle() {
    const { connectionsVisible, toggleConnections } = useMapStore()

    return (
        <button
            onClick={toggleConnections}
            className={`absolute bottom-6 right-6 z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-lg a-transition border ${connectionsVisible
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-surface border-borderHi text-muted hover:text-text'
                }`}
            title="Toggle Shadow Intelligence Connections"
        >
            <Network className="w-5 h-5" />
        </button>
    )
}
