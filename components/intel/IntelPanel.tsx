'use client';

import { useBrainStore } from '@/store/brainStore';
import { useState } from 'react';
import { IntelFeed } from './IntelFeed';
import { IntelManualInput } from './IntelManualInput';
import { IntelClusters } from './IntelClusters';
import { X, Activity, PlusSquare, Network } from 'lucide-react';

export function IntelPanel() {
    const { layers, setLayer } = useBrainStore();
    const [activeTab, setActiveTab] = useState<'feed' | 'clusters' | 'input'>('feed');

    if (!layers.intel) return null;

    return (
        <div className="fixed top-0 bottom-0 right-0 w-full sm:w-[500px] bg-bg/95 backdrop-blur-md border-l border-borderLo shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[9000] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-borderLo">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setActiveTab('feed')} 
                        className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${
                            activeTab === 'feed' ? 'bg-text text-bg shadow-sm' : 'text-muted hover:text-text bg-surface'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" /> Feed
                    </button>
                    <button 
                        onClick={() => setActiveTab('clusters')} 
                        className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${
                            activeTab === 'clusters' ? 'bg-text text-bg shadow-sm' : 'text-muted hover:text-text bg-surface'
                        }`}
                    >
                        <Network className="w-3.5 h-3.5" /> Clusters
                    </button>
                    <button 
                        onClick={() => setActiveTab('input')} 
                        className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${
                            activeTab === 'input' ? 'bg-text text-bg shadow-sm' : 'text-muted hover:text-text bg-surface'
                        }`}
                    >
                        <PlusSquare className="w-3.5 h-3.5" /> Input
                    </button>
                </div>
                <button 
                    onClick={() => setLayer('intel', false)} 
                    className="text-muted hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 hide-scrollbar relative">
                {activeTab === 'feed' && <IntelFeed />}
                {activeTab === 'clusters' && <IntelClusters />}
                {activeTab === 'input' && <IntelManualInput />}
            </div>
        </div>
    );
}
