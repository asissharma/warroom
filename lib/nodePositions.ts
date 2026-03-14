import { getPhaseFromDay, PHASE_Z } from '@/constants/phaseConfig';

// Simple deterministic string hasher for X coordinates
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// x = domain/category spread (-300 to +300)
// y = day offset relative to phase start (-100 to +100)
// z = base Z + slight depth jitter
export function jsonItemToPosition(item: any, type: string) {
    const day = item.day || item.dayN || 1;
    const phaseIdx = getPhaseFromDay(day);
    
    // Domain grouping
    const domain = item.category || item.theme || item.domain || 'general';
    const domainHash = hashString(domain);
    const xBase = (domainHash % 600) - 300; // -300 to 300
    
    // Y distribution: day offset inside the phase
    const dayWithinPhase = (day - 1) % 22.5; 
    const yBase = (dayWithinPhase * 8) - 90; // Approx -90 to +90 vertical spread
    
    // Add stable jitter to prevent perfect stacking
    const jitterX = (hashString(item.name || item.title || item.question || item.id || Math.random().toString()) % 50) - 25;
    const jitterY = (domainHash % 30) - 15;
    const jitterZ = (domainHash % 40) - 20;

    return {
        x: xBase + jitterX,
        y: yBase + jitterY,
        z: PHASE_Z[phaseIdx] + jitterZ,
        type: type === 'projects' ? 'project' : type === 'questions' ? 'question' : type === 'tech-spine' ? 'skill' : type === 'skills' ? 'skill' : 'survival',
        originalItem: item
    };
}
