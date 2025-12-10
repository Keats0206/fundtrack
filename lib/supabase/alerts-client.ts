// Client-safe alert operations (no Perplexity imports)
import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Alert = Database['public']['Tables']['alerts']['Row'];

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

  const { data, error} = await query;

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  return data || [];
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

