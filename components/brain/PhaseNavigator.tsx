'use client';

import { useState } from 'react';
import { useBrainStore } from '@/store/brainStore';
import { X, ChevronLeft, ChevronRight, Layers, Zap, Cloud, Shield, Bot, Layout, Award, Rocket } from 'lucide-react';

const PHASES = [
    { name: 'Foundation', days: '1-30', icon: Zap, color: 'bg-blue-500', gradient: 'from-blue-500/20 to-blue-600/5' },
    { name: 'Distributed', days: '31-50', icon: Layers, color: 'bg-cyan-500', gradient: 'from-cyan-500/20 to-cyan-600/5' },
    { name: 'Cloud', days: '51-70', icon: Cloud, color: 'bg-sky-500', gradient: 'from-sky-500/20 to-sky-600/5' },
    { name: 'Security', days: '71-90', icon: Shield, color: 'bg-red-500', gradient: 'from-red-500/20 to-red-600/5' },
    { name: 'ML/AI', days: '91-110', icon: Bot, color: 'bg-purple-500', gradient: 'from-purple-500/20 to-purple-600/5' },
    { name: 'Frontend', days: '111-130', icon: Layout, color: 'bg-green-500', gradient: 'from-green-500/20 to-green-600/5' },
    { name: 'Mastery', days: '131-140', icon: Award, color: 'bg-yellow-500', gradient: 'from-yellow-500/20 to-yellow-600/5' },
    { name: 'Capstone', days: '141-180', icon: Rocket, color: 'bg-orange-500', gradient: 'from-orange-500/20 to-orange-600/5' },
];

export function PhaseNavigator() {
    const { renderMode, setRenderMode } = useBrainStore();
    const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

    if (renderMode !== 'phases') return null;

    const currentPhaseIndex = PHASES.findIndex(p => {
        // This would be dynamic based on user's current day
        // For now, show all phases
        return false;
    });

    return (
        <div className="absolute inset-0 z-40 bg-bg/95 backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-borderLo">
                <h2 className="text-lg font-bold text-text flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent" />
                    Phase Navigator
                </h2>
                <button
                    onClick={() => setRenderMode('work')}
                    className="p-2 hover:bg-surface2 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-muted" />
                </button>
            </div>

            {/* Phase Grid */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {PHASES.map((phase, index) => {
                        const Icon = phase.icon;
                        const isSelected = selectedPhase === index;

                        return (
                            <button
                                key={phase.name}
                                onClick={() => setSelectedPhase(isSelected ? null : index)}
                                className={`relative p-6 rounded-xl border transition-all duration-300 text-left group
                                    ${isSelected
                                        ? 'border-accent bg-accent/10 scale-105 shadow-lg shadow-accent/20'
                                        : 'border-borderLo bg-surface hover:border-accent/50 hover:bg-surface2'
                                    }`}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${phase.gradient} opacity-50`} />

                                <div className="relative">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-lg ${phase.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Phase Name */}
                                    <h3 className="font-bold text-text text-lg">{phase.name}</h3>

                                    {/* Days Range */}
                                    <p className="text-sm text-muted mt-1">{phase.days} days</p>

                                    {/* Progress (placeholder) */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${phase.color} rounded-full`}
                                                style={{ width: isSelected ? '100%' : '30%' }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted">{isSelected ? '100%' : '30%'}</span>
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Phase Detail Panel */}
            {selectedPhase !== null && (
                <div className="border-t border-borderLo p-6 bg-surface">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-10 h-10 rounded-lg ${PHASES[selectedPhase].color} flex items-center justify-center`}>
                                        {(() => {
                                            const Icon = PHASES[selectedPhase].icon;
                                            return <Icon className="w-5 h-5 text-white" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text text-xl">{PHASES[selectedPhase].name}</h3>
                                        <p className="text-sm text-muted">Days {PHASES[selectedPhase].days}</p>
                                    </div>
                                </div>
                                <p className="text-muted mt-4 max-w-lg">
                                    This phase covers the core fundamentals and establishes your technical foundation.
                                    You'll complete projects and master essential skills.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPhase(selectedPhase > 0 ? selectedPhase - 1 : null)}
                                    disabled={selectedPhase === 0}
                                    className="p-2 hover:bg-surface2 rounded-lg disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-muted" />
                                </button>
                                <button
                                    onClick={() => setSelectedPhase(selectedPhase < PHASES.length - 1 ? selectedPhase + 1 : null)}
                                    disabled={selectedPhase === PHASES.length - 1}
                                    className="p-2 hover:bg-surface2 rounded-lg disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-muted" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3 mt-6">
                            <button className="px-4 py-2 bg-accent text-bg font-bold rounded-lg hover:bg-accent/90 transition-colors">
                                Go to Phase
                            </button>
                            <button className="px-4 py-2 border border-borderLo text-muted rounded-lg hover:bg-surface2 transition-colors">
                                View Projects
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Hint */}
            <div className="p-3 border-t border-borderLo text-center">
                <p className="text-xs text-muted2">
                    Press <kbd className="px-1.5 py-0.5 bg-surface2 rounded text-muted">1-8</kbd> to jump to phase • <kbd className="px-1.5 py-0.5 bg-surface2 rounded text-muted">Esc</kbd> to close
                </p>
            </div>
        </div>
    );
}