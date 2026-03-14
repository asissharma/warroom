import IntelNode, { IIntelNode } from './models/IntelNode';
import { IntelEmitPayload } from './intelEmitter';

export function generateAutoTags(payload: IntelEmitPayload): string[] {
    const tags = new Set<string>();

    if (payload.domain) tags.add(payload.domain.toLowerCase());
    if (payload.type) tags.add(payload.type.toLowerCase());
    if (payload.phase) tags.add(`phase-${payload.phase}`);
    if (payload.dayN) tags.add(`day-${payload.dayN}`);

    return Array.from(tags);
}

export async function autoConnectRelated(nodeId: string, userId: string, payload: IntelEmitPayload): Promise<void> {
    const orConditions: any[] = [];
    if (payload.dayN) orConditions.push({ dayN: payload.dayN });
    if (payload.domain) orConditions.push({ domain: payload.domain });
    if (payload.phase) orConditions.push({ phase: payload.phase });

    if (orConditions.length === 0) return;

    const relatedNodes = await IntelNode.find({ 
        userId, 
        _id: { $ne: nodeId },
        $or: orConditions
    }).limit(20); // Limit to prevent massive connection spikes on common domains

    if (relatedNodes.length === 0) return;

    // 1. Connect new node to all existing related nodes
    const outboundConnections = relatedNodes.map(target => {
        let label = 'related';
        if (payload.dayN && target.dayN === payload.dayN) label = 'same_day';
        else if (payload.phase && target.phase === payload.phase) label = 'same_phase';
        else if (payload.domain && target.domain === payload.domain) label = 'same_domain';

        return {
            targetId: target._id.toString(),
            label,
            direction: 'bi',
            createdBy: 'auto',
            strength: 0.1 // Weak gravity for auto-connections
        };
    });

    await IntelNode.findByIdAndUpdate(nodeId, {
        $push: { connections: { $each: outboundConnections } }
    });

    // 2. Connect all existing related nodes back to this new node
    await Promise.all(
        relatedNodes.map(target => {
            let label = 'related';
            if (payload.dayN && target.dayN === payload.dayN) label = 'same_day';
            else if (payload.phase && target.phase === payload.phase) label = 'same_phase';
            else if (payload.domain && target.domain === payload.domain) label = 'same_domain';

            return IntelNode.findByIdAndUpdate(target._id, {
                $push: { 
                    connections: {
                        targetId: nodeId,
                        label,
                        direction: 'bi',
                        createdBy: 'auto',
                        strength: 0.1
                    }
                }
            })
        })
    );
}
