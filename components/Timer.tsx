'use client';
import { useState, useEffect } from 'react';

export default function Timer() {
    const [secs, setSecs] = useState(1500); // 25min
    const [run, setRun] = useState(false);
    const [block, setBlock] = useState(1);
    const isWork = block % 2 !== 0;

    useEffect(() => {
        let int: any;
        if (run && secs > 0) {
            int = setInterval(() => setSecs(s => s - 1), 1000);
        } else if (secs === 0) {
            // Switch phase
            setRun(false);
            setBlock(b => b + 1);
            setSecs((block % 2 !== 0) ? 300 : 1500); // next is break (300) or work (1500)
        }
        return () => clearInterval(int);
    }, [run, secs, block]);

    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg border border-border flex-1">
            <div className="font-display text-[52px] bg-gradient-to-br from-white to-acid bg-clip-text text-transparent leading-none mb-4">
                {m}:{s}
            </div>
            <div className="flex space-x-2 w-full max-w-[150px]">
                <button className="flex-1 bg-accent hover:bg-accent/90 text-white text-xs font-mono py-1 rounded transition-colors"
                    onClick={() => setRun(!run)}>
                    {run ? 'PAUSE' : 'START'}
                </button>
                <button className="flex-1 border border-border text-muted2 hover:text-text text-xs font-mono py-1 rounded transition-colors"
                    onClick={() => { setRun(false); setSecs(isWork ? 1500 : 300); }}>
                    RESET
                </button>
            </div>
            <div className="text-[10px] font-mono text-muted2 mt-3 uppercase tracking-wider">
                Block {Math.ceil(block / 2)} of 4 · {isWork ? 'FOCUS' : 'BREAK'}
            </div>
        </div>
    )
}
