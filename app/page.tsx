'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAllCompanies } from '@/lib/supabase/companies';
import { getAlerts } from '@/lib/supabase/alerts-client';
import type { Database } from '@/lib/supabase';
import {
  Search,
  Plus,
  ExternalLink,
  Bell,
  Zap,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Company = Database['public']['Tables']['companies']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    // Check if Supabase is configured
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasSupabase) {
      // Use mock data for demo
      const { mockPortfolio, mockUpdates } = await import('@/lib/portfolio-mock-data');
      const companiesWithHealth = mockPortfolio.map(c => ({
        ...c,
        id: c.id,
        name: c.name,
        sector: c.sector,
        stage: c.stage,
        website: c.website,
        description: c.description,
        logo_url: c.logo,
        investment_date: c.investmentDate.toISOString(),
        ownership_percent: c.ownershipPercent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      const mockAlerts = mockUpdates.map(u => ({
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
      
      setCompanies(companiesWithHealth as any);
      setAlerts(mockAlerts as any);
      setLoading(false);
      return;
    }
    
    // Use real Supabase data
    const [companiesData, alertsData] = await Promise.all([
      getAllCompanies(),
      getAlerts({ limit: 50 }),
    ]);
    setCompanies(companiesData);
    setAlerts(alertsData);
    setLoading(false);
  }

  const criticalAlerts = alerts.filter(a => a.sentiment === 'negative');

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'funding': return '💰';
      case 'product': return '🚀';
      case 'hiring': return '👥';
      case 'news': return '📰';
      case 'market': return '📊';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg border bg-card">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Portfolio Intelligence</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered alerts from Perplexity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">Companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Signals</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">Total alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="ask">Ask AI</TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search alerts..." className="pl-10" />
              </div>
            </div>

            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const company = companies.find(c => c.id === alert.company_id);
                return (
                  <Card key={alert.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{getUpdateIcon(alert.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Link 
                                  href={`/company/${alert.company_id}`} 
                                  className="font-semibold hover:underline"
                                >
                                  {company?.name || 'Unknown'}
                                </Link>
                                <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                                {alert.sentiment === 'negative' && (
                                  <Badge variant="destructive" className="text-xs">⚠️ Critical</Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground">{alert.summary}</p>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(alert.detected_at), { addSuffix: true })}
                            </div>
                          </div>
                          {alert.source && (
                            <div className="text-xs text-muted-foreground">
                              {alert.source}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts yet. Scan companies to generate intelligence.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search companies..." className="pl-10" />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {companies.map((company) => (
                <Link key={company.id} href={`/company/${company.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={company.logo_url || undefined} />
                            <AvatarFallback>{company.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            <p className="text-sm text-muted-foreground">{company.sector}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{company.stage}</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              if (company.website) window.open(company.website, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Ask AI Tab */}
          <TabsContent value="ask" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ask Perplexity AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input placeholder="Ask about your portfolio companies..." />
                  <Button>Ask</Button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-2">💡 Insight</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your Perplexity API key to get AI-powered insights about your portfolio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
