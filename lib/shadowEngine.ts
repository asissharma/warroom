import { Groq } from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai' // For OpenRouter

// Initialize Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const openRouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'INTEL-OS Shadow Engine',
    }
})

// Function 1: POST-INTEL SYNTHESIS (Groq)
export async function synthesizeIntel(topicKey: string, intelRecord: any, last3IntelRecords: any[]) {
    if (!process.env.GROQ_API_KEY) return null

    const prompt = `
System: You are an intelligent learning analyst. Extract structured insight from 
        a developer's study log. Be brutally honest about gaps. Respond ONLY in JSON.

User:   Topic: ${topicKey}
        Today's entry: ${JSON.stringify(intelRecord)}
        Previous entries for this topic: ${JSON.stringify(last3IntelRecords)}
        
        Return exactly this JSON format: {
          "keyConcepts": ["3-5 concepts actually grasped"],
          "weakSpots": ["gaps revealed by blockers field"],
          "relatedTopics": ["keys this connects to"],
          "suggestRevisitIn": 0,
          "rawSummary": "2-3 sentences, honest"
        }
`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: prompt }],
            model: 'mixtral-8x7b-32768',
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) return null
        return JSON.parse(content)
    } catch (e) {
        console.error("Shadow Engine (Synthesize) failed:", e)
        return null
    }
}

// Function 2: TASK ENRICHMENT (Groq)
export async function enrichTask(microtaskToday: string, topicToday: string, lastIntel: any, blockers: string) {
    if (!process.env.GROQ_API_KEY) return microtaskToday

    const prompt = `
System: You personalize a developer's daily learning task based on their history.
        Make it specific, not generic. Reference what they struggled with before.
        Output ONLY the enriched task string. 60 words max.

User:   Today's generic task: ${microtaskToday}
        Topic: ${topicToday}
        Their last INTEL entry for this topic: ${lastIntel ? JSON.stringify(lastIntel) : "No prior entry"}
        Blockers they noted: ${blockers || "None"}
        
        Return: One enriched task sentence. No JSON formatting, just raw text.
`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: prompt }],
            model: 'llama3-8b-8192'
        })
        return completion.choices[0]?.message?.content || microtaskToday
    } catch (e) {
        console.error("Shadow Engine (Enrich) failed:", e)
        return microtaskToday
    }
}

// Function 3: WEEKLY DIGEST (Gemini)
export async function generateWeeklyDigest(weekN: number, dayRecords: any[], intelRecords: any[]) {
    if (!process.env.GEMINI_API_KEY) return null

    const prompt = `
System: You are a ruthless learning coach reviewing a developer's week.
        Identify what was actually mastered vs what was just touched.
        Respond ONLY in JSON.

User:   Week ${weekN}
        All task completions: ${JSON.stringify(dayRecords)}
        All INTEL entries this week: ${JSON.stringify(intelRecords)}
        
        Return exactly this JSON format: {
          "mastered": ["topics with done status + INTEL entries"],
          "fragile": ["topics with partial + blockers"],
          "skipRisk": ["topics with no INTEL entry at all"],
          "nextWeekFocus": "one sentence priority",
          "honestAssessment": "3 sentences, no sugar-coating"
        }
`

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } })
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        return JSON.parse(text)
    } catch (e) {
        console.error("Shadow Engine (Weekly) failed:", e)
        return null
    }
}

// Function 4: TOPIC CONNECTION MAP (OpenRouter)
export async function mapTopicConnections(topicKey: string, topicLabel: string, allIntelForTopic: any[], allTopicKeys: string[]) {
    if (!process.env.OPENROUTER_API_KEY) return null

    const prompt = `
System: You analyze connections between technical learning topics.
        Given a topic and its learning notes, find genuine conceptual relationships 
        to other topics in the curriculum. Not superficial — real technical overlap.
        Respond ONLY in JSON.

User:   Topic: ${topicKey} — ${topicLabel}
        User's notes: ${JSON.stringify(allIntelForTopic)}
        Full topic list: ${JSON.stringify(allTopicKeys)}
        
        Return exactly this JSON format: {
          "connections": [{
            "topicKey": "string",
            "reason": "one line: Both involve X mechanism",
            "strength": "strong" 
          }]
        }
        strength should be "strong" or "weak". Max 5 connections. Only include genuine technical relationships.
`

    try {
        const completion = await openRouter.chat.completions.create({
            messages: [{ role: 'system', content: prompt }],
            model: 'anthropic/claude-3-haiku',
            response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) return null
        return JSON.parse(content)
    } catch (e) {
        console.error("Shadow Engine (Connect) failed:", e)
        return null
    }
}
