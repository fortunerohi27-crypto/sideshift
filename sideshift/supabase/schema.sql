# Supabase Schema for SideShift

-- Profiles table: stores user-specific data and onboarding info
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  skills TEXT[],
  tools TEXT[],
  location TEXT,
  available_hours INTEGER,
  work_type TEXT, -- 'Remote', 'Local', 'Hybrid'
  income_goal NUMERIC,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Opportunities table: master list of side hustles
CREATE TABLE opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT,
  description TEXT,
  estimated_hourly NUMERIC,
  difficulty TEXT, -- 'Easy', 'Medium', 'Hard'
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Matches table: AI-generated pairings
CREATE TABLE user_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Earnings table: track actual income
CREATE TABLE earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_name TEXT NOT NULL,
  platform TEXT,
  hours NUMERIC,
  amount NUMERIC,
  date DATE NOT NULL,
  hourly_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions table: Stripe mapping
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT, -- 'active', 'trailing', 'past_due', 'canceled'
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Profiles: Users can only read/write their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Opportunities: Everyone can read, only admins can write
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opportunities are viewable by everyone" ON opportunities FOR SELECT USING (true);

-- User Matches: Users can only view their own matches
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own matches" ON user_matches FOR SELECT USING (auth.uid() = user_id);

-- Earnings: Users can only view/edit their own earnings
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own earnings" ON earnings FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users can view own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Seed data for opportunities
INSERT INTO opportunities (title, platform, description, estimated_hourly, difficulty, category) VALUES
('Freelance Writer', 'Upwork', 'Write high-quality articles and blog posts for clients.', 35.00, 'Medium', 'Writing'),
('Virtual Assistant', 'Fiverr', 'Handle administrative tasks for business owners.', 20.00, 'Easy', 'Admin'),
('Ride Share Driver', 'Uber', 'Provide transportation services in your city.', 22.00, 'Easy', 'Delivery'),
('Grocery Shopper', 'Instacart', 'Shop for and deliver groceries to customers.', 18.00, 'Easy', 'Delivery'),
('Handyman', 'TaskRabbit', 'Help people with home repairs and assembly.', 45.00, 'Medium', 'Home Services'),
('Social Media Manager', 'Freelancer', 'Manage social media presence for small brands.', 30.00, 'Medium', 'Marketing'),
('User Tester', 'UserTesting', 'Test websites and apps and provide feedback.', 15.00, 'Easy', 'Tech'),
('Online Tutor', 'VIPKid', 'Teach English or other subjects online.', 25.00, 'Medium', 'Education'),
('Graphic Designer', '99designs', 'Create logos and brand identities.', 40.00, 'Hard', 'Design'),
('Transcriptionist', 'Rev', 'Convert audio files into text accurately.', 15.00, 'Easy', 'Writing');
