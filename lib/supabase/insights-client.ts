// Client-safe insight operations
import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Insight = Database['public']['Tables']['insights']['Row'];

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

