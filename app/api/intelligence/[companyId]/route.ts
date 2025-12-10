import { NextRequest } from 'next/server';
import { getCompanyById } from '@/lib/supabase/companies';
import { mockPortfolio } from '@/lib/portfolio-mock-data';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    
    // Try to get company from Supabase first, fallback to mock
    let company = await getCompanyById(companyId);
    if (!company) {
      const mockCompany = mockPortfolio.find(c => c.id === companyId);
      if (!mockCompany) {
        return new Response(JSON.stringify({ error: 'Company not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      company = {
        id: mockCompany.id,
        name: mockCompany.name,
        sector: mockCompany.sector,
        stage: mockCompany.stage,
        website: mockCompany.website,
        description: mockCompany.description,
        logo_url: mockCompany.logo,
        investment_date: mockCompany.investmentDate.toISOString(),
        ownership_percent: mockCompany.ownershipPercent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Check if both API keys are configured
    const hasPerplexity = !!process.env.PERPLEXITY_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    if (!hasPerplexity || !hasOpenAI) {
      return new Response(
        JSON.stringify({
          success: false,
          mock: true,
          message: `Configure API keys in .env.local`,
          data: getMockIntelligence(company.name, company.sector),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // STEP 1: Gather intelligence using Perplexity
    const perplexityData = await gatherPerplexityIntelligence(company.name, company.sector);

    // STEP 2: Stream VC analysis using OpenAI via Vercel AI SDK
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert venture capital analyst helping a VC add strategic value to their portfolio companies. Focus on specific, actionable ways the investor can help beyond just providing capital - think intros, strategic advice, operational support, recruiting, and business development.'
        },
        {
          role: 'user',
          content: `Analyze ${company.name} (${company.sector}, ${company.stage}) based on this intelligence:

${perplexityData}

Provide a comprehensive VC report with:

**EXECUTIVE SUMMARY**
(2-3 sentences on overall company health, momentum, and biggest opportunity for VC to add value)

**INVESTOR CONFIDENCE SCORE: [0-100]/100**
Momentum: [Strong Positive/Positive/Mixed/Negative/Critical]

**FUNDING & FINANCIAL POSITION**
(Detailed analysis with specific numbers, dates, runway estimates, and funding needs)

💡 **How You Can Add Value:**
[Specific action: e.g., "Introduce to Series B co-investors from your network", "Help extend runway by connecting to revenue-focused strategic partners", "Share financial modeling templates from other portfolio companies"]

**PRODUCT & MARKET TRACTION**
(User growth, product launches, market position with metrics, and go-to-market challenges)

💡 **How You Can Add Value:**
[Specific action: e.g., "Connect to 3 enterprise customers in your network for pilot deals", "Share pricing strategy insights from similar SaaS exits", "Facilitate partnership with [complementary portfolio company]"]

**STRATEGIC DIRECTION & LEADERSHIP**
(Team changes, strategic pivots, competitive positioning, and organizational needs)

💡 **How You Can Add Value:**
[Specific action: e.g., "Share VP Engineering candidates from recent searches", "Introduce to experienced operators who scaled similar businesses", "Organize dinner with 2-3 founders who've navigated this pivot successfully"]

**KEY RISKS TO MONITOR**
• [Risk 1 - with specific metric to track]
• [Risk 2 - with specific metric to track]
• [Risk 3 - with specific metric to track]

**OPPORTUNITIES TO ACCELERATE**
• [Opportunity 1 - with specific way VC can help]
• [Opportunity 2 - with specific way VC can help]

**YOUR ACTION PLAN (This Week)**
1. [Specific action with clear deliverable]
2. [Specific action with clear deliverable]
3. [Specific action with clear deliverable]

Focus on concrete, high-impact ways the VC can add value through their network, expertise, and other portfolio companies.`
        }
      ],
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Intelligence API error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        mock: true
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Gather intelligence from Perplexity using chat completion
 */
async function gatherPerplexityIntelligence(
  companyName: string,
  sector: string
): Promise<string> {
  const perplexity = createOpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
  });

  const result = await streamText({
    model: perplexity('llama-3.1-sonar-large-128k-online'),
    messages: [
      {
        role: 'system',
        content: 'You are a research analyst gathering comprehensive intelligence about companies. Provide detailed, factual information with dates, numbers, and sources.'
      },
      {
        role: 'user',
        content: `Provide a comprehensive intelligence report on ${companyName} (${sector} sector). Include:

1. Recent funding rounds, investors, and valuation (last 12 months)
2. Major product launches, features, or pivots
3. Key executive hires, departures, or leadership changes
4. Customer wins, partnerships, or market expansion
5. Competitive landscape and market position
6. Any controversies, layoffs, or challenges
7. Growth metrics if publicly available (users, revenue, etc.)

Focus on events from 2024-2025. Be specific with dates and numbers.`
      }
    ],
    temperature: 0.2,
  });

  // Convert stream to text
  const chunks: string[] = [];
  for await (const chunk of result.textStream) {
    chunks.push(chunk);
  }
  
  return chunks.join('');
}

function getMockIntelligence(companyName: string, sector: string) {
  return {
    score: 72,
    momentum: 'positive',
    summary: `${companyName} shows healthy momentum in ${sector}. Configure Perplexity and OpenAI API keys for real-time intelligence.`,
    sections: [
      {
        title: 'Recent Developments',
        content: 'Mock data - configure API keys to unlock real intelligence.',
        action: 'Set up PERPLEXITY_API_KEY and OPENAI_API_KEY in .env.local',
        sentiment: 'neutral'
      }
    ],
    riskFactors: ['API keys not configured'],
    opportunities: ['Real-time intelligence available with API setup'],
    nextActions: ['Configure Perplexity API key', 'Configure OpenAI API key', 'Refresh intelligence']
  };
}

