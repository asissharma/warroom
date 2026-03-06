import { useMapStore } from '@/hooks/useMapStore'

export default function MapTabs() {
    const { activeTab, setActiveTab } = useMapStore()

    const tabs: Array<'TIMELINE' | 'CANVAS' | 'PROGRESS'> = ['TIMELINE', 'CANVAS', 'PROGRESS']

    return (
        <div className="flex bg-surface2 rounded-xl p-1 mb-6 border border-borderLo">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg a-transition ${activeTab === tab ? 'bg-surface shadow text-text' : 'text-muted hover:text-text'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    )
}
