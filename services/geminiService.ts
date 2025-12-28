
import { GoogleGenAI, Type } from "@google/genai";
import { GitHubStats, AIInsights } from "../types";

export const generateAIWrapped = async (stats: GitHubStats, modelName: string = "gemini-3-flash-preview"): Promise<AIInsights> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this developer's 2024-2025 GitHub activity. Create a cinematic "Year Wrapped" narrative.
    
    DEVELOPER TELEMETRY:
    - User: ${stats.username}
    - Contributions: ${stats.totalCommits}
    - Active Span: ${stats.activeDays} days
    - Focus Stack: ${stats.topLanguages.map(l => l.name).join(', ')}
    - Scope: ${stats.reposContributed} repositories
    - Momentum: ${stats.streak} day streak
    - Seasonality: Peak work in ${stats.mostActiveMonth}
    
    OUTPUT SCHEMA (JSON ONLY):
    1. archetype: A bold developer persona.
    2. archetypeDescription: A poetic 1-sentence definition.
    3. insights: 3 specific behavioral traces from their code activity.
    4. patterns: 2 high-level development rhythms detected.
    5. narrative: A 3-paragraph cinematic story of their journey.
    6. cardInsight: A punchy 10-word quote for social sharing.
    
    TONE: Professional, sophisticated, narrative-first.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING },
            archetypeDescription: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            narrative: { type: Type.STRING },
            cardInsight: { type: Type.STRING }
          },
          required: ["archetype", "archetypeDescription", "insights", "patterns", "narrative", "cardInsight"]
        }
      }
    });

    if (!response.text) {
      throw new Error("GEMINI_NULL_TRACE: The intelligence core returned an empty narrative.");
    }
    
    return JSON.parse(response.text);
  } catch (error: any) {
    // Advanced error classification for Gemini
    const errorMessage = error.message || "";
    
    if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("key")) {
      throw new Error("GEMINI_AUTH_INVALID: The provided API Key is unauthorized. Please verify your session key.");
    }
    if (errorMessage.includes("429") || errorMessage.includes("QUOTA")) {
      throw new Error("GEMINI_RATE_LIMIT: Model quota exceeded. Please wait a few seconds before retrying.");
    }
    if (errorMessage.includes("SAFETY")) {
      throw new Error("GEMINI_SAFETY_BLOCK: The intelligence core filtered this user's profile content for safety.");
    }
    
    throw new Error(`GEMINI_INTERNAL_ERROR: ${errorMessage || 'Session failed to initialize.'}`);
  }
};
