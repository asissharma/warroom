import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { Groq } from 'groq-sdk';

// Type definitions for internal routing
export type AIProviderName = 'gemini' | 'groq' | 'openrouter' | 'ollama_cloud';

interface AIRequest {
  model: string;
  system?: string;
  prompt: string;
  provider?: AIProviderName; // Explicit override
  temperature?: number;
}

class AIProvider {
  private static instance: AIProvider;
  
  private geminiClient: GoogleGenerativeAI | null = null;
  private groqClient: Groq | null = null;
  private openRouterClient: OpenAI | null = null;
  private ollamaClient: OpenAI | null = null;

  private constructor() {
    this.initClients();
  }

  public static getInstance(): AIProvider {
    if (!AIProvider.instance) {
      AIProvider.instance = new AIProvider();
    }
    return AIProvider.instance;
  }

  private initClients() {
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    if (process.env.OPENROUTER_API_KEY) {
      this.openRouterClient = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3000', // Update for production
          'X-Title': 'WarRoom AI',
        }
      });
    }
    if (process.env.OLLAMA_CLOUD_API_KEY) {
      // Assuming Ollama Cloud follows OpenAI format or standard endpoint
      this.ollamaClient = new OpenAI({
        apiKey: process.env.OLLAMA_CLOUD_API_KEY,
        baseURL: process.env.OLLAMA_CLOUD_URL || 'https://api.ollama.com/v1',
      });
    }
  }

  public async runAI({ model, system, prompt, provider, temperature = 0.7 }: AIRequest): Promise<string> {
    const resolvedProvider = provider || this.inferProvider(model);

    try {
      switch (resolvedProvider) {
        case 'gemini':
          return await this.callGemini(model, system, prompt, temperature);
        case 'groq':
          return await this.callGroq(model, system, prompt, temperature);
        case 'openrouter':
          return await this.callOpenRouter(model, system, prompt, temperature);
        case 'ollama_cloud':
          return await this.callOllama(model, system, prompt, temperature);
        default:
          throw new Error(`Unsupported provider or model: ${model}`);
      }
    } catch (error: any) {
      console.error(`AI_PROVIDER_ERROR [${resolvedProvider}]:`, error);
      throw error;
    }
  }

  private inferProvider(model: string): AIProviderName {
    const m = model.toLowerCase();
    if (m.includes('gemini')) return 'gemini';
    if (m.includes('llama') || m.includes('mixtral') || m.includes('gemma')) {
        // Default to Groq if key exists, else OpenRouter
        return process.env.GROQ_API_KEY ? 'groq' : 'openrouter';
    }
    if (m.includes('gpt') || m.includes('claude')) return 'openrouter';
    return 'openrouter'; // Default fallback
  }

  private async callGemini(model: string, system: string = '', prompt: string, temp: number): Promise<string> {
    if (!this.geminiClient) throw new Error('Gemini client not initialized.');
    const geminiModel = this.geminiClient.getGenerativeModel({ 
        model: model || 'gemini-1.5-flash',
        systemInstruction: system
    });
    const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: temp }
    });
    return result.response.text();
  }

  private async callGroq(model: string, system: string = '', prompt: string, temp: number): Promise<string> {
    if (!this.groqClient) throw new Error('Groq client not initialized.');
    const completion = await this.groqClient.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        ...(system ? [{ role: 'system' as const, content: system }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: temp,
    });
    return completion.choices[0]?.message?.content || '';
  }

  private async callOpenRouter(model: string, system: string = '', prompt: string, temp: number): Promise<string> {
    if (!this.openRouterClient) throw new Error('OpenRouter client not initialized.');
    const completion = await this.openRouterClient.chat.completions.create({
      model: model || 'openai/gpt-4o-mini',
      messages: [
        ...(system ? [{ role: 'system' as const, content: system }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: temp,
    });
    return completion.choices[0]?.message?.content || '';
  }

  private async callOllama(model: string, system: string = '', prompt: string, temp: number): Promise<string> {
    if (!this.ollamaClient) throw new Error('Ollama Cloud client not initialized.');
    const completion = await this.ollamaClient.chat.completions.create({
      model: model,
      messages: [
        ...(system ? [{ role: 'system' as const, content: system }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: temp,
    });
    return completion.choices[0]?.message?.content || '';
  }
}

export const aiProvider = AIProvider.getInstance();
