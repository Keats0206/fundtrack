# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization
4. Name: `portfolio-intelligence`
5. Database Password: (save this securely)
6. Region: Choose closest to you
7. Click "Create new project"

## 2. Run Database Migration

1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Verify tables created: companies, alerts, insights

## 3. Get API Keys

1. Go to Project Settings > API
2. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJxxx...
service_role key: eyJxxx... (keep secret!)
```

## 4. Configure Environment Variables

Create/update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Perplexity AI
PERPLEXITY_API_KEY=your_perplexity_key
```

## 5. Test the Connection

```bash
npm run dev
```

Visit http://localhost:3000 - you should see the 10 sample companies loaded from Supabase.

## 6. Deploy Edge Function (Optional - for Daily Scans)

Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

Login:
```bash
supabase login
```

Link project:
```bash
supabase link --project-ref your-project-ref
```

Deploy function:
```bash
supabase functions deploy scan-portfolio
```

Set environment variables:
```bash
supabase secrets set PERPLEXITY_API_KEY=your_key
```

Schedule daily scans (8am):
```bash
supabase functions schedule scan-portfolio --cron "0 8 * * *"
```

## 7. Manual Company Scan

To manually scan a company:

```bash
curl -X POST http://localhost:3000/api/scan/COMPANY_ID
```

Replace `COMPANY_ID` with actual company ID from database.

## Testing

1. **View Companies**: Go to Supabase > Table Editor > companies
2. **Scan Company**: Use the API route `/api/scan/[companyId]`
3. **Check Alerts**: Go to Supabase > Table Editor > alerts
4. **View in App**: Refresh your app to see new alerts

## Troubleshooting

**Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
- Make sure `.env.local` exists
- Restart dev server: `npm run dev`

**No companies showing**
- Check if migration ran successfully
- Verify data in Supabase Table Editor

**Perplexity API errors**
- Verify API key is correct
- Check you have credits/quota remaining

## Next Steps

1. Add companies via Supabase UI or build an "Add Company" form
2. Set up daily scans via Edge Function
3. Configure real-time subscriptions for live updates
4. Add user authentication if needed

