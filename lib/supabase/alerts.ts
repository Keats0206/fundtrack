import { supabase, getServiceSupabase } from '../supabase';
import { searchCompanyNews } from '../perplexity-api';
import type { Database } from '../supabase';

type Alert = Database['public']['Tables']['alerts']['Row'];
type AlertInsert = Database['public']['Tables']['alerts']['Insert'];

export async function getAlerts(filters?: {
  companyId?: string;
  isRead?: boolean;
  limit?: number;
}): Promise<Alert[]> {
  let query = supabase
    .from('alerts')
    .select('*')
    .order('detected_at', { ascending: false });

  if (filters?.companyId) {
    query = query.eq('company_id', filters.companyId);
  }

  if (filters?.isRead !== undefined) {
    query = query.eq('is_read', filters.isRead);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  return data || [];
}

export async function createAlert(alert: AlertInsert): Promise<Alert | null> {
  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .single();

  if (error) {
    console.error('Error creating alert:', error);
    return null;
  }

  return data;
}

export async function markAsRead(alertId: string): Promise<boolean> {
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', alertId);

  if (error) {
    console.error('Error marking alert as read:', error);
    return false;
  }

  return true;
}

export async function markAllAsRead(companyId?: string): Promise<boolean> {
  let query = supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('is_read', false);

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error marking alerts as read:', error);
    return false;
  }

  return true;
}

/**
 * Scan a company for new intelligence using Perplexity AI
 * Stores results as alerts in the database
 */
export async function scanCompany(
  companyId: string,
  companyName: string
): Promise<{ success: boolean; alertsCreated: number }> {
  try {
    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) {
      return { success: false, alertsCreated: 0 };
    }

    // Call Perplexity API
    const results = await searchCompanyNews(companyName, 10);

    if (!results || results.length === 0) {
      return { success: true, alertsCreated: 0 };
    }

    // Check for duplicates (same title within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentAlerts } = await supabase
      .from('alerts')
      .select('title')
      .eq('company_id', companyId)
      .gte('detected_at', sevenDaysAgo.toISOString());

    const recentTitles = new Set(recentAlerts?.map(a => a.title) || []);

    // Create alerts for new signals
    const serviceSupa = getServiceSupabase();
    let alertsCreated = 0;

    for (const result of results) {
      // Skip if duplicate
      if (recentTitles.has(result.title)) {
        continue;
      }

      // Detect sentiment and type
      const sentiment = detectSentiment(result.snippet);
      const type = detectType(result.title + ' ' + result.snippet);

      const alertData: AlertInsert = {
        company_id: companyId,
        type,
        title: result.title,
        summary: result.snippet,
        source: result.url,
        sentiment,
        detected_at: new Date().toISOString(),
        is_read: false,
        perplexity_data: result,
      };

      const { error } = await serviceSupa
        .from('alerts')
        .insert(alertData);

      if (!error) {
        alertsCreated++;
      }
    }

    return { success: true, alertsCreated };
  } catch (error) {
    console.error('Error scanning company:', error);
    return { success: false, alertsCreated: 0 };
  }
}

// Helper functions
function detectSentiment(text: string): string {
  const lowerText = text.toLowerCase();
  const negative = ['concern', 'issue', 'problem', 'decline', 'drop', 'worry', 'fail', 'loss'];
  const positive = ['launch', 'success', 'growth', 'increase', 'win', 'breakthrough', 'raised'];

  const hasNegative = negative.some(word => lowerText.includes(word));
  const hasPositive = positive.some(word => lowerText.includes(word));

  if (hasNegative && !hasPositive) return 'negative';
  if (hasPositive && !hasNegative) return 'positive';
  return 'neutral';
}

function detectType(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('funding') || lowerText.includes('raised') || lowerText.includes('investment')) {
    return 'funding';
  }
  if (lowerText.includes('product') || lowerText.includes('launch') || lowerText.includes('release')) {
    return 'product';
  }
  if (lowerText.includes('hire') || lowerText.includes('team') || lowerText.includes('employee')) {
    return 'hiring';
  }
  if (lowerText.includes('market') || lowerText.includes('competitor') || lowerText.includes('industry')) {
    return 'market';
  }

  return 'news';
}

