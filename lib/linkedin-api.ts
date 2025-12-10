// LinkedIn API integration via RapidAPI

export interface LinkedInProfile {
  fullName: string;
  headline: string;
  summary: string;
  profilePicture: string;
  location: string;
  profileURL: string;
  username: string;
}

export interface CompanySearchParams {
  company: string;
  role?: string;
  location?: string;
  limit?: number;
}

export interface LinkedInAPIResponse {
  data: LinkedInProfile[];
  success: boolean;
  message?: string;
}

/**
 * Search for employees of a company via RapidAPI
 */
export async function searchCompanyEmployees(
  params: CompanySearchParams
): Promise<LinkedInAPIResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  try {
    // Use the "Search People" endpoint from RapidAPI LinkedIn Data API
    const url = 'https://linkedin-data-api.p.rapidapi.com/search-people';
    
    // Build search query - search for people who worked at the company
    let searchQuery = `${params.company}`;
    if (params.role) {
      searchQuery += ` ${params.role}`;
    }
    
    const queryParams = new URLSearchParams({
      keywords: searchQuery,
      ...(params.location && { location: params.location }),
    });

    console.log('Calling LinkedIn API:', `${url}?${queryParams}`);

    const response = await fetch(`${url}?${queryParams}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    console.log('LinkedIn API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn API Error Response:', errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('LinkedIn API Response:', JSON.stringify(result).substring(0, 500));
    
    // Extract items from the response
    const profiles = result.data?.items || [];
    
    return {
      data: Array.isArray(profiles) ? profiles : [],
      success: true,
    };
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return {
      data: [],
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get detailed profile information
 */
export async function getPersonProfile(
  profileUrl: string
): Promise<LinkedInProfile | null> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  try {
    const url = 'https://linkedin-data-api.p.rapidapi.com/get-profile';
    
    const response = await fetch(`${url}?url=${encodeURIComponent(profileUrl)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('LinkedIn profile fetch error:', error);
    return null;
  }
}

/**
 * Parse company info from headline or summary
 * Examples:
 * - "President at Max Borges Agency" -> company: "Max Borges Agency"
 * - "Co Founder @ Lofty" -> company: "Lofty"
 * - "Current: President at Max Borges Agency" -> company: "Max Borges Agency"
 * - "Past: ..., PEO at Max Brackett Technology" -> previousCompany: "Max Brackett Technology"
 */
function parseCompanyInfo(headline: string, summary: string) {
  let currentCompany = '';
  let currentTitle = headline;
  let previousCompany = '';
  let previousTitle = '';

  // Extract current company from headline
  const atMatch = headline.match(/(?:at|@)\s+([^|,]+)/i);
  if (atMatch) {
    currentCompany = atMatch[1].trim();
    currentTitle = headline.split(/(?:at|@)/i)[0].trim();
  }

  // Check summary for previous company info
  const pastMatch = summary.match(/Past:.*?(?:at|@)\s+([^,\n]+)/i);
  if (pastMatch) {
    previousCompany = pastMatch[1].trim();
  }

  return { currentCompany, currentTitle, previousCompany, previousTitle };
}

/**
 * Transform LinkedIn API response to our internal Person type
 */
export function transformLinkedInProfile(profile: LinkedInProfile) {
  const { currentCompany, currentTitle, previousCompany } = parseCompanyInfo(
    profile.headline,
    profile.summary
  );
  
  return {
    id: profile.profileURL,
    name: profile.fullName,
    currentTitle: currentTitle || profile.headline || 'No title',
    previousTitle: undefined, // Would need more detailed profile data
    company: currentCompany || 'Unknown',
    previousCompany: previousCompany || undefined,
    location: profile.location || 'Unknown',
    linkedinUrl: profile.profileURL,
    avatarUrl: profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`,
    lastUpdated: new Date(),
    isSaved: false,
    stealthIndicators: [],
  };
}

