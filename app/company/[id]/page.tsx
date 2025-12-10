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
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Company = Database['public']['Tables']['companies']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];
type Insight = Database['public']['Tables']['insights']['Row'];

// Generate contextual insights with investor actions
function generateMockInsights(companyName: string, alertCount: number) {
  const insights = [
    {
      id: '1',
      company_id: '1',
      insight_type: 'growth_opportunity',
      content: `${companyName} showing strong momentum. Recent product launch generating buzz. **Investor Action:** Intro to your Enterprise SaaS portfolio companies for cross-selling opportunities.`,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      company_id: '1',
      insight_type: 'hiring_support',
      content: `Team expansion signals detected. Likely preparing for scale. **Investor Action:** Share VP Engineering candidates from your network. Connect with your executive recruiting partner.`,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      company_id: '1',
      insight_type: 'strategic_partnership',
      content: `Competitive landscape heating up. Market consolidation expected in 6-12 months. **Investor Action:** Facilitate partnership discussions with complementary portfolio companies. Consider bridge round for M&A positioning.`,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  return alertCount === 0 ? insights.slice(0, 1) : insights;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    if (!params.id) return;
    
    setLoading(true);
    
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
        
        // Generate company-specific insights with investor actions
        const companyInsights = generateMockInsights(mockCompany.name, companyAlerts.length);
        setInsights(companyInsights as any);
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
    if (!params.id || scanning) return;
    
    setScanning(true);
    try {
      // Clear old insights before generating new ones
      setInsights([]);
      
      // Trigger Perplexity scan
      const response = await fetch(`/api/scan/${params.id}`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reload data to show new alerts and insights
        await loadData();
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setScanning(false);
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Button>
            </Link>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={scanning}
                className="gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh Intelligence
                  </>
                )}
              </Button>
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
          {/* AI Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle>AI Intelligence</CardTitle>
              <CardDescription>Latest insights from Perplexity AI</CardDescription>
            </CardHeader>
              <CardContent className="space-y-3">
              {insights.length > 0 ? (
                insights.map((insight) => {
                  // Split content at "Investor Action:" for highlighting
                  const parts = insight.content.split('**Investor Action:**');
                  const analysis = parts[0]?.trim();
                  const action = parts[1]?.trim();
                  
                  return (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 capitalize">
                        {insight.insight_type.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">{analysis}</p>
                      {action && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-semibold mb-1">💡 Recommended Action:</p>
                          <p className="text-sm">{action}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Generated {formatDistanceToNow(new Date(insight.generated_at), { addSuffix: true })}
                      </p>
                    </div>
                  );
                })
              ) : scanning ? (
                <div className="p-4 border rounded-lg text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Generating AI insights...
                  </p>
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Click "Refresh Intelligence" to generate insights
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
                            <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                            {alert.sentiment === 'negative' && (
                              <Badge variant="destructive" className="text-xs">Critical</Badge>
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
