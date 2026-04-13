'use client';

import React, { useState } from 'react';
import DailyScreen from './dailyScreen';
import SyllabusPitt from './syllabusPitt';
import SettingsScreen from './setting';
import GlobalNav from './components/shared/GlobalNav';

export default function RootPage() {
    const [activeScreen, setActiveScreen] = useState<'DAILY' | 'SYLLABUS' | 'SETTINGS'>('DAILY');

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative', background: '#FFFFFF' }}>
            {activeScreen === 'DAILY' && <DailyScreen />}
            {activeScreen === 'SYLLABUS' && <SyllabusPitt />}
            {activeScreen === 'SETTINGS' && <SettingsScreen />}
            
            <GlobalNav 
                activeScreen={activeScreen} 
                onScreenChange={setActiveScreen} 
            />
        </div>
    );
}
