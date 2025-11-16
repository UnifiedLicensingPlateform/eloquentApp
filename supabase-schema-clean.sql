-- Eloquent Speech Coach - Complete Database Schema
-- Multi-language SaaS with AI integration

-- Create the practice_sessions table
CREATE TABLE practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  repetition_count INTEGER DEFAULT 0,
  repetition_rate DECIMAL(5,2) DEFAULT 0,
  repeated_words JSONB DEFAULT '{}',
  fluency_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for practice_sessions
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_created_at ON practice_sessions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for practice_sessions
CREATE POLICY "Users can view their own practice sessions" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice sessions" ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice sessions" ON practice_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for practice_sessions
CREATE TRIGGER update_practice_sessions_updated_at
  BEFORE UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create user_subscriptions table for SaaS billing
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_name TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create billing_history table
CREATE TABLE billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  sessions_used INTEGER DEFAULT 0,
  sessions_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Create supported_languages table
CREATE TABLE supported_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT NOT NULL UNIQUE,
  language_name JSONB NOT NULL,
  native_name TEXT NOT NULL,
  is_rtl BOOLEAN DEFAULT FALSE,
  speech_recognition_supported BOOLEAN DEFAULT TRUE,
  gemini_supported BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_plans table
CREATE TABLE pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE,
  display_name JSONB NOT NULL,
  description JSONB NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  features JSONB NOT NULL DEFAULT '[]',
  limitations JSONB DEFAULT '[]',
  session_limit INTEGER DEFAULT 5,
  ai_analysis_enabled BOOLEAN DEFAULT FALSE,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  export_enabled BOOLEAN DEFAULT FALSE,
  custom_topics BOOLEAN DEFAULT FALSE,
  team_features BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  email_notifications BOOLEAN DEFAULT TRUE,
  progress_reports BOOLEAN DEFAULT TRUE,
  ai_insights BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create ai_analysis_sessions table
CREATE TABLE ai_analysis_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code TEXT,
  gemini_request_id TEXT,
  analysis_type TEXT NOT NULL,
  ai_insights JSONB NOT NULL DEFAULT '{}',
  suggestions JSONB DEFAULT '[]',
  confidence_score DECIMAL(5,2),
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_practice_topics table
CREATE TABLE custom_practice_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title JSONB NOT NULL,
  description JSONB,
  prompts JSONB NOT NULL DEFAULT '[]',
  difficulty_level TEXT DEFAULT 'intermediate',
  category TEXT,
  language_code TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_management table
CREATE TABLE team_management (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  max_members INTEGER DEFAULT 10,
  invite_code TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES team_management(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create export_requests table
CREATE TABLE export_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  file_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create text_improvements table for Smart Text Assistant
CREATE TABLE text_improvements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  improved_text TEXT NOT NULL,
  language_code TEXT DEFAULT 'en',
  improvement_type TEXT DEFAULT 'repetition_reduction',
  repetition_reduction_percent DECIMAL(5,2),
  vocabulary_enhancement_score DECIMAL(5,2),
  ai_confidence_score DECIMAL(5,2),
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX idx_pricing_plans_active ON pricing_plans(is_active, sort_order);
CREATE INDEX idx_supported_languages_active ON supported_languages(is_active);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_ai_analysis_sessions_user_id ON ai_analysis_sessions(user_id);
CREATE INDEX idx_ai_analysis_sessions_practice_id ON ai_analysis_sessions(practice_session_id);
CREATE INDEX idx_custom_practice_topics_user_id ON custom_practice_topics(user_id);
CREATE INDEX idx_custom_practice_topics_language ON custom_practice_topics(language_code);
CREATE INDEX idx_team_management_owner ON team_management(owner_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_export_requests_user_id ON export_requests(user_id);
CREATE INDEX idx_text_improvements_user_id ON text_improvements(user_id);
CREATE INDEX idx_text_improvements_created_at ON text_improvements(created_at);

-- Enable RLS on all tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_practice_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_improvements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for billing_history
CREATE POLICY "Users can view their own billing history" ON billing_history
  FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON usage_tracking
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for pricing_plans (public read)
CREATE POLICY "Anyone can view active pricing plans" ON pricing_plans
  FOR SELECT USING (is_active = TRUE);

-- RLS policies for supported_languages (public read)
CREATE POLICY "Anyone can view active languages" ON supported_languages
  FOR SELECT USING (is_active = TRUE);

-- RLS policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for ai_analysis_sessions
CREATE POLICY "Users can view their own AI analysis" ON ai_analysis_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI analysis" ON ai_analysis_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for custom_practice_topics
CREATE POLICY "Users can manage their own topics" ON custom_practice_topics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public topics" ON custom_practice_topics
  FOR SELECT USING (is_public = TRUE);

-- RLS policies for team_management
CREATE POLICY "Team owners can manage their teams" ON team_management
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their teams" ON team_management
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = team_management.id 
      AND user_id = auth.uid()
    )
  );

-- RLS policies for team_members
CREATE POLICY "Team owners can manage members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_management 
      WHERE id = team_members.team_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their team memberships" ON team_members
  FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for export_requests
CREATE POLICY "Users can manage their own export requests" ON export_requests
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for text_improvements
CREATE POLICY "Users can view their own text improvements" ON text_improvements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own text improvements" ON text_improvements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_practice_topics_updated_at
  BEFORE UPDATE ON custom_practice_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_management_updated_at
  BEFORE UPDATE ON team_management
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Usage tracking functions
CREATE OR REPLACE FUNCTION increment_session_usage(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_month TEXT;
  current_limit INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  SELECT 
    CASE 
      WHEN us.plan_name = 'free' THEN 5
      WHEN us.plan_name = 'pro' THEN 999999
      WHEN us.plan_name = 'team' THEN 999999
      ELSE 5
    END INTO current_limit
  FROM user_subscriptions us 
  WHERE us.user_id = user_uuid;
  
  IF current_limit IS NULL THEN
    current_limit := 5;
  END IF;
  
  INSERT INTO usage_tracking (user_id, month_year, sessions_used, sessions_limit)
  VALUES (user_uuid, current_month, 1, current_limit)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    sessions_used = usage_tracking.sessions_used + 1,
    sessions_limit = current_limit,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_create_session(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_month TEXT;
  usage_record RECORD;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  SELECT sessions_used, sessions_limit 
  INTO usage_record
  FROM usage_tracking 
  WHERE user_id = user_uuid AND month_year = current_month;
  
  IF usage_record IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN usage_record.sessions_used < usage_record.sessions_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_plan_features(user_uuid UUID)
RETURNS TABLE (
  plan_name TEXT,
  session_limit INTEGER,
  ai_analysis_enabled BOOLEAN,
  advanced_analytics BOOLEAN,
  export_enabled BOOLEAN,
  custom_topics BOOLEAN,
  team_features BOOLEAN,
  api_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(pp.plan_name, 'free'),
    COALESCE(pp.session_limit, 5),
    COALESCE(pp.ai_analysis_enabled, FALSE),
    COALESCE(pp.advanced_analytics, FALSE),
    COALESCE(pp.export_enabled, FALSE),
    COALESCE(pp.custom_topics, FALSE),
    COALESCE(pp.team_features, FALSE),
    COALESCE(pp.api_access, FALSE)
  FROM user_subscriptions us
  RIGHT JOIN pricing_plans pp ON pp.plan_name = COALESCE(us.plan_name, 'free')
  WHERE us.user_id = user_uuid OR us.user_id IS NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;