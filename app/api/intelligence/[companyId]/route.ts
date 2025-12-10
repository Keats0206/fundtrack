import { NextRequest, NextResponse } from 'next/server';
import { getCompanyIntelligence } from '@/lib/perplexity-api';
import { mockPortfolio } from '@/lib/portfolio-mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const company = mockPortfolio.find(c => c.id === companyId);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if Perplexity API key is configured
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json({
        success: false,
        mock: true,
        message: 'Perplexity API key not configured. Using mock data.',
        data: getMockIntelligence(company.name),
      });
    }

    // Fetch real intelligence from Perplexity
    const intelligence = await getCompanyIntelligence(company.name);

    return NextResponse.json({
      success: true,
      mock: false,
      data: intelligence,
    });
  } catch (error) {
    console.error('Intelligence API error:', error);
    
    // Fallback to mock data on error
    const { companyId: id } = await params;
    const company = mockPortfolio.find(c => c.id === id);
    return NextResponse.json({
      success: false,
      mock: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: company ? getMockIntelligence(company.name) : null,
    });
  }
}

function getMockIntelligence(companyName: string) {
  return {
    company: companyName,
    news: [
      {
        title: `${companyName} announces major product update`,
        url: 'https://example.com',
        snippet: 'Mock news result - configure Perplexity API key for real data',
        date: new Date().toISOString(),
      },
    ],
    funding: [],
    competitors: [],
    general: [],
  };
}

