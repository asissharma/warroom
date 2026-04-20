import { aiProvider } from './provider';

export async function generateAiTags(content: string): Promise<string[]> {
    try {
        const system = `
            Act as a technical knowledge graph organizer for an engineering "Wardroom".
            Provided the following note/insight, generate 3-5 high-relevance technical tags.
            Focus on technical domains, architecture, or concepts.
            Return ONLY a comma-separated list of lowercase tags without '#' or bullet points.
        `;

        const prompt = `CONTENT: "${content}"`;

        const text = await aiProvider.runAI({
            model: 'gemini-1.5-flash', // Default for tagging
            system,
            prompt,
            temperature: 0.3
        });
        
        return text.split(',')
            .map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-'))
            .filter(tag => tag.length > 0 && tag !== 'none');
            
    } catch (error) {
        console.error('AI_TAGGER_ERROR:', error);
        return [];
    }
}
