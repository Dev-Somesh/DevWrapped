import { Handler } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get API key from environment variable (set in Netlify)
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Gemini proxy: API key present:', !!apiKey);
  console.log('Gemini proxy: API key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'GEMINI_CONFIG_ERROR: GEMINI_API_KEY is not configured in Netlify environment variables.' }),
    };
  }

  try {
    const { stats, modelName } = JSON.parse(event.body || '{}');

    if (!stats) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing stats data' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Analyze this developer's 2024-2025 GitHub activity. Create a cinematic "Year Wrapped" narrative.
    
    DEVELOPER TELEMETRY:
    - User: ${stats.username}
    - Contributions: ${stats.totalCommits}
    - Active Span: ${stats.activeDays} days
    - Focus Stack: ${stats.topLanguages.map((l: any) => l.name).join(', ')}
    - Scope: ${stats.reposContributed} repositories
    - Momentum: ${stats.streak} day streak
    - Seasonality: Peak work in ${stats.mostActiveMonth}
    
    OUTPUT SCHEMA (JSON ONLY):
    1. archetype: A bold developer persona.
    2. archetypeDescription: A poetic 1-sentence definition.
    3. insights: 3 specific behavioral traces from their code activity.
    4. patterns: 2 high-level development rhythms detected.
    5. narrative: A well-formatted 3-paragraph story with line breaks. Include specific numbers like ${stats.totalCommits} contributions, ${stats.activeDays} active days, ${stats.streak} day streak, and mention ${stats.topLanguages[0]?.name || 'their primary language'}. Format with proper paragraph breaks using \\n\\n between paragraphs.
    6. cardInsight: A punchy 10-word quote for social sharing.
    
    FORMATTING REQUIREMENTS for narrative:
    - Use \\n\\n to separate paragraphs
    - Include specific data points: @${stats.username}, ${stats.totalCommits} contributions, ${stats.activeDays} days, ${stats.streak} streak
    - Mention primary language: ${stats.topLanguages[0]?.name || 'JavaScript'}
    - Make it personal and engaging
    
    TONE: Professional, sophisticated, narrative-first with data integration.
  `;

    const response = await ai.models.generateContent({
      model: modelName || 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING },
            archetypeDescription: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            narrative: { type: Type.STRING },
            cardInsight: { type: Type.STRING },
          },
          required: ['archetype', 'archetypeDescription', 'insights', 'patterns', 'narrative', 'cardInsight'],
        },
      },
    });

    if (!response.text) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GEMINI_NULL_TRACE: The intelligence core returned an empty narrative.' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: response.text,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMessage = error.message || '';

    let statusCode = 500;
    let errorResponse = `GEMINI_INTERNAL_ERROR: ${errorMessage || 'Session failed to initialize.'}`;

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('key') || errorMessage.includes('401')) {
      statusCode = 401;
      errorResponse = 'GEMINI_AUTH_INVALID: The API Key is unauthorized. Please check Netlify environment variables.';
    } else if (errorMessage.includes('429') || errorMessage.includes('QUOTA')) {
      statusCode = 429;
      errorResponse = 'GEMINI_RATE_LIMIT: Model quota exceeded. Please wait a few seconds before retrying.';
    } else if (errorMessage.includes('SAFETY')) {
      statusCode = 400;
      errorResponse = 'GEMINI_SAFETY_BLOCK: The intelligence core filtered this user\'s profile content for safety.';
    }

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: errorResponse }),
    };
  }
};


