import { IntelNodeType, IntelSource, IntelNode, IIntelNode } from './models/IntelNode';
import { generateAutoTags, autoConnectRelated } from '@/lib/intelUtils';

export interface IntelEmitPayload {
    userId: string;
    type: IntelNodeType;
    source: IntelSource;
    title: string;
    body?: string;
    url?: string;
    tags?: string[];
    domain?: string;
    phase?: number;
    dayN?: number;
    score?: number;
    status?: 'active' | 'completed';
    sourceRefId?: string;
    curriculumRef?: { sourceJson: 'projects' | 'questions' | 'tech-spine' | 'skills' | 'survival-areas'; refId: string };
}

export async function emitToIntel(payload: IntelEmitPayload): Promise<IIntelNode> {
    // Check if IntelNode already exists for this sourceRefId
    if (payload.sourceRefId) {
        const existing = await IntelNode.findOne({
            userId: payload.userId,
            sourceRefId: payload.sourceRefId
        });

        if (existing) {
            // Update status/score if changed, return existing
            const updated = await IntelNode.findByIdAndUpdate(
                existing._id,
                { status: payload.status, score: payload.score, updatedAt: new Date() },
                { new: true }
            );
            return updated as IIntelNode;
        }
    }

    // Auto-generate tags from source context
    const autoTags = generateAutoTags(payload);

    // Create new IntelNode
    const node = await IntelNode.create({
        ...payload,
        tags: [...(payload.tags ?? []), ...autoTags],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Auto-connect to related nodes based on Day, Phase, or Domain (weak gravity)
    await autoConnectRelated(node._id.toString(), payload.userId, payload);

    return node;
}
