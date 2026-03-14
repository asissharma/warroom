'use client';

import { useState } from 'react';
import { Network, Database, Plus, Search } from 'lucide-react';
import { IntelFeed } from '@/components/intel/IntelFeed';
import { IntelManualInput } from '@/components/intel/IntelManualInput';
import { IntelClusters } from '@/components/intel/IntelClusters';

export default function IntelPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'clusters' | 'manual'>('feed');

    return (
        <div className="content-z pb-32 max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 min-h-[100dvh] flex flex-col relative">

            {/* Header Strip */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-borderLo">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Database className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-text">INTEL LAYER</h1>
                        <p className="text-xs text-muted font-mono tracking-wider uppercase">Universal Knowledge Store</p>
                    </div>
                </div>
                {activeTab !== 'manual' && (
                    <button
                        onClick={() => setActiveTab('manual')}
                        className="flex items-center gap-2 bg-text text-bg px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 a-transition"
                    >
                        <Plus className="w-4 h-4" /> Add Intel
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-surface border border-borderLo p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest a-transition ${
                        activeTab === 'feed' ? 'bg-bg text-text shadow-sm' : 'text-muted hover:text-text'
                    }`}
                >
                    <Network className="w-4 h-4" /> Feed
                </button>
                <button
                    onClick={() => setActiveTab('clusters')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest a-transition ${
                        activeTab === 'clusters' ? 'bg-bg text-text shadow-sm' : 'text-muted hover:text-text'
                    }`}
                >
                    <Search className="w-4 h-4" /> Clusters
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest a-transition ${
                        activeTab === 'manual' ? 'bg-bg text-text shadow-sm' : 'text-muted hover:text-text'
                    }`}
                >
                    <Plus className="w-4 h-4" /> Manual
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === 'feed' && <IntelFeed />}
                {activeTab === 'clusters' && <IntelClusters />}
                {activeTab === 'manual' && <IntelManualInput />}
            </div>
        </div>
    );
}
