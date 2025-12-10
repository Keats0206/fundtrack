# Setup Real Intelligence Data

## Quick Start (5 minutes)

To get **streaming AI intelligence** working with real data, you need two API keys:

### 1. Get Perplexity API Key
1. Go to https://www.perplexity.ai/settings/api
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `pplx-...`)

**Pricing:** ~$0.20 per company analysis (very affordable for demos)

### 2. Get OpenAI API Key  
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-...`)

**Pricing:** ~$0.05 per company analysis using GPT-4

### 3. Add Keys to Your Project

Create a file called `.env.local` in your project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Then edit `.env.local` and add your keys:

```env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

### 4. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
yarn dev
```

### 5. Test It Out!

1. Navigate to any company page (e.g., Superhuman, Mythical Games)
2. Click **"Generate Report"** 
3. Watch the AI intelligence **stream in real-time**! 🚀

## How It Works

1. **Perplexity** gathers real-time intelligence from the web:
   - Recent funding rounds & valuations
   - Product launches & features
   - Leadership changes
   - Market position & competitors
   - Growth metrics

2. **OpenAI (GPT-4)** analyzes that data and provides:
   - VC-focused insights
   - Investor confidence score (0-100)
   - Risk factors & opportunities
   - Specific action items for investors
   
3. The response **streams word-by-word** for a dynamic experience

## Optional: Supabase (for persistence)

If you want to store intelligence reports and alerts in a database:

1. Create a free account at https://supabase.com
2. Create a new project
3. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
4. Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Cost Estimate

For a demo/pitch with 10 portfolio companies:
- **Perplexity:** ~$2.00 (10 companies × $0.20)
- **OpenAI:** ~$0.50 (10 companies × $0.05)
- **Total:** ~$2.50 for a full demo

Perfect for pitching to VCs! 💰

## Troubleshooting

**"Configure API keys" message?**
- Make sure `.env.local` exists in project root
- Check keys are correctly formatted (no extra spaces)
- Restart dev server after adding keys

**Streaming not working?**
- Check browser console for errors
- Verify both API keys are valid
- Try the request in the Network tab

**Rate limits?**
- Perplexity: 20 requests/minute (plenty for demos)
- OpenAI: Depends on your tier, but very generous

## Need Help?

The mock data works great for initial demos too! It includes realistic intelligence reports for:
- Mythical Games (web3 gaming)
- Superhuman (email productivity)  
- Stability AI (generative AI)
- And 7 more companies

Just use the app without API keys to see the experience.

