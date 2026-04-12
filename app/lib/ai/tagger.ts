import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateAiTags(content: string): Promise<string[]> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('AI_TAGGER: GEMINI_API_KEY missing. Returning empty tags.');
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Act as a technical knowledge graph organizer for an engineering "Wardroom".
            Provided the following note/insight, generate 3-5 high-relevance technical tags.
            Focus on technical domains, architecture, or concepts.
            Return ONLY a comma-separated list of lowercase tags without '#' or bullet points.
            
            NOTE: "${content}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text.split(',')
            .map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-'))
            .filter(tag => tag.length > 0 && tag !== 'none');
            
    } catch (error) {
        console.error('AI_TAGGER_ERROR:', error);
        return [];
    }
}
