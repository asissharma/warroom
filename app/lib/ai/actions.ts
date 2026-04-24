import { ISettings } from '../models/Settings';

export interface AIActionContext {
    action: 'teach' | 'analyze' | 'practice' | 'summarize' | 'chat';
    item?: any;
    settings: ISettings;
    sessionContext?: any;
    history?: { role: string, content: string }[];
}

export function buildSystemInstruction(context: AIActionContext): string {
    const { action, item, settings } = context;
    
    const base = `You are the WarRoom AI, a tactical engineering mentor. Your goal is to help a high-performance engineer master technical concepts and close knowledge gaps.
    
Current Context:
- Syllabus: ${item.syllabusSlug}
- Status: ${item.status}
- Difficulty: ${item.difficulty || item.depthReached || 1}/10
- Times Struggled: ${item.timesStruggled || item.flagCount || 0}
`;

    switch (action) {
        case 'teach':
            return `${base}
Action: TEACH ME.
Provide a high-fidelity conceptual breakdown. Focus on:
1. The "Mental Model": How to intuitively think about this.
2. The "Gotchas": Common pitfalls engineers face.
3. The "Memory Hook": A mnemonic or 1-sentence summary that sticks.
Keep it concise, tactical, and dense with value. No fluff.`;

        case 'analyze':
            return `${base}
Action: ANALYZE GAP.
The user is struggling or needs a deep dive into this bottleneck.
Identify WHY this might be difficult based on the context. 
Suggest a "Paradigm Shift" (a different way to look at it) and 2 specific sub-tasks to prove mastery.`;

        case 'practice':
            return `${base}
Action: PRACTICE DRILL.
Generate a scenario-based technical challenge or active recall question.
Make it difficult enough to match their current level (Difficulty ${item?.difficulty || 1}).
Provide the answer in a spoiler tag or at the very bottom.`;

        case 'chat':
            return `${base}
Action: CONVERSATIONAL ASSISTANCE.
Help the user with their current block. Be brief, technical, and encouraging. 
If the user is drifting too far from the technical objective, gently nudge them back.`;

        default:
            return base;
    }
}

export function buildUserPrompt(context: AIActionContext): string {
    const { action, item, history } = context;
    
    if (action === 'chat' && history && history.length > 0) {
        return history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') + '\n\nAI: ';
    }

    const metaString = item?.meta && Object.keys(item.meta).length > 0
        ? `\nMeta Context:\n${JSON.stringify(item.meta, null, 2)}` 
        : '';

    return `Title: ${item?.title || item?.name || item?.text || item?.concept || 'Generic Topic'}
Description/Notes: ${item?.description || item?.notes || item?.prompt || 'No additional notes.'}${metaString}

Please perform the requested action based on this specific item.`;
}
