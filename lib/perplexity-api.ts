import { Perplexity } from 'perplexityai';

export interface CompanyIntelligence {
  company: string;
  news: SearchResult[];
  funding: SearchResult[];
  competitors: SearchResult[];
  general: SearchResult[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

/**
 * Get comprehensive intelligence about a company using Perplexity AI
 */
export async function getCompanyIntelligence(
  companyName: string
): Promise<CompanyIntelligence> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const client = new Perplexity({ apiKey });

  try {
    // Multi-query search for different intelligence types
    const search = await client.search.create({
      query: [
        `${companyName} latest news announcements 2024`,
        `${companyName} funding investment rounds recent`,
        `${companyName} competitors market landscape`,
        `${companyName} company updates product launches`,
      ],
      max_results: 5,
      max_tokens_per_page: 1024,
      search_domain_filter: [
        'techcrunch.com',
        'bloomberg.com',
        'reuters.com',
        'theinformation.com',
        'crunchbase.com',
        'forbes.com',
      ],
    });

    const [news, funding, competitors, general] = search.results;

    return {
      company: companyName,
      news: formatResults(news),
      funding: formatResults(funding),
      competitors: formatResults(competitors),
      general: formatResults(general),
    };
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw error;
  }
}

/**
 * Quick search for company news
 */
export async function searchCompanyNews(
  companyName: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const client = new Perplexity({ apiKey });

  try {
    const search = await client.search.create({
      query: `${companyName} news updates announcements`,
      max_results: maxResults,
      max_tokens_per_page: 512,
    });

    return formatResults(search.results);
  } catch (error) {
    console.error('Perplexity search error:', error);
    return [];
  }
}

/**
 * Search for funding and investment news
 */
export async function searchFundingNews(
  companyName: string
): Promise<SearchResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return [];
  }

  const client = new Perplexity({ apiKey });

  try {
    const search = await client.search.create({
      query: `${companyName} funding investment series raise capital`,
      max_results: 5,
      max_tokens_per_page: 1024,
      search_domain_filter: ['crunchbase.com', 'techcrunch.com', 'bloomberg.com'],
    });

    return formatResults(search.results);
  } catch (error) {
    console.error('Funding search error:', error);
    return [];
  }
}

/**
 * Get competitive intelligence
 */
export async function searchCompetitors(
  companyName: string,
  sector: string
): Promise<SearchResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return [];
  }

  const client = new Perplexity({ apiKey });

  try {
    const search = await client.search.create({
      query: `${companyName} competitors ${sector} market landscape alternatives`,
      max_results: 8,
      max_tokens_per_page: 1024,
    });

    return formatResults(search.results);
  } catch (error) {
    console.error('Competitor search error:', error);
    return [];
  }
}

/**
 * Format Perplexity results to our SearchResult type
 */
function formatResults(results: any): SearchResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((result: any) => ({
    title: result.title || '',
    url: result.url || '',
    snippet: result.snippet || result.content || '',
    date: result.date || undefined,
  }));
}

