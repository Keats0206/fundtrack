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
import type { FundSession } from '@/lib/auth';
import {
  Search,
  Plus,
  ExternalLink,
  Bell,
  Zap,
  Loader2,
  LogOut,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Company = Database['public']['Tables']['companies']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundSession, setFundSession] = useState<FundSession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    // Get current fund session
    const sessionResponse = await fetch('/api/auth/session');
    const sessionData = await sessionResponse.json();
    setFundSession(sessionData.session);
    
    // Check if Supabase is configured
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasSupabase) {
      // Use mock data for demo
      const { mockPortfolio, mockUpdates } = await import('@/lib/portfolio-mock-data');
      
      // Filter companies based on fund access
      const allowedCompanyIds = sessionData.session?.companies || [];
      const hasAllAccess = allowedCompanyIds.includes('all');
      const filteredPortfolio = hasAllAccess 
        ? mockPortfolio 
        : mockPortfolio.filter(c => allowedCompanyIds.includes(c.id));
      
      const companiesWithHealth = filteredPortfolio.map(c => ({
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
      
      const mockAlerts = mockUpdates
        .filter(u => filteredPortfolio.some(c => c.id === u.companyId))
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

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
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

  const getBadgeVariant = (type: string): string => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black tracking-tighter mantis-gradient-text">
                {fundSession?.fundId === 'mantis' ? 'MANTISVC' : 'FUNDTRACK'}
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <div>
                <h1 className="text-lg font-bold tracking-tight">Portfolio Intelligence</h1>
                <p className="text-xs text-muted-foreground">
                  {fundSession?.fundName || 'Loading...'} • {companies.length} Companies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button size="sm" variant="outline" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Gradient accent bar */}
      <div className="h-1 mantis-gradient" />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">{companies.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Portfolio companies</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Signals</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">{alerts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Active alerts</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">{criticalAlerts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-8">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="alerts" className="font-semibold">Alerts</TabsTrigger>
            <TabsTrigger value="companies" className="font-semibold">Companies</TabsTrigger>
            <TabsTrigger value="ask" className="font-semibold">Ask AI</TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search alerts..." className="pl-10 bg-card/50 border-border/50" />
              </div>
            </div>

            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const company = companies.find(c => c.id === alert.company_id);
                return (
                  <Card key={alert.id} className="bg-card/50 border-border/50 hover:bg-card/80 transition-all backdrop-blur-sm">
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
                                <Badge className={`text-xs ${getBadgeVariant(alert.type)}`}>{alert.type}</Badge>
                                {alert.sentiment === 'negative' && (
                                  <Badge className="text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">⚠️ Critical</Badge>
                                )}
                                {alert.sentiment === 'positive' && (
                                  <Badge className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Positive</Badge>
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
          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search companies..." className="pl-10 bg-card/50 border-border/50" />
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              {companies.map((company) => (
                <Link key={company.id} href={`/company/${company.id}`}>
                  <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-all cursor-pointer backdrop-blur-sm group">
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-border/50 transition-all">
                            <AvatarImage src={company.logo_url || undefined} />
                            <AvatarFallback className="font-bold">{company.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg tracking-tight">{company.name}</h3>
                            <p className="text-sm text-muted-foreground">{company.sector}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="font-semibold">{company.stage}</Badge>
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
          <TabsContent value="ask" className="space-y-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-black tracking-tight">Ask AI</CardTitle>
                <p className="text-sm text-muted-foreground">Get instant intelligence on your portfolio</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-8">
                  <Input placeholder="Ask about your portfolio companies..." className="bg-background/50 border-border/50" />
                  <Button variant="outline" className="font-semibold">
                    Ask
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-6 border border-border/50 rounded-lg bg-background/30">
                    <p className="text-sm font-bold mb-2">💡 Powered by Perplexity AI</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your Perplexity API key to unlock AI-powered insights, market intelligence, and automated monitoring for your entire portfolio.
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
