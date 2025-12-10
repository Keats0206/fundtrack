import { supabase, getServiceSupabase } from '../supabase';
import type { Database } from '../supabase';

type Insight = Database['public']['Tables']['insights']['Row'];
type InsightInsert = Database['public']['Tables']['insights']['Insert'];

export async function getInsights(companyId: string): Promise<Insight[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('company_id', companyId)
    .gte('expires_at', now)
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('Error fetching insights:', error);
    return [];
  }

  return data || [];
}

export async function getOrGenerateInsights(
  companyId: string,
  companyName: string
): Promise<Insight[]> {
  // Check for cached insights
  const cached = await getInsights(companyId);

  if (cached.length > 0) {
    return cached;
  }

  // Generate new insights
  return await generateInsights(companyId, companyName);
}

export async function generateInsights(
  companyId: string,
  companyName: string
): Promise<Insight[]> {
  try {
    // Get recent alerts for context
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('company_id', companyId)
      .order('detected_at', { ascending: false })
      .limit(10);

    // Generate insights based on alerts
    const insights: InsightInsert[] = [];
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour cache

    // Recent Activity Insight
    if (alerts && alerts.length > 0) {
      const positiveCount = alerts.filter(a => a.sentiment === 'positive').length;
      const content = positiveCount > alerts.length / 2
        ? `Strong positive momentum. ${positiveCount} positive signals detected. ${alerts[0].title}`
        : `Mixed signals detected. Monitoring ${alerts.length} recent activities.`;

      insights.push({
        company_id: companyId,
        insight_type: 'recent_activity',
        content,
        generated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    // Market Position Insight
    const marketAlerts = alerts?.filter(a => a.type === 'market') || [];
    if (marketAlerts.length > 0) {
      insights.push({
        company_id: companyId,
        insight_type: 'market_position',
        content: `${marketAlerts.length} market signals detected. ${marketAlerts[0].title}`,
        generated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    // Risk Monitoring Insight
    const negativeAlerts = alerts?.filter(a => a.sentiment === 'negative') || [];
    const riskContent = negativeAlerts.length > 0
      ? `⚠️ ${negativeAlerts.length} critical signals detected. Recommend follow-up.`
      : `No major risks detected. Company showing stable progress.`;

    insights.push({
      company_id: companyId,
      insight_type: 'risk_monitoring',
      content: riskContent,
      generated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    // Store insights
    const serviceSupa = getServiceSupabase();
    const { data, error } = await serviceSupa
      .from('insights')
      .insert(insights)
      .select();

    if (error) {
      console.error('Error storing insights:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

export async function clearExpiredInsights(): Promise<number> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('insights')
    .delete()
    .lt('expires_at', now)
    .select();

  if (error) {
    console.error('Error clearing expired insights:', error);
    return 0;
  }

  return data?.length || 0;
}

