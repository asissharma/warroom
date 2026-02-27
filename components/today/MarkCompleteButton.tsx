'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import ReflectionModal from './ReflectionModal';

export default function MarkCompleteButton({ dayN, allDone }: { dayN: number, allDone: boolean }) {
    const markDayDone = useStore(s => s.markDayDone);
    const [showModal, setShowModal] = useState(false);

    const handleComplete = () => {
        markDayDone(new Date().toISOString().split('T')[0]);
        setShowModal(false);
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`w-full py-2 bg-acid text-black font-mono text-xs uppercase tracking-widest rounded hover:bg-acid/90 transition-all ${allDone ? 'animate-pulse scale-[1.02] shadow-[0_0_15px_rgba(200,255,0,0.3)]' : ''}`}
            >
                Mark Day {dayN} Complete
            </button>

            {showModal && (
                <ReflectionModal
                    dayN={dayN}
                    onClose={() => setShowModal(false)}
                    onComplete={handleComplete}
                />
            )}
        </>
    );
}
