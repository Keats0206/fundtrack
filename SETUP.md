# StealthRadar Setup Guide

## Quick Start

StealthRadar helps you find founders who recently went stealth from companies like Coinbase, Stripe, or OpenAI.

## Prerequisites

- Node.js 18+ installed
- RapidAPI account with LinkedIn Data API access

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create a `.env.local` file in the project root:

```bash
RAPIDAPI_KEY=your_rapidapi_key_here
```

**Get your RapidAPI key:**
1. Go to https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api
2. Sign up or log in
3. Subscribe to a plan (free tier available)
4. Copy your API key from the dashboard
5. Paste it in `.env.local`

### 3. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## How to Use

### Search for Stealth Founders

1. **Quick Search**: Click one of the quick search buttons (Ex-Coinbase, Ex-OpenAI, etc.)
2. **Custom Search**: 
   - Select a company from the dropdown
   - Optionally filter by previous role
   - Click "Search"

### Review Results

The app will show people who:
- Recently left the company
- Have stealth indicators in their profile (title like "Building something new", "Stealth Founder", etc.)
- Changed from employee roles to founder roles

### Export to CSV

1. Click "Export to CSV" to download results
2. The CSV is formatted for Apollo.io import
3. Columns include: Name, Current Title, Previous Company, LinkedIn URL, etc.

### Save for Later

- Click the bookmark icon to save interesting profiles
- View saved profiles in the "Saved" tab
- Export saved profiles separately

## Using with Apollo.io

1. Export your search results to CSV
2. Go to Apollo.io
3. Import the CSV file
4. Apollo will enrich the data with emails and other contact info
5. Use the enriched data for outreach

## API Rate Limits

- RapidAPI free tier: Limited requests per month
- Results are cached for 1 hour to reduce API calls
- Consider upgrading if you need more searches

## Troubleshooting

### "RAPIDAPI_KEY is not configured" error
- Make sure `.env.local` exists in the project root
- Verify the key is correct
- Restart the dev server after adding the key

### No results found
- Check if the company name matches LinkedIn's company page
- Try searching without role filter first
- Verify your API subscription is active

### API errors
- Check your RapidAPI dashboard for quota limits
- Ensure your subscription is active
- Try again in a few minutes if rate limited

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **RapidAPI LinkedIn Data API** - LinkedIn scraping

## Features

- ✅ Real-time LinkedIn search
- ✅ Stealth signal detection
- ✅ CSV export for Apollo.io
- ✅ Save interesting profiles
- ✅ Company and role filtering
- ✅ Loading states and error handling

## Future Enhancements

- [ ] Batch company searches
- [ ] Search history
- [ ] Advanced filters (location, years of experience)
- [ ] Email pattern generation
- [ ] Chrome extension for one-click saves

