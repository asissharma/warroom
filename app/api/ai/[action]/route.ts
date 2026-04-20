import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { SettingsModel } from '@/app/lib/models/Settings';
import { SyllabusItemModel } from '@/app/lib/models/SyllabusItem';
import { aiProvider } from '@/app/lib/ai/provider';
import { buildSystemInstruction, buildUserPrompt } from '@/app/lib/ai/actions';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const { itemId, messages } = await request.json();

  await connectDB();

  try {
    const [settings, item] = await Promise.all([
      SettingsModel.getSingleton(),
      itemId ? SyllabusItemModel.findById(itemId) : Promise.resolve(null)
    ]);

    if (!settings.ai.enabled) {
      return NextResponse.json({ error: 'AI integration is disabled in settings.' }, { status: 403 });
    }

    // Resolve model based on action
    let model = settings.ai.teachModel;
    if (action === 'analyze') model = settings.ai.analyseModel;
    if (action === 'practice') model = settings.ai.practiceModel;
    if (action === 'summarize') model = settings.ai.summaryModel;
    if (action === 'chat') model = settings.ai.teachModel; // Use teach model for chat by default

    // If no specific item, we generate a general system instruction
    const system = buildSystemInstruction({ 
        action: action as any, 
        item: item || { syllabusSlug: 'general', status: 'active' }, 
        settings,
        history: messages 
    });
    
    // For chat, user prompt is handled by buildUserPrompt which stringifies history
    const prompt = buildUserPrompt({ action: action as any, item, settings, history: messages });

    const response = await aiProvider.runAI({
      model,
      system,
      prompt,
      temperature: action === 'practice' ? 0.8 : 0.4
    });

    return NextResponse.json({
      success: true,
      action,
      model,
      response
    });

  } catch (error: any) {
    console.error(`AI_API_ROUTE [${action}] ERROR:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
