# QuickStart Guide - 5 Minutes to Launch

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `portfolio-intelligence`
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes while it provisions

## Step 2: Run Database Migration (1 minute)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"**
3. **Copy everything** from `supabase/migrations/001_initial_schema.sql` in your project
4. **Paste** into the SQL editor
5. Click **"Run"** (bottom right)
6. You should see: ✅ Success. No rows returned
7. Click **"Table Editor"** → You should see 3 tables: companies, alerts, insights
8. Click **"companies"** → You should see 10 rows (Superhuman, Stability AI, etc.)

## Step 3: Get API Keys (30 seconds)

1. Click **"Project Settings"** (gear icon) → **"API"**
2. Find **"Project URL"** - Copy it
3. Scroll down to **"Project API keys"**
4. Click **"Legacy anon, service_role API keys"** tab (important!)
5. Copy:
   - **anon** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 4: Configure Environment (30 seconds)

Open or create `.env.local` in your project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PERPLEXITY_API_KEY=pplx-xxx (optional - for AI features)
```

Replace the values with your actual keys from Step 3.

## Step 5: Start the App (30 seconds)

```bash
pkill -f "next dev"
npm run dev
```

Open http://localhost:3000

## ✅ You Should See:

- **Portfolio tab**: 10 companies (Superhuman, Stability AI, Kalshi, etc.)
- **Alerts tab**: Empty initially
- **Company pages**: Click any company

## 🧪 Test the Intelligence Scan:

1. Click on any company (e.g., "Superhuman")
2. Click **"Refresh Intelligence"** button
3. Wait ~5 seconds
4. New alerts from Perplexity AI will appear!

## 🎉 That's It!

You now have a fully functional VC portfolio intelligence dashboard powered by:
- ✅ Supabase (database)
- ✅ Perplexity AI (intelligence gathering)
- ✅ Real-time alerts
- ✅ Automated scanning

## Next Steps:

- Add more companies via Supabase Table Editor
- Set up daily automated scans (see SUPABASE_SETUP.md)
- Configure Perplexity API for AI insights

## Troubleshooting:

**Can't see companies?**
- Check SQL migration ran successfully
- Verify companies table has 10 rows in Supabase

**"Refresh Intelligence" not working?**
- Add PERPLEXITY_API_KEY to .env.local
- Check you have API credits remaining

**Still getting errors?**
- Make sure you used the **Legacy** API keys, not the new format
- Restart dev server after adding env vars

