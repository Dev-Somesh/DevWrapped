
import { GoogleGenAI, Type } from "@google/genai";
import { GitHubStats, AIInsights } from "../types";

export const generateAIWrapped = async (stats: GitHubStats): Promise<AIInsights> => {
  // Always create a new instance inside the call to ensure the latest API key is used
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
    1. archetype: A bold developer persona (e.g., The Midnight Architect).
    2. archetypeDescription: A poetic 1-sentence definition.
    3. insights: 3 specific behavioral traces from their code activity.
    4. patterns: 2 high-level development rhythms detected.
    5. narrative: A 3-paragraph cinematic story of their journey.
    6. cardInsight: A punchy 10-word quote for social sharing.
    
    TONE: Professional, sophisticated, narrative-first.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    if (!response.text) throw new Error("AI core returned empty trace");
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Core Error:", error);
    // Bubble up a clear message for the UI to handle key reset
    throw new Error(error.message || "Session invalid. Please verify your API key.");
  }
};
