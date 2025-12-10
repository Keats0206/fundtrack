export interface Person {
  id: string;
  name: string;
  currentTitle: string;
  previousTitle?: string;
  company: string;
  previousCompany?: string;
  location: string;
  linkedinUrl: string;
  avatarUrl: string;
  lastUpdated: Date;
  isSaved: boolean;
  stealthIndicators: string[];
}

export interface SearchQuery {
  company?: string;
  previousCompany?: string;
  role?: string;
  stealthSignals?: string[];
}

