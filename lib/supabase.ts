import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for API routes)
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Database types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          sector: string;
          stage: string;
          website: string | null;
          description: string | null;
          logo_url: string | null;
          investment_date: string | null;
          ownership_percent: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      alerts: {
        Row: {
          id: string;
          company_id: string;
          type: string;
          title: string;
          summary: string;
          source: string | null;
          sentiment: string;
          detected_at: string;
          is_read: boolean;
          perplexity_data: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
      };
      insights: {
        Row: {
          id: string;
          company_id: string;
          insight_type: string;
          content: string;
          generated_at: string;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['insights']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['insights']['Insert']>;
      };
    };
  };
}

