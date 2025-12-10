# Multi-Fund Setup Guide

## Overview

This product supports multiple VCs/investors with isolated access. Each fund gets:
- Custom access code (password)
- Their own company list
- Isolated dashboard view

## Quick Start: Add a New Fund

### Option 1: Use the Admin Panel (Easiest)

1. Visit `/admin` in your browser
2. Enter fund name (e.g., "Sequoia Capital")
3. Click "Generate" to create an access code
4. Copy the config snippet
5. Add it to `app/api/auth/login/route.ts`
6. Click "Copy Share Message" to get shareable credentials

### Option 2: Manual Setup

1. Open `app/api/auth/login/route.ts`

2. Add a new entry to the `FUNDS` object:

```typescript
const FUNDS = {
  'mantis': {
    id: 'mantis',
    name: 'Mantis VC',
    companies: ['all'],
  },
  // Add your new fund:
  'sequoia': {
    id: 'sequoia',
    name: 'Sequoia Capital',
    companies: ['all'], // or ['company-id-1', 'company-id-2']
  },
};
```

3. Share the login credentials:
   - URL: `https://yourapp.com/login`
   - Access Code: `sequoia`

## Company Access Control

### Give Access to All Companies

```typescript
companies: ['all']
```

### Restrict to Specific Companies

```typescript
companies: [
  '29a87728-1418-4cfe-a523-e33b70352f5a', // Superhuman
  'c8f3d4e5-2a1b-4c6d-9e8f-7a6b5c4d3e2f', // Stability AI
]
```

To find company IDs:
1. Visit a company page in the dashboard
2. Copy the ID from the URL: `/company/[THIS-IS-THE-ID]`

## Share with New Investors

### Email Template

```
Subject: Your Portfolio Intelligence Dashboard Access

Hi [Name],

I've set up a custom portfolio intelligence dashboard for you powered by Perplexity AI and OpenAI.

🔗 Dashboard: https://yourapp.com/login
🔑 Access Code: [their-access-code]

This gives you:
• Real-time intelligence on your portfolio companies
• AI-powered insights and recommendations
• Automated monitoring and alerts

Let me know if you have any questions!
```

### Demo Access

For quick demos, use these built-in credentials:
- Access Code: `demo`
- Shows all 10 sample companies

## Advanced: Per-Fund Customization

### 1. Company Filtering

Each fund only sees their companies. The filtering happens automatically in the backend.

### 2. Branding (Future)

You can customize per fund:
- Logo
- Brand colors
- Email templates
- Custom domain

### 3. Environment Variables

For production, consider moving fund configs to environment variables:

```env
# .env.local
FUND_MANTIS_PASSWORD=your-secure-password
FUND_SEQUOIA_PASSWORD=their-secure-password
```

## Security Best Practices

1. **Use Strong Access Codes**
   - Not `demo` or `test` in production
   - At least 12 characters
   - Include numbers and special chars

2. **Regular Rotation**
   - Change access codes quarterly
   - Notify funds in advance

3. **HTTPS Only**
   - Always use HTTPS in production
   - Enables secure cookie storage

4. **Session Expiry**
   - Default: 7 days
   - Adjust in `app/api/auth/login/route.ts`:
   ```typescript
   maxAge: 60 * 60 * 24 * 30, // 30 days
   ```

## Pricing Per Fund

Estimated monthly costs per fund (10 companies):

- **Perplexity API**: ~$6/month (3 scans/week)
- **OpenAI API**: ~$1.50/month
- **Total**: ~$7.50/fund/month

Very affordable for providing high-value intelligence!

## Troubleshooting

**Fund can't log in?**
- Check access code matches exactly (case-sensitive)
- Verify fund exists in `FUNDS` object
- Clear browser cookies and try again

**Fund sees wrong companies?**
- Check `companies` array in their fund config
- Verify company IDs are correct

**Session expires too quickly?**
- Increase `maxAge` in login route
- Default is 7 days

## Roadmap

Coming soon:
- [ ] Database-backed fund configuration
- [ ] Email invitations
- [ ] Usage analytics per fund
- [ ] White-label branding
- [ ] SSO integration
- [ ] Team management (multiple users per fund)

## Support

For questions or feature requests, reach out to the team!

