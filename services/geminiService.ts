
import { GoogleGenAI, Type } from "@google/genai";
import { GitHubStats, AIInsights } from "../types";

export const generateAIWrapped = async (stats: GitHubStats): Promise<AIInsights> => {
  // We create a fresh instance to ensure it picks up whichever key is active in the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this developer's 2024-2025 GitHub activity. Create an artistic, cinematic "Year Wrapped" story.
    
    DEVELOPER CONTEXT:
    - User: ${stats.username}
    - Commits: ${stats.totalCommits}
    - Engagement: ${stats.activeDays} days active
    - Languages: ${stats.topLanguages.map(l => l.name).join(', ')}
    - Scope: ${stats.reposContributed} repositories
    - Discipline: ${stats.streak} day streak
    - Seasonality: Most active in ${stats.mostActiveMonth}
    
    RESPONSE ARCHITECTURE (JSON ONLY):
    1. archetype: A high-impact title (e.g., The Midnight Architect).
    2. archetypeDescription: A poetic 1-sentence definition.
    3. insights: 3 specific behavioral observations based on their tech/activity.
    4. patterns: 2 high-level development rhythms detected.
    5. narrative: A 3-paragraph cinematic summary of their growth.
    6. cardInsight: A punchy, sharable 1-line quote (max 10 words).
    
    TONE: Professional, sophisticated, narrative-driven.
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
    throw new Error(error.message || "Failed to generate AI insights. Verify your API key status.");
  }
};
