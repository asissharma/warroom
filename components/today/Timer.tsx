'use client';
import { useState, useEffect } from 'react';

export default function Timer() {
    const [time, setTime] = useState('00:00:00');
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="bg-surface border border-border rounded-lg flex-1 p-4 flex flex-col justify-center">
            <div className="text-muted2 text-[10px] uppercase font-mono tracking-widest mb-1">Local Time</div>
            <div className="text-text text-2xl font-mono tracking-tight">{time}</div>
        </div>
    );
}
