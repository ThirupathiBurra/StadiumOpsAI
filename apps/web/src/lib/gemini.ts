import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// ─── Gemini Client Singleton ──────────────────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;

function getGenAIClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env['GEMINI_API_KEY'];
    console.log('[Gemini] Key prefix:', apiKey ? apiKey.substring(0, 10) : 'undefined');
    if (!apiKey) {
      // Don't throw at top-level so Next.js static build doesn't crash
      console.warn('GEMINI_API_KEY is not set. Gemini calls will fail.');
      genAI = new GoogleGenerativeAI('dummy_key_to_allow_build');
    } else {
      genAI = new GoogleGenerativeAI(apiKey);
    }
  }
  return genAI;
}

// ─── Default Generation Config ────────────────────────────────────────────────

const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  temperature: 0.3,      // Lower = more deterministic for ops decisions
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

// ─── Model Factory ────────────────────────────────────────────────────────────

export function getGeminiModel(
  modelName: string = 'gemini-2.5-flash',
  config: Partial<GenerationConfig> = {}
): GenerativeModel {
  return getGenAIClient().getGenerativeModel({
    model: modelName,
    generationConfig: { ...DEFAULT_GENERATION_CONFIG, ...config },
  });
}

// ─── System Prompts ───────────────────────────────────────────────────────────

export const SYSTEM_PROMPTS = {
  INCIDENT_ANALYSIS: `You are an AI operations assistant for a major stadium event with 29,800 attendees.
Your role is to analyze incidents and provide clear, actionable intelligence.
Always respond in structured JSON with keys: summary, severity_assessment, recommended_actions, risk_score (0-100).
Be concise. Stadium operations staff need fast, clear guidance.`,

  CROWD_INTELLIGENCE: `You are an AI crowd safety analyst for a stadium operations platform.
Analyze zone occupancy data and identify crowd surge risks.
Respond in JSON: { risk_level: 'low'|'medium'|'high'|'critical', analysis: string, recommended_actions: string[] }`,

  ROUTING: `You are an AI routing specialist for stadium emergency management.
Given zone statuses, recommend optimal evacuation paths and gate flow distribution.
Respond in JSON: { primary_route: string, alternate_routes: string[], gate_instructions: string[], estimated_clearance_minutes: number }`,

  AI_CONSOLE: `You are StadiumOps AI, an intelligent operations assistant for enterprise stadium management.
You have real-time access to zone occupancy, active incidents, and alert data.
Provide helpful, concise, actionable answers.
CRITICAL: Use rich Markdown formatting! Use **bolding** for emphasis, bullet points for lists, and keep paragraphs short. Make it look like a highly polished, professional AI response. Use plain language suitable for operations staff under pressure.`,
};

// ─── Utility: Generate JSON Response ─────────────────────────────────────────

export async function generateStructuredResponse<T>(
  prompt: string,
  systemPrompt: string
): Promise<T> {
  const model = getGeminiModel('gemini-2.5-flash', {
    responseMimeType: 'application/json',
  });

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: prompt },
  ]);

  const text = result.response.text();
  return JSON.parse(text) as T;
}
