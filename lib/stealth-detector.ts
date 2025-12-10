import { Person } from './simple-types';

// Keywords that indicate someone might be going stealth
const STEALTH_TITLE_KEYWORDS = [
  'building',
  'stealth',
  'founder',
  'co-founder',
  'exploring',
  'working on something',
  'new venture',
  'startup',
  'entrepreneur',
  'building in',
  'something new',
  'independent',
  'consulting', // Often used as cover
  'advisor', // Sometimes used temporarily
];

const STEALTH_COMPANY_KEYWORDS = [
  'stealth',
  'confidential',
  'independent',
  'self-employed',
  'freelance',
  'consulting',
  'stealth startup',
  'stealth mode',
];

// Major companies people typically leave to start something
const NOTABLE_COMPANIES = [
  'coinbase',
  'stripe',
  'uber',
  'airbnb',
  'meta',
  'facebook',
  'google',
  'apple',
  'amazon',
  'microsoft',
  'openai',
  'anthropic',
  'netflix',
  'spotify',
  'snapchat',
  'twitter',
  'tesla',
  'spacex',
];

export interface StealthAnalysis {
  stealthScore: number; // 0-100
  stealthIndicators: string[];
  isStealthCandidate: boolean;
}

/**
 * Analyze a person's profile for stealth startup indicators
 */
export function detectStealthSignals(person: Partial<Person>): StealthAnalysis {
  const indicators: string[] = [];
  let score = 0;

  const currentTitle = (person.currentTitle || '').toLowerCase();
  const currentCompany = (person.company || '').toLowerCase();
  const previousTitle = (person.previousTitle || '').toLowerCase();
  const previousCompany = (person.previousCompany || '').toLowerCase();

  // Check current title for stealth keywords
  STEALTH_TITLE_KEYWORDS.forEach((keyword) => {
    if (currentTitle.includes(keyword)) {
      score += 15;
      indicators.push(`Title contains "${keyword}"`);
    }
  });

  // Check current company for stealth indicators
  STEALTH_COMPANY_KEYWORDS.forEach((keyword) => {
    if (currentCompany.includes(keyword)) {
      score += 20;
      indicators.push(`Company listed as "${keyword}"`);
    }
  });

  // Check if they left a notable company
  const leftNotableCompany = NOTABLE_COMPANIES.some((company) =>
    previousCompany.includes(company)
  );

  if (leftNotableCompany) {
    score += 10;
    indicators.push(`Recently left ${person.previousCompany}`);
  }

  // Check for title change that suggests founding
  const titleIndicatesFounder =
    currentTitle.includes('founder') || currentTitle.includes('ceo');
  const wasEmployee =
    previousTitle.includes('engineer') ||
    previousTitle.includes('manager') ||
    previousTitle.includes('director') ||
    previousTitle.includes('vp') ||
    previousTitle.includes('head of');

  if (titleIndicatesFounder && wasEmployee) {
    score += 25;
    indicators.push('Changed from employee role to founder');
  }

  // Check for vague/generic new title (often indicates stealth)
  const vagueKeywords = [
    'exploring',
    'working on',
    'building something',
    'entrepreneur',
  ];
  const hasVagueTitle = vagueKeywords.some((keyword) =>
    currentTitle.includes(keyword)
  );

  if (hasVagueTitle) {
    score += 15;
    indicators.push('Vague new title suggests stealth mode');
  }

  // Senior role at notable company -> stealth is high signal
  const wasSenior =
    previousTitle.includes('vp') ||
    previousTitle.includes('director') ||
    previousTitle.includes('head of') ||
    previousTitle.includes('principal') ||
    previousTitle.includes('staff');

  if (wasSenior && leftNotableCompany && indicators.length > 0) {
    score += 20;
    indicators.push('Senior leader from top company now in stealth');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Remove duplicates from indicators
  const uniqueIndicators = Array.from(new Set(indicators));

  return {
    stealthScore: score,
    stealthIndicators: uniqueIndicators,
    isStealthCandidate: score >= 30 && uniqueIndicators.length >= 2,
  };
}

/**
 * Sort profiles by stealth score
 */
export function sortByStealthScore(profiles: Person[]): Person[] {
  return [...profiles].sort((a, b) => {
    const scoreA = detectStealthSignals(a).stealthScore;
    const scoreB = detectStealthSignals(b).stealthScore;
    return scoreB - scoreA;
  });
}

/**
 * Filter profiles to only stealth candidates
 */
export function filterStealthCandidates(profiles: Person[]): Person[] {
  return profiles.filter((profile) => {
    const analysis = detectStealthSignals(profile);
    return analysis.isStealthCandidate;
  });
}

