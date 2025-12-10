import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');

    if (companiesError) {
      throw companiesError;
    }

    console.log(`Scanning ${companies?.length || 0} companies...`);

    let totalAlertsCreated = 0;

    // Scan each company
    for (const company of companies || []) {
      try {
        console.log(`Scanning ${company.name}...`);

        // Call Perplexity API
        const perplexityResponse = await fetch(
          'https://api.perplexity.ai/search',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `${company.name} news updates announcements`,
              max_results: 5,
              max_tokens_per_page: 512,
            }),
          }
        );

        if (!perplexityResponse.ok) {
          console.error(`Perplexity API error for ${company.name}`);
          continue;
        }

        const perplexityData = await perplexityResponse.json();
        const results = perplexityData.results || [];

        // Check for duplicates
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentAlerts } = await supabase
          .from('alerts')
          .select('title')
          .eq('company_id', company.id)
          .gte('detected_at', sevenDaysAgo.toISOString());

        const recentTitles = new Set(recentAlerts?.map((a: any) => a.title) || []);

        // Create alerts
        for (const result of results) {
          if (recentTitles.has(result.title)) {
            continue; // Skip duplicates
          }

          const sentiment = detectSentiment(result.snippet || '');
          const type = detectType(result.title + ' ' + (result.snippet || ''));

          const { error: insertError } = await supabase
            .from('alerts')
            .insert({
              company_id: company.id,
              type,
              title: result.title,
              summary: result.snippet || '',
              source: result.url,
              sentiment,
              detected_at: new Date().toISOString(),
              is_read: false,
              perplexity_data: result,
            });

          if (!insertError) {
            totalAlertsCreated++;
          }
        }

        // Rate limiting: wait 5 seconds between companies
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`Error scanning ${company.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        companiesScanned: companies?.length || 0,
        alertsCreated: totalAlertsCreated,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Scan portfolio error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

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

