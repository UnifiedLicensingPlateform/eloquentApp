-- Emotional Intelligence Production Migration
-- This migration adds EI features to the existing production schema

-- Step 1: Add EI columns to existing practice_sessions table
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS confidence_level DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS energy_level TEXT DEFAULT 'moderate';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS anxiety_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS positivity_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS emotional_tone TEXT DEFAULT 'neutral';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS filler_words_count INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS speaking_pace DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS pause_analysis JSONB DEFAULT '{}';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS voice_quality_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS emotional_insights JSONB DEFAULT '{}';

-- Step 2: Add EI features to pricing_plans table
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS emotional_intelligence_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS presentation_coaching BOOLEAN DEFAULT FALSE;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS real_time_coaching BOOLEAN DEFAULT FALSE;

-- Step 3: Update existing pricing plans with EI features
UPDATE pricing_plans SET 
  emotional_intelligence_enabled = FALSE,
  presentation_coaching = FALSE,
  real_time_coaching = FALSE
WHERE plan_name = 'free';

UPDATE pricing_plans SET 
  emotional_intelligence_enabled = TRUE,
  presentation_coaching = TRUE,
  real_time_coaching = TRUE
WHERE plan_name = 'pro';

UPDATE pricing_plans SET 
  emotional_intelligence_enabled = TRUE,
  presentation_coaching = TRUE,
  real_time_coaching = TRUE
WHERE plan_name = 'team';

-- Step 4: Create emotional_intelligence_sessions table
CREATE TABLE IF NOT EXISTS emotional_intelligence_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core EI Metrics
  confidence_level DECIMAL(5,2) NOT NULL DEFAULT 0,
  energy_level TEXT NOT NULL DEFAULT 'moderate',
  anxiety_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  positivity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  emotional_tone TEXT NOT NULL DEFAULT 'neutral',
  
  -- Speech Analysis
  speaking_pace DECIMAL(5,2) DEFAULT 0,
  filler_words_count INTEGER DEFAULT 0,
  filler_words_list JSONB DEFAULT '[]',
  repetitive_patterns JSONB DEFAULT '[]',
  
  -- Voice Quality
  clarity_score DECIMAL(5,2) DEFAULT 0,
  articulation_score DECIMAL(5,2) DEFAULT 0,
  variation_score DECIMAL(5,2) DEFAULT 0,
  projection_score DECIMAL(5,2) DEFAULT 0,
  
  -- Pause Analysis
  pause_analysis JSONB DEFAULT '{}',
  sentence_length_avg DECIMAL(5,2) DEFAULT 0,
  words_per_sentence DECIMAL(5,2) DEFAULT 0,
  
  -- Sentiment Analysis
  sentiment_positive DECIMAL(5,2) DEFAULT 0,
  sentiment_negative DECIMAL(5,2) DEFAULT 0,
  sentiment_neutral DECIMAL(5,2) DEFAULT 0,
  confidence_words_count INTEGER DEFAULT 0,
  uncertainty_words_count INTEGER DEFAULT 0,
  
  -- Overall Scores
  overall_ei_score DECIMAL(5,2) DEFAULT 0,
  audience_engagement_score DECIMAL(5,2) DEFAULT 0,
  message_clarity_score DECIMAL(5,2) DEFAULT 0,
  professional_presence_score DECIMAL(5,2) DEFAULT 0,
  
  -- AI Analysis
  ai_insights JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  growth_areas JSONB DEFAULT '[]',
  
  -- Metadata
  analysis_version TEXT DEFAULT '1.0',
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create emotional_intelligence_trends table
CREATE TABLE IF NOT EXISTS emotional_intelligence_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_period DATE NOT NULL,
  
  -- Daily Averages
  avg_confidence_level DECIMAL(5,2) DEFAULT 0,
  avg_energy_level_score DECIMAL(5,2) DEFAULT 0,
  avg_anxiety_score DECIMAL(5,2) DEFAULT 0,
  avg_positivity_score DECIMAL(5,2) DEFAULT 0,
  avg_overall_ei_score DECIMAL(5,2) DEFAULT 0,
  
  -- Daily Counts
  sessions_count INTEGER DEFAULT 0,
  total_words_spoken INTEGER DEFAULT 0,
  total_practice_time_seconds INTEGER DEFAULT 0,
  
  -- Trends
  confidence_trend DECIMAL(5,2) DEFAULT 0,
  anxiety_trend DECIMAL(5,2) DEFAULT 0,
  overall_trend DECIMAL(5,2) DEFAULT 0,
  
  -- Energy Distribution
  high_energy_sessions INTEGER DEFAULT 0,
  moderate_energy_sessions INTEGER DEFAULT 0,
  low_energy_sessions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date_period)
);

-- Step 6: Create presentation_practice_sessions table
CREATE TABLE IF NOT EXISTS presentation_practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Presentation Details
  presentation_type TEXT NOT NULL DEFAULT 'general',
  presentation_title TEXT,
  target_duration_seconds INTEGER,
  actual_duration_seconds INTEGER,
  
  -- Analysis
  structure_score DECIMAL(5,2) DEFAULT 0,
  storytelling_score DECIMAL(5,2) DEFAULT 0,
  persuasion_score DECIMAL(5,2) DEFAULT 0,
  call_to_action_score DECIMAL(5,2) DEFAULT 0,
  audience_engagement_techniques JSONB DEFAULT '[]',
  
  -- Content Analysis
  key_messages JSONB DEFAULT '[]',
  transition_words_count INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  stories_told INTEGER DEFAULT 0,
  examples_given INTEGER DEFAULT 0,
  
  -- Delivery Analysis
  opening_strength DECIMAL(5,2) DEFAULT 0,
  closing_strength DECIMAL(5,2) DEFAULT 0,
  flow_continuity DECIMAL(5,2) DEFAULT 0,
  
  -- Feedback
  presentation_feedback JSONB DEFAULT '{}',
  improvement_plan JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create emotional_coaching_feedback table
CREATE TABLE IF NOT EXISTS emotional_coaching_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feedback Details
  feedback_type TEXT NOT NULL,
  feedback_category TEXT NOT NULL,
  feedback_message TEXT NOT NULL,
  feedback_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Context
  transcript_segment TEXT,
  confidence_at_time DECIMAL(5,2),
  energy_at_time TEXT,
  anxiety_at_time DECIMAL(5,2),
  
  -- User Interaction
  was_helpful BOOLEAN,
  user_response TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create user_ei_goals table
CREATE TABLE IF NOT EXISTS user_ei_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Details
  goal_type TEXT NOT NULL,
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_score DECIMAL(5,2) NOT NULL,
  current_score DECIMAL(5,2) DEFAULT 0,
  
  -- Timeline
  target_date DATE,
  created_date DATE DEFAULT CURRENT_DATE,
  
  -- Progress
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_date DATE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Milestones
  milestones JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  priority_level TEXT DEFAULT 'medium',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_emotional_intelligence_sessions_user_id ON emotional_intelligence_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_intelligence_sessions_practice_id ON emotional_intelligence_sessions(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_emotional_intelligence_sessions_created_at ON emotional_intelligence_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_emotional_intelligence_trends_user_date ON emotional_intelligence_trends(user_id, date_period);
CREATE INDEX IF NOT EXISTS idx_emotional_intelligence_trends_date ON emotional_intelligence_trends(date_period);

CREATE INDEX IF NOT EXISTS idx_presentation_practice_sessions_user_id ON presentation_practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_practice_sessions_type ON presentation_practice_sessions(presentation_type);
CREATE INDEX IF NOT EXISTS idx_presentation_practice_sessions_created_at ON presentation_practice_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_emotional_coaching_feedback_user_id ON emotional_coaching_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_coaching_feedback_session_id ON emotional_coaching_feedback(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_emotional_coaching_feedback_timestamp ON emotional_coaching_feedback(feedback_timestamp);

CREATE INDEX IF NOT EXISTS idx_user_ei_goals_user_id ON user_ei_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ei_goals_active ON user_ei_goals(user_id, is_active);

-- Step 10: Enable Row Level Security
ALTER TABLE emotional_intelligence_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_intelligence_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_coaching_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ei_goals ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS Policies
CREATE POLICY "Users can view their own EI sessions" ON emotional_intelligence_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own EI sessions" ON emotional_intelligence_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own EI sessions" ON emotional_intelligence_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own EI sessions" ON emotional_intelligence_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own EI trends" ON emotional_intelligence_trends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage EI trends" ON emotional_intelligence_trends
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own presentation sessions" ON presentation_practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentation sessions" ON presentation_practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentation sessions" ON presentation_practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation sessions" ON presentation_practice_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own coaching feedback" ON emotional_coaching_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert coaching feedback" ON emotional_coaching_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback responses" ON emotional_coaching_feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own EI goals" ON user_ei_goals
  FOR ALL USING (auth.uid() = user_id);

-- Step 12: Create triggers for updated_at columns
CREATE TRIGGER update_emotional_intelligence_sessions_updated_at
  BEFORE UPDATE ON emotional_intelligence_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emotional_intelligence_trends_updated_at
  BEFORE UPDATE ON emotional_intelligence_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentation_practice_sessions_updated_at
  BEFORE UPDATE ON presentation_practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ei_goals_updated_at
  BEFORE UPDATE ON user_ei_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 13: Create EI analysis function
CREATE OR REPLACE FUNCTION store_emotional_intelligence_analysis(
  p_practice_session_id UUID,
  p_user_id UUID,
  p_confidence_level DECIMAL(5,2),
  p_energy_level TEXT,
  p_anxiety_score DECIMAL(5,2),
  p_positivity_score DECIMAL(5,2),
  p_emotional_tone TEXT,
  p_analysis_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  ei_session_id UUID;
BEGIN
  -- Insert EI session
  INSERT INTO emotional_intelligence_sessions (
    practice_session_id,
    user_id,
    confidence_level,
    energy_level,
    anxiety_score,
    positivity_score,
    emotional_tone,
    ai_insights
  ) VALUES (
    p_practice_session_id,
    p_user_id,
    p_confidence_level,
    p_energy_level,
    p_anxiety_score,
    p_positivity_score,
    p_emotional_tone,
    p_analysis_data
  ) RETURNING id INTO ei_session_id;
  
  -- Update practice session with EI data
  UPDATE practice_sessions SET
    confidence_level = p_confidence_level,
    energy_level = p_energy_level,
    anxiety_score = p_anxiety_score,
    positivity_score = p_positivity_score,
    emotional_tone = p_emotional_tone,
    emotional_insights = p_analysis_data,
    updated_at = NOW()
  WHERE id = p_practice_session_id;
  
  -- Update daily trends
  INSERT INTO emotional_intelligence_trends (
    user_id,
    date_period,
    avg_confidence_level,
    avg_anxiety_score,
    avg_positivity_score,
    sessions_count
  ) VALUES (
    p_user_id,
    CURRENT_DATE,
    p_confidence_level,
    p_anxiety_score,
    p_positivity_score,
    1
  ) ON CONFLICT (user_id, date_period)
  DO UPDATE SET
    avg_confidence_level = (emotional_intelligence_trends.avg_confidence_level * emotional_intelligence_trends.sessions_count + p_confidence_level) / (emotional_intelligence_trends.sessions_count + 1),
    avg_anxiety_score = (emotional_intelligence_trends.avg_anxiety_score * emotional_intelligence_trends.sessions_count + p_anxiety_score) / (emotional_intelligence_trends.sessions_count + 1),
    avg_positivity_score = (emotional_intelligence_trends.avg_positivity_score * emotional_intelligence_trends.sessions_count + p_positivity_score) / (emotional_intelligence_trends.sessions_count + 1),
    sessions_count = emotional_intelligence_trends.sessions_count + 1,
    updated_at = NOW();
  
  RETURN ei_session_id;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create coaching feedback function
CREATE OR REPLACE FUNCTION store_coaching_feedback(
  p_practice_session_id UUID,
  p_user_id UUID,
  p_feedback_type TEXT,
  p_feedback_category TEXT,
  p_feedback_message TEXT,
  p_transcript_segment TEXT DEFAULT NULL,
  p_confidence_at_time DECIMAL(5,2) DEFAULT NULL,
  p_energy_at_time TEXT DEFAULT NULL,
  p_anxiety_at_time DECIMAL(5,2) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  feedback_id UUID;
BEGIN
  INSERT INTO emotional_coaching_feedback (
    practice_session_id,
    user_id,
    feedback_type,
    feedback_category,
    feedback_message,
    transcript_segment,
    confidence_at_time,
    energy_at_time,
    anxiety_at_time
  ) VALUES (
    p_practice_session_id,
    p_user_id,
    p_feedback_type,
    p_feedback_category,
    p_feedback_message,
    p_transcript_segment,
    p_confidence_at_time,
    p_energy_at_time,
    p_anxiety_at_time
  ) RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$ LANGUAGE plpgsql;

-- Step 15: Update user plan features function
CREATE OR REPLACE FUNCTION get_user_plan_features(user_uuid UUID)
RETURNS TABLE (
  plan_name TEXT,
  session_limit INTEGER,
  ai_analysis_enabled BOOLEAN,
  advanced_analytics BOOLEAN,
  export_enabled BOOLEAN,
  custom_topics BOOLEAN,
  team_features BOOLEAN,
  api_access BOOLEAN,
  emotional_intelligence_enabled BOOLEAN,
  presentation_coaching BOOLEAN,
  real_time_coaching BOOLEAN
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
    COALESCE(pp.api_access, FALSE),
    COALESCE(pp.emotional_intelligence_enabled, FALSE),
    COALESCE(pp.presentation_coaching, FALSE),
    COALESCE(pp.real_time_coaching, FALSE)
  FROM user_subscriptions us
  RIGHT JOIN pricing_plans pp ON pp.plan_name = COALESCE(us.plan_name, 'free')
  WHERE us.user_id = user_uuid OR us.user_id IS NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Migration completed successfully
SELECT 'Emotional Intelligence production migration completed successfully!' as status;