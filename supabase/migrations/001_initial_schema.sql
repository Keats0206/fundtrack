-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  investment_date DATE,
  ownership_percent FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT,
  sentiment TEXT DEFAULT 'neutral',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  perplexity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_alerts_company_id ON alerts(company_id);
CREATE INDEX idx_alerts_detected_at ON alerts(detected_at DESC);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_insights_company_id ON insights(company_id);
CREATE INDEX idx_insights_expires_at ON insights(expires_at);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for MVP)
CREATE POLICY "Allow all operations on companies" ON companies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on alerts" ON alerts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on insights" ON insights
  FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to companies table
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample companies (from mock data)
INSERT INTO companies (name, sector, stage, website, description, investment_date, ownership_percent, logo_url) VALUES
  ('Superhuman', 'Enterprise SaaS', 'Series B', 'https://superhuman.com', 'The fastest email experience ever made', '2022-08-15', 8, 'https://api.dicebear.com/7.x/initials/svg?seed=SH&backgroundColor=3b82f6'),
  ('Stability AI', 'AI/ML', 'Series A', 'https://stability.ai', 'Open-source AI models for image, video, and language', '2023-03-20', 12, 'https://api.dicebear.com/7.x/initials/svg?seed=SA&backgroundColor=a855f7'),
  ('Mythical Games', 'Gaming', 'Series C+', 'https://mythical.games', 'Next-generation game technology studio', '2021-11-10', 5, 'https://api.dicebear.com/7.x/initials/svg?seed=MG&backgroundColor=ec4899'),
  ('Kalshi', 'FinTech', 'Series A', 'https://kalshi.com', 'Regulated exchange for event contracts', '2023-06-15', 15, 'https://api.dicebear.com/7.x/initials/svg?seed=KA&backgroundColor=10b981'),
  ('Formation Bio', 'HealthTech', 'Series B', 'https://formationbio.com', 'AI-powered drug development platform', '2022-09-01', 10, 'https://api.dicebear.com/7.x/initials/svg?seed=FB&backgroundColor=ef4444'),
  ('Chainguard', 'Cybersecurity', 'Series A', 'https://chainguard.dev', 'Secure software supply chain platform', '2023-04-20', 14, 'https://api.dicebear.com/7.x/initials/svg?seed=CG&backgroundColor=f59e0b'),
  ('Whop', 'E-Commerce', 'Seed', 'https://whop.com', 'Platform for selling digital products and access', '2024-02-10', 18, 'https://api.dicebear.com/7.x/initials/svg?seed=WH&backgroundColor=8b5cf6'),
  ('Apeel', 'ESG/Climate', 'Series C+', 'https://apeel.com', 'Plant-based protection to extend produce shelf life', '2021-07-15', 6, 'https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=22c55e'),
  ('Beacons AI', 'Consumer/Creator', 'Seed', 'https://beacons.ai', 'All-in-one creator platform with AI tools', '2023-11-20', 16, 'https://api.dicebear.com/7.x/initials/svg?seed=BA&backgroundColor=06b6d4'),
  ('VeHo', 'Logistics', 'Series A', 'https://veho.co', 'Next-gen last-mile delivery powered by drivers', '2023-05-10', 13, 'https://api.dicebear.com/7.x/initials/svg?seed=VH&backgroundColor=f97316');

-- Insert mock alerts for demo
INSERT INTO alerts (company_id, type, title, summary, source, sentiment, detected_at, is_read) VALUES
  -- Superhuman alerts
  ((SELECT id FROM companies WHERE name = 'Superhuman'), 'funding', 'Series C Rumors Intensify', 'Multiple sources reporting Superhuman in advanced talks for $100M Series C led by Andreessen Horowitz. Valuation estimated at $800M-1B. CEO spotted at a16z offices last week.', 'TechCrunch, The Information', 'positive', NOW() - INTERVAL '2 hours', false),
  ((SELECT id FROM companies WHERE name = 'Superhuman'), 'team', 'Executive Hiring Spree', 'Superhuman hired former Salesforce VP of Enterprise as Chief Revenue Officer. Also added 3 senior engineers from Google Chrome team. Signals aggressive enterprise expansion.', 'LinkedIn, company blog', 'positive', NOW() - INTERVAL '1 day', false),
  
  -- Stability AI alerts
  ((SELECT id FROM companies WHERE name = 'Stability AI'), 'product', 'New Video Model Launch', 'Stability AI released Stable Video Diffusion 2.0 with 10x faster generation. Early reviews calling it "DALL-E moment for video." 50K+ devs on waitlist in first 24hrs.', 'Product Hunt, Twitter', 'very_positive', NOW() - INTERVAL '4 hours', false),
  ((SELECT id FROM companies WHERE name = 'Stability AI'), 'market', 'Partnership with Adobe Announced', 'Adobe integrating Stable Diffusion models directly into Creative Cloud. Deal includes revenue share. Analyst estimates $50M+ annual recurring revenue potential.', 'Adobe press release', 'very_positive', NOW() - INTERVAL '3 days', false),
  
  -- Mythical Games alerts
  ((SELECT id FROM companies WHERE name = 'Mythical Games'), 'market', 'NFL Rivals Hits 5M Downloads', 'Mobile game NFL Rivals crossed 5M downloads with 1.2M daily active users. In-app purchases trending 40% above projections. Publicly discussing expansion to NBA license.', 'App Annie, company earnings', 'positive', NOW() - INTERVAL '6 hours', false),
  ((SELECT id FROM companies WHERE name = 'Mythical Games'), 'risk', 'Key Engineering Lead Departure', 'VP of Platform Engineering (5-year veteran) departed to join Roblox. Third senior engineering departure in 6 months. Glassdoor reviews mentioning "direction concerns."', 'LinkedIn, Glassdoor', 'negative', NOW() - INTERVAL '1 day', true),
  
  -- Kalshi alerts
  ((SELECT id FROM companies WHERE name = 'Kalshi'), 'regulatory', 'CFTC Approves New Contract Types', 'CFTC granted approval for political and entertainment event contracts. Removes major regulatory blocker. Trading volume expected to increase 5-10x based on user surveys.', 'CFTC filing, Bloomberg', 'very_positive', NOW() - INTERVAL '8 hours', false),
  ((SELECT id FROM companies WHERE name = 'Kalshi'), 'market', 'Trading Volume Up 300% MoM', 'November trading volume hit $47M (up from $12M in October). User acquisition cost dropped 60% as viral TikTok campaigns drive organic growth. 200K+ new accounts.', 'Internal metrics leak, Twitter', 'positive', NOW() - INTERVAL '2 days', false),
  
  -- Formation Bio alerts
  ((SELECT id FROM companies WHERE name = 'Formation Bio'), 'product', 'FDA Fast Track Designation', 'Lead drug candidate received FDA Fast Track status for rare liver disease. Accelerates approval timeline by 18-24 months. Phase 2 results exceed efficacy targets.', 'FDA announcement, STAT News', 'very_positive', NOW() - INTERVAL '12 hours', false),
  ((SELECT id FROM companies WHERE name = 'Formation Bio'), 'funding', 'Series C Oversubscribed', 'Company reportedly turned away investors in oversubscribed Series C. Lead by Sequoia with participation from a16z Bio. Valuation rumored at $1.2B (up from $400M Series B).', 'The Information, sources', 'positive', NOW() - INTERVAL '5 days', false),
  
  -- Chainguard alerts
  ((SELECT id FROM companies WHERE name = 'Chainguard'), 'market', 'Fortune 500 Customer Win', 'Signed multi-year enterprise contract with major financial institution (name undisclosed). Deal size estimated $5-8M annually. First Fortune 50 customer.', 'company blog, sources', 'positive', NOW() - INTERVAL '1 day', false),
  ((SELECT id FROM companies WHERE name = 'Chainguard'), 'product', 'Open Source Milestone', 'Core product "Wolfi" surpassed 10K GitHub stars. Community contributions up 200% QoQ. Developer advocacy strategy paying off with strong bottom-up adoption.', 'GitHub, HackerNews', 'positive', NOW() - INTERVAL '3 days', false),
  
  -- Whop alerts
  ((SELECT id FROM companies WHERE name = 'Whop'), 'market', 'Creator Revenue Hits $100M', 'Platform facilitated $100M in creator sales (take rate: 8%). Top creators earning $500K+/month. Expansion into course platforms and community subscriptions driving growth.', 'company metrics, podcast', 'very_positive', NOW() - INTERVAL '10 hours', false),
  ((SELECT id FROM companies WHERE name = 'Whop'), 'team', 'Former Stripe Exec Joins as COO', 'Hired Stripe''s former Head of Platform Partnerships as COO. Strong signal of enterprise ambitions. LinkedIn shows 40+ open roles, mostly go-to-market positions.', 'LinkedIn, press release', 'positive', NOW() - INTERVAL '4 days', false),
  
  -- Apeel alerts
  ((SELECT id FROM companies WHERE name = 'Apeel'), 'market', 'Kroger Nationwide Rollout', 'Kroger expanding Apeel-treated produce to all 2,700+ stores nationwide. Previous pilot showed 30% reduction in waste. Deal estimated at $50M+ annually at scale.', 'Grocery Dive, company source', 'very_positive', NOW() - INTERVAL '5 hours', false),
  ((SELECT id FROM companies WHERE name = 'Apeel'), 'risk', 'Manufacturing Delays Reported', 'Supply chain sources report 6-8 week delays in coating production. May impact Q4 expansion targets. Company publicly downplaying, but retail partners expressing concern.', 'supply chain sources', 'negative', NOW() - INTERVAL '2 days', false),
  
  -- Beacons AI alerts
  ((SELECT id FROM companies WHERE name = 'Beacons AI'), 'product', 'AI Store Builder Goes Viral', 'New AI-powered store builder trending on TikTok. Creators reporting stores built in <5 minutes generating $10K+ first month. 300K+ creators signed up in 2 weeks.', 'TikTok, Twitter, company blog', 'very_positive', NOW() - INTERVAL '1 day', false),
  ((SELECT id FROM companies WHERE name = 'Beacons AI'), 'market', 'MrBeast Endorsement', 'MrBeast publicly endorsed platform to 200M+ followers, calling it "the future of creator economy." Company servers temporarily overwhelmed with signups. Organic growth spiking.', 'Twitter, YouTube', 'positive', NOW() - INTERVAL '6 days', false),
  
  -- VeHo alerts
  ((SELECT id FROM companies WHERE name = 'VeHo'), 'market', 'Amazon Partnership Expansion', 'Expanded Amazon partnership to 15 new metros. Now delivering 100K+ packages/day. Driver retention rates 2x industry average due to flexible scheduling model.', 'company announcement, sources', 'positive', NOW() - INTERVAL '1 day', false),
  ((SELECT id FROM companies WHERE name = 'VeHo'), 'risk', 'Regulatory Scrutiny Increases', 'California labor board investigating driver classification. Similar to Uber/DoorDash cases. Legal experts estimate $20-40M potential liability if reclassified. Stock options at risk.', 'legal filings, Reuters', 'negative', NOW() - INTERVAL '3 days', true);

