import { Handler } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

export const handler: Handler = async (event, context) => {
  // AEO: Initialize performance tracking
  let startTime = Date.now();
  let stats: any = null;
  let modelName: string = '';

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
    const requestData = JSON.parse(event.body || '{}');
    stats = requestData.stats;
    modelName = requestData.modelName;

    if (!stats) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing stats data' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // AEO: Performance monitoring
    startTime = Date.now();
    console.log('AEO: Starting AI analysis', {
      username: stats.username,
      model: modelName || 'gemini-3-flash-preview',
      totalCommits: stats.totalCommits,
      activeDays: stats.activeDays,
      analysisYear: stats.analysisYear || new Date().getFullYear()
    });

    // AEO: Dynamic year-aware prompt generation
    const currentYear = new Date().getFullYear();
    const analysisYear = stats.analysisYear || currentYear;
    const isCurrentYear = analysisYear === currentYear;
    const yearContext = isCurrentYear ? 
      `current ${analysisYear} activity (partial year data)` : 
      `complete ${analysisYear} development year`;

    // AEO: Enhanced context-aware prompt with dynamic insights
    const prompt = `
    You are an expert developer analyst creating a comprehensive "${analysisYear} Year Wrapped" report. Analyze this developer's GitHub activity with deep behavioral insights and forward-looking guidance.
    
    CRITICAL: Your response MUST be valid JSON. Escape all quotes within string values using \\" and replace newlines with \\n.
    
    ANALYSIS CONTEXT:
    - Target Year: ${analysisYear} (${yearContext})
    - Data Quality: ${isCurrentYear ? 'Partial year + GitHub API 90-day limitation' : 'Historical data with API limitations'}
    - Analysis Date: ${new Date().toISOString().split('T')[0]}
    
    DEVELOPER TELEMETRY:
    - Username: ${stats.username}
    - Total Contributions: ${stats.totalCommits} (commits, PRs, issues, reviews)
    - Active Development Days: ${stats.activeDays} days
    - Technology Stack: ${stats.topLanguages.map((l: any) => `${l.name} (${l.count} repos)`).join(', ')}
    - Repository Scope: ${stats.reposContributed} total repositories
    - Current Streak: ${stats.streak} consecutive days
    - Longest Streak: ${stats.longestStreak} days
    - Peak Activity Month: ${stats.mostActiveMonth}
    - Activity Pattern: ${stats.activityPattern}
    - Account Maturity: ${stats.accountAge} years on GitHub
    - Community Engagement: ${stats.followers} followers, ${stats.following} following
    - Stars Received: ${stats.totalStarsReceived} across all repositories
    - New Repositories: ${stats.reposCreatedThisYear} created in ${analysisYear}
    - Profile Context: ${stats.bio ? `"${stats.bio}"` : 'No bio'} | ${stats.company || 'No company'} | ${stats.location || 'No location'}
    
    ADVANCED BEHAVIORAL ANALYSIS:
    - Contribution Distribution: ${stats.contributionGrid ? stats.contributionGrid.map(m => `${m.month}: ${m.count} (level ${m.level})`).join(', ') : 'Not available'}
    - Recent Projects: ${stats.recentRepos.map(r => `${r.name} (${r.language}, ${r.stars} stars)`).join(', ')}
    
    JSON FORMAT REQUIREMENTS:
    - Use double quotes for all strings
    - Escape internal quotes with \\"
    - Replace line breaks with \\n\\n for paragraph breaks
    - No trailing commas
    - Ensure all brackets and braces are properly closed
    
    OUTPUT REQUIREMENTS (STRICT JSON FORMAT):
    {
      "archetype": "A compelling developer persona title",
      "archetypeDescription": "One poetic sentence defining their essence",
      "archetypeExplanation": {
        "reasoning": ["3 data-driven reasons for this archetype"],
        "keyFactors": [
          {"factor": "Specific behavioral trait", "evidence": "Concrete data point"},
          {"factor": "Development pattern", "evidence": "Supporting metric"},
          {"factor": "Technical characteristic", "evidence": "Quantified evidence"}
        ],
        "confidence": 0.85
      },
      "executiveSummary": "Two-sentence TL;DR of their ${analysisYear} development journey",
      "insights": [
        "Specific behavioral insight from their coding patterns",
        "Technical growth observation with data backing",
        "Collaboration or productivity insight"
      ],
      "patterns": [
        "High-level development rhythm or habit",
        "Technical or temporal pattern in their work"
      ],
      "narrative": "Three compelling paragraphs telling their ${analysisYear} story. Use \\n\\n between paragraphs. Make it personal, data-driven, and inspiring. Reference specific metrics and achievements.",
      "cardInsight": "Punchy 8-12 word quote perfect for social media sharing",
      "forwardLooking": {
        "recommendations": [
          "Actionable suggestion based on their patterns",
          "Growth opportunity aligned with their strengths",
          "Technical or career advancement recommendation"
        ],
        "risks": [
          "Potential burnout or stagnation risk to monitor",
          "Skill gap or development challenge to address"
        ],
        "opportunities": [
          "Emerging technology or domain to explore",
          "Community or collaboration opportunity"
        ]
      }
    }
    
    ARCHETYPE SELECTION LOGIC (Choose most fitting):
    - "The Architect": High repo breadth (15+) + consistent patterns + complex languages (TypeScript, Rust, Go)
    - "The Explorer": 4+ languages + diverse projects + experimental activity
    - "The Craftsperson": Deep focus + quality over quantity + refined tech stack
    - "The Collaborator": High social metrics + team repos + consistent contributions
    - "The Innovator": New repos created + cutting-edge stack + burst activity patterns
    - "The Maintainer": Long streaks (30+) + steady patterns + established projects
    - "The Specialist": Deep expertise in 1-2 languages + focused domain
    - "The Builder": High commit volume + multiple active projects + creation-focused
    - "The Contributor": Open source focus + community engagement + diverse contributions
    - "The Learner": Rapid skill acquisition + educational repos + growth trajectory
    
    QUALITY STANDARDS:
    - Use specific numbers and metrics in explanations
    - Make archetype feel earned and trustworthy
    - Ensure narrative flows naturally and tells a compelling story
    - Base all insights on actual data patterns
    - Keep recommendations actionable and personalized
    - Reference ${analysisYear} context throughout
    - CRITICAL: Ensure all text content is properly escaped for JSON
    
    TONE: Professional yet engaging, data-driven but human, celebratory of achievements while providing constructive guidance.
  `;

    // AEO: Advanced model configuration for optimal performance
    const response = await ai.models.generateContent({
      model: modelName || 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // AEO: Optimized generation parameters
        temperature: 0.7, // Balanced creativity vs consistency
        topK: 40, // Focused vocabulary selection
        topP: 0.9, // High-quality token sampling
        maxOutputTokens: 4096, // Sufficient for detailed analysis
        candidateCount: 1, // Single high-quality response
        stopSequences: [], // No early stopping
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING },
            archetypeDescription: { type: Type.STRING },
            archetypeExplanation: {
              type: Type.OBJECT,
              properties: {
                reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyFactors: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      factor: { type: Type.STRING },
                      evidence: { type: Type.STRING }
                    }
                  }
                },
                confidence: { type: Type.NUMBER }
              }
            },
            executiveSummary: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            narrative: { type: Type.STRING },
            cardInsight: { type: Type.STRING },
            forwardLooking: {
              type: Type.OBJECT,
              properties: {
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ['archetype', 'archetypeDescription', 'archetypeExplanation', 'executiveSummary', 'insights', 'patterns', 'narrative', 'cardInsight', 'forwardLooking'],
        },
      },
    });

    if (!response.text) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GEMINI_NULL_TRACE: The intelligence core returned an empty narrative.' }),
      };
    }

    // AEO: Performance logging and quality validation
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log('AEO: AI analysis completed', {
      username: stats.username,
      processingTimeMs: processingTime,
      responseLength: response.text.length,
      model: modelName || 'gemini-3-flash-preview'
    });

    // AEO: Enhanced JSON validation and sanitization
    let sanitizedResponse: string;
    try {
      // First, try to parse the response as-is
      const parsedResponse = JSON.parse(response.text);
      
      // Validate required fields
      if (!parsedResponse.archetype || !parsedResponse.narrative || !parsedResponse.forwardLooking) {
        console.warn('AEO: Response quality issue - missing required fields');
      }
      
      // Re-stringify to ensure clean JSON
      sanitizedResponse = JSON.stringify(parsedResponse);
      
    } catch (parseError: any) {
      console.error('AEO: JSON parsing failed, attempting repair:', {
        error: parseError.message,
        position: parseError.message.match(/position (\d+)/)?.[1],
        responseLength: response.text.length,
        username: stats.username
      });
      
      // Attempt to repair common JSON issues
      let repairedText = response.text;
      
      // Fix common issues with unescaped quotes in strings
      repairedText = repairedText.replace(/(?<!\\)"/g, (match, offset, string) => {
        // Check if this quote is inside a string value (not a key or structural quote)
        const beforeQuote = string.substring(0, offset);
        const colonCount = (beforeQuote.match(/:/g) || []).length;
        const openBraceCount = (beforeQuote.match(/{/g) || []).length;
        const closeBraceCount = (beforeQuote.match(/}/g) || []).length;
        const openBracketCount = (beforeQuote.match(/\[/g) || []).length;
        const closeBracketCount = (beforeQuote.match(/]/g) || []).length;
        
        // If we're likely inside a string value, escape the quote
        if (colonCount > openBraceCount - closeBraceCount + openBracketCount - closeBracketCount) {
          return '\\"';
        }
        return match;
      });
      
      // Fix unescaped newlines in strings
      repairedText = repairedText.replace(/\n(?=.*")/g, '\\n');
      
      try {
        const repairedResponse = JSON.parse(repairedText);
        sanitizedResponse = JSON.stringify(repairedResponse);
        console.log('AEO: JSON repair successful');
      } catch (repairError) {
        console.error('AEO: JSON repair failed, returning error response');
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Processing-Time': processingTime.toString(),
            'X-AI-Model': modelName || 'gemini-3-flash-preview',
          },
          body: JSON.stringify({ 
            error: `GEMINI_JSON_MALFORMED: ${parseError.message}. The AI response contained invalid JSON structure.` 
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        // AEO: Performance headers for monitoring
        'X-Processing-Time': processingTime.toString(),
        'X-AI-Model': modelName || 'gemini-3-flash-preview',
      },
      body: sanitizedResponse,
    };
  } catch (error: any) {
    // AEO: Enhanced error logging and analysis
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.error('AEO: Gemini API Error', {
      error: error.message,
      username: stats?.username || 'unknown',
      model: modelName || 'gemini-3-flash-preview',
      processingTimeMs: processingTime,
      errorType: error.name || 'Unknown',
      stack: error.stack
    });
    
    const errorMessage = error.message || '';

    let statusCode = 500;
    let errorResponse = `GEMINI_INTERNAL_ERROR: ${errorMessage || 'Session failed to initialize.'}`;

    // AEO: Enhanced error classification and handling
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('key') || errorMessage.includes('401')) {
      statusCode = 401;
      errorResponse = 'GEMINI_AUTH_INVALID: The API Key is unauthorized. Please check Netlify environment variables.';
    } else if (errorMessage.includes('429') || errorMessage.includes('QUOTA') || errorMessage.includes('rate limit')) {
      statusCode = 429;
      errorResponse = 'GEMINI_RATE_LIMIT: Model quota exceeded. Please wait a few seconds before retrying.';
    } else if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
      statusCode = 400;
      errorResponse = 'GEMINI_SAFETY_BLOCK: The intelligence core filtered this user\'s profile content for safety.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      statusCode = 408;
      errorResponse = 'GEMINI_TIMEOUT: AI analysis timed out. Please try again with a simpler request.';
    } else if (errorMessage.includes('token') || errorMessage.includes('length')) {
      statusCode = 413;
      errorResponse = 'GEMINI_TOKEN_LIMIT: Request too large. Please try with fewer repositories or simpler data.';
    }

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // AEO: Error diagnostic headers
        'X-Error-Type': error.name || 'Unknown',
        'X-Processing-Time': processingTime.toString(),
        'X-AI-Model': modelName || 'gemini-3-flash-preview',
      },
      body: JSON.stringify({ error: errorResponse }),
    };
  }
};


