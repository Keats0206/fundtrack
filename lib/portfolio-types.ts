export interface PortfolioCompany {
  id: string;
  name: string;
  logo: string;
  stage: 'Pre-seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C+';
  sector: string;
  investmentDate: Date;
  ownershipPercent: number;
  website: string;
  description: string;
  healthScore: number; // 0-100
  lastUpdate: Date;
}

export interface CompanyUpdate {
  id: string;
  companyId: string;
  companyName: string;
  type: 'news' | 'funding' | 'product' | 'hiring' | 'market';
  title: string;
  summary: string;
  source: string;
  date: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface PortfolioMetrics {
  totalCompanies: number;
  totalInvested: number;
  avgHealthScore: number;
  activeAlerts: number;
}

