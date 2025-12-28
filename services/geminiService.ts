
import { GoogleGenAI, Type } from "@google/genai";
import { GitHubStats, AIInsights } from "../types";

export const generateAIWrapped = async (stats: GitHubStats): Promise<AIInsights> => {
  // Always create instance inside the call to ensure latest API_KEY from environment is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this developer's GitHub activity for their "Year Wrapped" story.
    
    USER DATA:
    - Username: ${stats.username}
    - Total Commits: ${stats.totalCommits}
    - Active Days: ${stats.activeDays}
    - Top Languages: ${stats.topLanguages.map(l => l.name).join(', ')}
    - Repo Count: ${stats.reposContributed}
    - Streak: ${stats.streak} days
    - Peak Month: ${stats.mostActiveMonth}
    
    REQUIREMENTS:
    1. Select a compelling Archetype (e.g., The Architect, The Polisher, The Sprinter).
    2. Provide a 1-sentence poetic description of that archetype.
    3. Generate a cinematic 3-paragraph narrative about their year.
    4. Provide 3 specific observations ("insights").
    5. Provide 2 behavioral patterns.
    6. Provide 1 punchy card insight (max 12 words).
    
    TONE: Sophisticated, cinematic, tech-noir.
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};
