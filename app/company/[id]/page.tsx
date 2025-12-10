'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCompanyById } from '@/lib/supabase/companies';
import { getAlerts } from '@/lib/supabase/alerts-client';
import { getInsights } from '@/lib/supabase/insights-client';
import type { Database } from '@/lib/supabase';
import { IntelligenceMarkdown } from '@/components/intelligence-markdown';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Company = Database['public']['Tables']['companies']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];
type Insight = Database['public']['Tables']['insights']['Row'];

// Enhanced Perplexity-style intelligence reports
function generateMockIntelligence(companyName: string, sector: string) {
  const intelligenceByCompany: Record<string, any> = {
    'Mythical Games': {
      score: 78,
      momentum: 'positive',
      summary: 'Mythical Games is in the middle of a new funding and product expansion push, centered on web3 identity and an overhaul of its flagship titles like NFL Rivals.',
      sections: [
        {
          title: 'Funding and Strategic Moves',
          content: 'Mythical is closing a new Series D funding round in October 2025, with investors including Eightco Holdings, which is connected to the Worldcoin (WLD) ecosystem. As part of this round, the company plans to integrate verified human identity and "proof of human" systems (via Worldcoin tech) into its web3 gaming platform to address bots, fraud, and account sharing. Public data puts Mythical\'s historical funding at over $280 million prior to this round, with backers such as a16z, WestCap, and others.',
          action: 'Monitor dilution impact and assess if bridge financing is needed before Series D close. Strong investor syndicate signals continued conviction.'
        },
        {
          title: 'Product and Game Updates',
          content: 'NFL Rivals, Mythical\'s licensed NFL web3 mobile game, hit roughly 6-7 million downloads but saw growth plateau as the game became too pay-to-win, leading the team to stop heavy marketing and rework core systems. For Year 3 (Season 3) launching August 20, Mythical is doing a soft "reset" of progression: wiping base cards, introducing locked launch-set cards (800+ new cards across all 32 teams), and revamping the upgrade and league systems to make onboarding and competitiveness fairer for new players.',
          action: 'Evaluate user retention metrics post-reset. Consider introducing portfolio to NFL partnerships team for cross-promotion opportunities.'
        },
        {
          title: 'Strategic Direction',
          content: 'The Worldcoin identity integration signals a bet that "proof of human" will become a differentiator in web3 games, especially for economies that rely on scarcity and tradeable assets. Mythical is positioning itself as an infrastructure-plus-IP player: running its own web3 platform, using sports and entertainment brands (like the NFL) as flagship showcases, and layering in on-chain identity and marketplaces for tradable in-game assets.',
          action: 'Connect team with web3 infrastructure portfolio companies (Alchemy, Figment) for potential partnership synergies. Assess if platform play warrants higher valuation multiple.'
        }
      ]
    },
    'Superhuman': {
      score: 85,
      momentum: 'strong_positive',
      summary: 'Superhuman continues to show strong enterprise momentum with new team features and AI capabilities, positioning for a potential Series C in H1 2026.',
      sections: [
        {
          title: 'Product and Market Position',
          content: 'Superhuman recently launched AI-powered email triage and auto-responses, seeing 40% adoption among power users within first month. The team product (launched Q3 2024) now represents 35% of revenue, up from 15% at launch. Enterprise deals ($100K+ ACV) grew 200% YoY, with notable wins at Stripe, Notion, and several portfolio companies.',
          action: 'Facilitate introductions to remaining portfolio companies for enterprise pilots. Strong product-market fit in knowledge worker segment.'
        },
        {
          title: 'Competitive Dynamics',
          content: 'Gmail and Outlook are both shipping AI features, but Superhuman maintains edge in speed and design. New competitor Shortwave (YC S22) raised $12M Series A but still <50K users vs Superhuman\'s 500K+. Market is expanding rather than fragmenting—premium email tools growing 45% annually.',
          action: 'Not immediate threat, but monitor Shortwave\'s enterprise push. Consider strategic partnership or acqui-hire if team is strong.'
        },
        {
          title: 'Funding and Growth',
          content: 'Burn rate improved 30% while maintaining 3x net revenue retention. Company is default alive but likely to raise Series C in H1 2026 to accelerate enterprise sales hiring. Current valuation estimates at $500-700M based on comparable SaaS multiples.',
          action: 'Prepare for pro-rata allocation in Series C. Consider increasing ownership given strong unit economics and clear path to $100M ARR.'
        }
      ]
    },
    'Stability AI': {
      score: 62,
      momentum: 'mixed',
      summary: 'Stability AI is navigating leadership transition and market competition while shipping new models and pursuing enterprise pivot.',
      sections: [
        {
          title: 'Leadership and Strategic Changes',
          content: 'Emad Mostaque stepped down as CEO in March 2024, replaced by interim co-CEOs from COO and CPO roles. Company is conducting formal CEO search while refocusing on enterprise licensing and away from consumer products. Several key researchers departed to Anthropic and OpenAI in Q2 2024.',
          action: 'Schedule board meeting to assess CEO search progress. Evaluate talent retention strategies and consider bridge compensation packages for key technical leads.'
        },
        {
          title: 'Product and Technology',
          content: 'Stable Diffusion 3 launched in June 2024 with strong improvements in text rendering and composition, but adoption slower than SD 2.0 due to licensing changes. New video model (Stable Video Diffusion) gaining traction in creative tools market. API revenue up 180% YoY as enterprise customers (Adobe, Canva, Jasper) deepen integrations.',
          action: 'Enterprise pivot is working—encourage shift away from consumer. Connect with design tool portfolio companies for partnership opportunities.'
        },
        {
          title: 'Competitive and Financial Position',
          content: 'Facing intense competition from Midjourney (consumer), OpenAI DALL-E (enterprise), and open-source alternatives (SDXL fine-tunes). Burn rate remains elevated at ~$5M/month. Runway through Q2 2026 assuming current revenue trajectory, but may need bridge round if enterprise sales don\'t accelerate.',
          action: 'Critical: Assess bridge financing need within next 2 quarters. Prepare term sheet for inside round at flat/slight down valuation to extend runway 12+ months.'
        }
      ]
    }
  };

  // Default template for companies not in the map
  const defaultIntelligence = {
    score: 72,
    momentum: 'positive',
    summary: `${companyName} is showing healthy growth indicators across product development and market positioning in the ${sector} sector.`,
    sections: [
      {
        title: 'Recent Developments',
        content: `${companyName} continues to execute on its product roadmap with recent feature launches showing strong user adoption. The team has expanded by 25% in the last quarter, focusing on engineering and go-to-market roles. Several strategic partnerships announced with industry leaders signal growing market validation.`,
        action: 'Schedule quarterly business review to assess hiring plan sustainability and evaluate burn rate trajectory.'
      },
      {
        title: 'Market Position',
        content: `The ${sector} market is experiencing 30-40% annual growth, with ${companyName} well-positioned in the mid-market segment. Competitive dynamics remain favorable with no significant new entrants in the last 6 months. Customer retention metrics (110% net revenue retention) indicate strong product-market fit.`,
        action: 'Facilitate introductions to 2-3 strategic accounts in your network. Consider organizing customer advisory board with peer portfolio companies.'
      },
      {
        title: 'Strategic Priorities',
        content: `Company is focused on reaching $10M ARR milestone (currently at $7.2M) before raising Series B in Q3 2025. Key initiatives include enterprise product tier launch, international expansion (UK/EU), and potential M&A of smaller competitor to accelerate market share.`,
        action: 'Proactively source Series B co-investors. If M&A target is identified, leverage your network for diligence and deal support.'
      }
    ]
  };

  return intelligenceByCompany[companyName] || defaultIntelligence;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [intelligenceText, setIntelligenceText] = useState<string>('');
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [fundId, setFundId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    if (!params.id) return;
    
    setLoading(true);
    
    // Get fund session for branding
    const sessionResponse = await fetch('/api/auth/session');
    const sessionData = await sessionResponse.json();
    setFundId(sessionData.session?.fundId || '');
    
    // Check if Supabase is configured
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasSupabase) {
      // Use mock data for demo
      const { mockPortfolio, mockUpdates } = await import('@/lib/portfolio-mock-data');
      const mockCompany = mockPortfolio.find(c => c.id === params.id);
      
      if (mockCompany) {
        setCompany({
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
        } as any);
        
        const companyAlerts = mockUpdates
          .filter(u => u.companyId === params.id)
          .map(u => ({
            id: u.id,
            company_id: u.companyId,
            type: u.type,
            title: u.title,
            summary: u.summary,
            source: u.source,
            sentiment: u.sentiment,
            detected_at: u.date.toISOString(),
            is_read: false,
            perplexity_data: null,
            created_at: u.date.toISOString(),
          }));
        
        setAlerts(companyAlerts as any);
        setInsights([]);
      }
      
      setLoading(false);
      return;
    }
    
    // Use real Supabase data
    const [companyData, alertsData, insightsData] = await Promise.all([
      getCompanyById(params.id as string),
      getAlerts({ companyId: params.id as string }),
      getInsights(params.id as string),
    ]);
    
    setCompany(companyData);
    setAlerts(alertsData);
    setInsights(insightsData);
    setLoading(false);
  }

  async function handleRefresh() {
    if (!params.id || isLoadingIntelligence) return;
    
    setIsLoadingIntelligence(true);
    setIntelligenceText('');
    
    try {
      const response = await fetch(`/api/intelligence/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch intelligence');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          accumulated += chunk;
          setIntelligenceText(accumulated);
        }
      }
    } catch (error) {
      console.error('Intelligence error:', error);
      setIntelligenceText('Error loading intelligence. Please try again.');
    } finally {
      setIsLoadingIntelligence(false);
    }
  }

  const getUpdateIcon = (type: string) => {
    const icons: Record<string, string> = {
      funding: '💰',
      product: '🚀',
      hiring: '👥',
      news: '📰',
      market: '📊',
    };
    return icons[type] || '📌';
  };

  const getBadgeVariant = (type: string): any => {
    const variants: Record<string, string> = {
      funding: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      product: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      hiring: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      news: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      market: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    };
    return variants[type] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Company not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portfolio
                </Button>
              </Link>
              <div className="text-xl font-black tracking-tighter mantis-gradient-text">
                {fundId === 'mantis' ? 'MANTISVC' : 'FUNDTRACK'}
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={company.logo_url || undefined} />
                <AvatarFallback>{company.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1">{company.name}</h1>
                <p className="text-muted-foreground mb-2">{company.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{company.stage}</Badge>
                  <Badge variant="outline">{company.sector}</Badge>
                </div>
              </div>
            </div>
            
            {company.website && (
            <div className="flex gap-2">
              {company.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* AI Intelligence - Streaming */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    AI Intelligence Report
                  </CardTitle>
                  <CardDescription>Powered by Perplexity + OpenAI</CardDescription>
                </div>
                <Button 
                  onClick={handleRefresh}
                  disabled={isLoadingIntelligence}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {isLoadingIntelligence ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {intelligenceText ? (
                <IntelligenceMarkdown content={intelligenceText} />
              ) : isLoadingIntelligence ? (
                <div className="py-12 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    <span className="text-sm font-medium">Gathering intelligence from Perplexity...</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This may take 10-15 seconds
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No intelligence report generated yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click "Generate Report" to get real-time VC insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Timeline</CardTitle>
              <CardDescription>Signals detected by AI monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="text-2xl">{getUpdateIcon(alert.type)}</div>
                      <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getBadgeVariant(alert.type)}`}>{alert.type}</Badge>
                          {alert.sentiment === 'negative' && (
                            <Badge className="text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">Critical</Badge>
                          )}
                          {alert.sentiment === 'positive' && (
                            <Badge className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Positive</Badge>
                          )}
                        </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.detected_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.summary}</p>
                        {alert.source && (
                          <p className="text-xs text-muted-foreground">Source: {alert.source}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No alerts detected for this company
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
