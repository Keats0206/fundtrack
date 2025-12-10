import OpenAI from 'openai';

export interface VCIntelligenceReport {
  score: number;
  momentum: 'strong_positive' | 'positive' | 'mixed' | 'negative' | 'critical';
  summary: string;
  sections: IntelligenceSection[];
  riskFactors: string[];
  opportunities: string[];
  nextActions: string[];
}

export interface IntelligenceSection {
  title: string;
  content: string;
  action: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Analyze Perplexity intelligence using OpenAI for VC-specific insights
 */
export async function analyzeWithOpenAI(
  companyName: string,
  sector: string,
  stage: string,
  perplexityData: string
): Promise<VCIntelligenceReport> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `You are a venture capital analyst. Analyze the following intelligence about ${companyName} (${sector}, ${stage}) and provide a structured VC-focused report.

INTELLIGENCE DATA:
${perplexityData}

Provide your analysis in the following JSON structure:
{
  "score": <0-100 investor confidence score>,
  "momentum": "<strong_positive|positive|mixed|negative|critical>",
  "summary": "<2-3 sentence executive summary>",
  "sections": [
    {
      "title": "Funding and Financial Position",
      "content": "<detailed analysis>",
      "action": "<specific investor action item>",
      "sentiment": "<positive|neutral|negative>"
    },
    {
      "title": "Product and Market Traction",
      "content": "<detailed analysis>",
      "action": "<specific investor action item>",
      "sentiment": "<positive|neutral|negative>"
    },
    {
      "title": "Strategic Direction and Leadership",
      "content": "<detailed analysis>",
      "action": "<specific investor action item>",
      "sentiment": "<positive|neutral|negative>"
    }
  ],
  "riskFactors": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "nextActions": ["<action 1>", "<action 2>", "<action 3>"]
}

Focus on:
- Specific metrics, numbers, and dates
- Competitive positioning and market dynamics
- Burn rate, runway, and funding needs
- Key hires/departures and organizational health
- Product milestones and user traction
- Strategic risks and opportunities
- Concrete action items for the investor

Be direct, data-driven, and actionable. Use VC language.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert venture capital analyst who synthesizes market intelligence into actionable investment insights. You provide structured, data-driven analysis with specific recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result) as VCIntelligenceReport;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
}

/**
 * Generate follow-up questions based on the intelligence
 */
export async function generateFollowUpQuestions(
  companyName: string,
  intelligence: VCIntelligenceReport
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return [];
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a VC analyst generating smart follow-up questions based on intelligence reports.'
        },
        {
          role: 'user',
          content: `Based on this intelligence about ${companyName}, suggest 3 critical questions the investor should investigate next:\n\n${JSON.stringify(intelligence, null, 2)}`
        }
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) return [];

    // Parse numbered list
    return result
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error('Follow-up questions error:', error);
    return [];
  }
}

