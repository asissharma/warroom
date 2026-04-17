import GapTracker from '@/app/lib/models/GapTracker';

export async function recordStruggle(sourceType: string, sourceId: string, concept: string) {
    try {
        let gap = await GapTracker.findOne({ sourceId, sourceType, status: 'open' });
        
        if (gap) {
            gap.flagCount += 1;
            
            // Escalate severity based on repeated struggles
            if (gap.flagCount >= 5) {
                gap.severity = 'critical';
            } else if (gap.flagCount >= 3) {
                gap.severity = 'medium';
            }
            
            await gap.save();
        } else {
            // First time it's flagged as a gap explicitly (after 2 struggles threshold hit in route)
            await GapTracker.create({
                concept,
                sourceType,
                sourceId,
                flagCount: 2, // assume it hit the threshold to spawn
                severity: 'low',
                depthReached: 1,
                status: 'open'
            });
        }
    } catch (e) {
        console.error('Gap creation failed in engine:', e);
    }
}
