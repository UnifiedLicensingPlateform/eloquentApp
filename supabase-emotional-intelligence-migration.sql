-- Emotional Intelligence Migration
-- This migration adds tables and columns to support advanced emotional intelligence features

-- Add emotional intelligence columns to practice_sessions table
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS confidence_level DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS energy_level TEXT DEFAULT 'moderate'; -- low, moderate, high
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS anxiety_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS positivity_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS emotional_tone TEXT DEFAULT 'neutral'; -- positive, neutral, negative, confident-energetic, anxious, etc.
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS filler_words_count INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS speaking_pace DECIMAL(5,2) DEFAULT 0; -- words per minute
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS pause_analysis JSONB DEFAULT '{}'; -- pause patterns and analysis
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS voice_quality_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS emotional_insights JSONB DEFAULT '{}'; -- detailed emotional analysis

-- Create emotional_intelligence_sessions table for detailed EI tracking
CREATE TABLE IF NOT EXISTS emotional_intelligence_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Emotional Intelligence Metrics
  confidence_level DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100
  energy_level TEXT NOT NULL DEFAULT 'moderate', -- low, moderate, high
  anxiety_score DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-10 scale
  positivity_score DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100
  emotional_tone TEXT NOT NULL DEFAULT 'neutral',
  
  -- Speech Analysis Metrics
  speaking_pace DECIMAL(5,2) DEFAULT 0, -- words per minute
  filler_words_count INTEGER DEFAULT 0,
  filler_words_list JSONB DEFAULT '[]', -- array of detected filler words
  repetitive_patterns JSONB DEFAULT '[]', -- detected repetitive speech patterns
  
  -- Voice Quality Indicators (estimated from transcript analysis)
  clarity_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  articulation_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  variation_score DECIMAL(5,2) DEFAULT 0, -- 0-100 (pitch/tone variation)
  projection_score DECIMAL(5,2) DEFAULT 0, -- 0-100 (confidence in delivery)
  
  -- Pause and Pacing Analysis
  pause_analysis JSONB DEFAULT '{}', -- detailed pause patterns
  sentence_length_avg DECIMAL(5,2) DEFAULT 0,
  words_per_sentence DECIMAL(5,2) DEFAULT 0,
  
  -- Sentiment Analysis
  sentiment_positive DECIMAL(5,2) DEFAULT 0, -- percentage of positive words
  sentiment_negative DECIMAL(5,2) DEFAULT 0, -- percentage of negative words
  sentiment_neutral DECIMAL(5,2) DEFAULT 0, -- percentage of neutral words
  confidence_words_count INTEGER DEFAULT 0,
  uncertainty_words_count INTEGER DEFAULT 0,
  
  -- Overall Scores
  overall_ei_score DECIMAL(5,2) DEFAULT 0, -- 0-100 overall emotional intelligence
  audience_engagement_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  message_clarity_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  professional_presence_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  
  -- AI Analysis Results
  ai_insights JSONB DEFAULT '{}', -- structured AI insights
  recommendations JSONB DEFAULT '[]', -- array of improvement suggestions
  strengths JSONB DEFAULT '[]', -- identified strengths
  growth_areas JSONB DEFAULT '[]', -- areas for improvement
  
  -- Metadata
  analysis_version TEXT DEFAULT '1.0', -- for tracking analysis algorithm versions
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emotional_intelligence_trends table for tracking progress over time
CREATE TABLE IF NOT EXISTS emotional_intelligence_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_period DATE NOT NULL, -- daily aggregation
  
  -- Daily Averages
  avg_confidence_level DECIMAL(5,2) DEFAULT 0,
  avg_energy_level_score DECIMAL(5,2) DEFAULT 0, -- converted to numeric for trending
  avg_anxiety_score DECIMAL(5,2) DEFAULT 0,
  avg_positivity_score DECIMAL(5,2) DEFAULT 0,
  avg_overall_ei_score DECIMAL(5,2) DEFAULT 0,
  
  -- Daily Counts
  sessions_count INTEGER DEFAULT 0,
  total_words_spoken INTEGER DEFAULT 0,
  total_practice_time_seconds INTEGER DEFAULT 0,
  
  -- Improvement Indicators
  confidence_trend DECIMAL(5,2) DEFAULT 0, -- change from previous period
  anxiety_trend DECIMAL(5,2) DEFAULT 0, -- change from previous period
  overall_trend DECIMAL(5,2) DEFAULT 0, -- change from previous period
  
  -- Energy Distribution
  high_energy_sessions INTEGER DEFAULT 0,
  moderate_energy_sessions INTEGER DEFAULT 0,
  low_energy_sessions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date_period)
);

-- Create presentation_practice_sessions table for specialized presentation training
CREATE TABLE IF NOT EXISTS presentation_practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Presentation Details
  presentation_type TEXT NOT NULL DEFAULT 'general', -- business_pitch, job_interview, wedding_speech, conference_talk, sales_presentation, elevator_pitch
  presentation_title TEXT,
  target_duration_seconds INTEGER, -- intended presentation length
  actual_duration_seconds INTEGER, -- actual recorded length
  
  -- Presentation-Specific Analysis
  structure_score DECIMAL(5,2) DEFAULT 0, -- 0-100 (introduction, body, conclusion)
  storytelling_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  persuasion_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  call_to_action_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  audience_engagement_techniques JSONB DEFAULT '[]', -- questions, stories, direct address
  
  -- Content Analysis
  key_messages JSONB DEFAULT '[]', -- extracted key points
  transition_words_count INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  stories_told INTEGER DEFAULT 0,
  examples_given INTEGER DEFAULT 0,
  
  -- Delivery Analysis
  opening_strength DECIMAL(5,2) DEFAULT 0, -- 0-100
  closing_strength DECIMAL(5,2) DEFAULT 0, -- 0-100
  flow_continuity DECIMAL(5,2) DEFAULT 0, -- 0-100
  
  -- Specialized Feedback
  presentation_feedback JSONB DEFAULT '{}', -- type-specific feedback
  improvement_plan JSONB DEFAULT '[]', -- personalized improvement suggestions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emotional_coaching_feedback table for real-time coaching history
CREATE TABLE IF NOT EXISTS emotional_coaching_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feedback Details
  feedback_type TEXT NOT NULL, -- positive, suggestion, calming, excellent, warning
  feedback_category TEXT NOT NULL, -- confidence, energy, anxiety, overall, pacing, clarity
  feedback_message TEXT NOT NULL,
  feedback_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Context
  transcript_segment TEXT, -- the part of transcript that triggered this feedback
  confidence_at_time DECIMAL(5,2),
  energy_at_time TEXT,
  anxiety_at_time DECIMAL(5,2),
  
  -- User Interaction
  was_helpful BOOLEAN, -- user can mark feedback as helpful or not
  user_response TEXT, -- user can add notes about the feedback
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_ei_goals table for personalized improvement goals
CREATE TABLE IF NOT EXISTS user_ei_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Details
  goal_type TEXT NOT NULL, -- confidence, anxiety_reduction, energy_boost, overall_improvement
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_score DECIMAL(5,2) NOT NULL, -- target score to achieve
  current_score DECIMAL(5,2) DEFAULT 0, -- current baseline score
  
  -- Timeline
  target_date DATE,
  created_date DATE DEFAULT CURRENT_DATE,
  
  -- Progress Tracking
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_date DATE,
  progress_percentage DECIMAL(5,2) DEFAULT 0, -- 0-100
  
  -- Milestones
  milestones JSONB DEFAULT '[]', -- array of milestone objects
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  priority_level TEXT DEFAULT 'medium', -- low, medium, high
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
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

-- Enable Row Level Security (RLS)
ALTER TABLE emotional_intelligence_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_intelligence_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_coaching_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ei_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emotional_intelligence_sessions
CREATE POLICY "Users can view their own EI sessions" ON emotional_intelligence_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own EI sessions" ON emotional_intelligence_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own EI sessions" ON emotional_intelligence_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own EI sessions" ON emotional_intelligence_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emotional_intelligence_trends
CREATE POLICY "Users can view their own EI trends" ON emotional_intelligence_trends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage EI trends" ON emotional_intelligence_trends
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for presentation_practice_sessions
CREATE POLICY "Users can view their own presentation sessions" ON presentation_practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentation sessions" ON presentation_practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentation sessions" ON presentation_practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation sessions" ON presentation_practice_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emotional_coaching_feedback
CREATE POLICY "Users can view their own coaching feedback" ON emotional_coaching_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert coaching feedback" ON emotional_coaching_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback responses" ON emotional_coaching_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_ei_goals
CREATE POLICY "Users can manage their own EI goals" ON user_ei_goals
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
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

-- Function to calculate and store emotional intelligence analysis
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
  -- Insert emotional intelligence session
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
  
  -- Update or insert daily trend data
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

-- Function to get user's emotional intelligence progress
CREATE OR REPLACE FUNCTION get_user_ei_progress(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date_period DATE,
  avg_confidence DECIMAL(5,2),
  avg_anxiety DECIMAL(5,2),
  avg_positivity DECIMAL(5,2),
  avg_overall DECIMAL(5,2),
  sessions_count INTEGER,
  confidence_trend DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.date_period,
    t.avg_confidence_level,
    t.avg_anxiety_score,
    t.avg_positivity_score,
    t.avg_overall_ei_score,
    t.sessions_count,
    t.confidence_trend
  FROM emotional_intelligence_trends t
  WHERE t.user_id = p_user_id
    AND t.date_period >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
  ORDER BY t.date_period DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to store real-time coaching feedback
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

-- Note: Sample presentation topics can be added later through the application
-- The following INSERT statements are commented out because they require a valid user_id
-- You can run these manually after creating a system user or use your own user_id

/*
-- Sample presentation types for presentation practice
-- To use these, replace '00000000-0000-0000-0000-000000000000' with a valid user_id

-- Business Pitch Training
INSERT INTO custom_practice_topics (
  user_id,
  title,
  description,
  prompts,
  difficulty_level,
  category,
  language_code,
  is_public
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with valid user_id
  '{"en": "Business Pitch Training", "ur": "کاروباری پچ ٹریننگ", "ar": "تدريب عرض الأعمال", "es": "Entrenamiento de Presentación de Negocios", "fr": "Formation de Présentation d''Affaires"}',
  '{"en": "Practice delivering compelling business pitches with confidence and clarity", "ur": "اعتماد اور وضاحت کے ساتھ دلکش کاروباری پچ پیش کرنے کی مشق کریں", "ar": "تدرب على تقديم عروض أعمال مقنعة بثقة ووضوح", "es": "Practica entregar presentaciones de negocios convincentes con confianza y claridad", "fr": "Pratiquez la livraison de présentations d''affaires convaincantes avec confiance et clarté"}',
  '[
    {"en": "Present your startup idea to potential investors", "ur": "ممکنہ سرمایہ کاروں کو اپنا اسٹارٹ اپ آئیڈیا پیش کریں", "ar": "اعرض فكرة شركتك الناشئة على المستثمرين المحتملين", "es": "Presenta tu idea de startup a posibles inversores", "fr": "Présentez votre idée de startup à des investisseurs potentiels"},
    {"en": "Pitch a new product to your company leadership", "ur": "اپنی کمپنی کی قیادت کو نیا پروڈکٹ پیش کریں", "ar": "اعرض منتجاً جديداً على قيادة شركتك", "es": "Presenta un nuevo producto a la dirección de tu empresa", "fr": "Présentez un nouveau produit à la direction de votre entreprise"},
    {"en": "Propose a strategic partnership to another business", "ur": "دوسرے کاروبار کو اسٹریٹجک پارٹنرشپ تجویز کریں", "ar": "اقترح شراكة استراتيجية مع شركة أخرى", "es": "Propón una asociación estratégica a otra empresa", "fr": "Proposez un partenariat stratégique à une autre entreprise"}
  ]',
  'intermediate',
  'business',
  'en',
  TRUE
);

-- Job Interview Simulation
INSERT INTO custom_practice_topics (
  user_id,
  title,
  description,
  prompts,
  difficulty_level,
  category,
  language_code,
  is_public
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with valid user_id
  '{"en": "Job Interview Simulation", "ur": "ملازمت انٹرویو سیمولیشن", "ar": "محاكاة مقابلة العمل", "es": "Simulación de Entrevista de Trabajo", "fr": "Simulation d''Entretien d''Embauche"}',
  '{"en": "Master job interview skills with STAR method coaching and confidence building", "ur": "STAR طریقہ کار کی کوچنگ اور اعتماد سازی کے ساتھ ملازمت انٹرویو کی مہارت میں مہارت حاصل کریں", "ar": "أتقن مهارات مقابلة العمل مع تدريب طريقة STAR وبناء الثقة", "es": "Domina las habilidades de entrevista de trabajo con coaching del método STAR y construcción de confianza", "fr": "Maîtrisez les compétences d''entretien d''embauche avec le coaching de la méthode STAR et le renforcement de la confiance"}',
  '[
    {"en": "Tell me about yourself and your background", "ur": "اپنے بارے میں اور اپنے پس منظر کے بارے میں بتائیں", "ar": "أخبرني عن نفسك وخلفيتك", "es": "Háblame de ti y tu experiencia", "fr": "Parlez-moi de vous et de votre parcours"},
    {"en": "Describe a challenging situation you overcame at work", "ur": "کام پر آپ نے جس مشکل صورتحال پر قابو پایا اس کا بیان کریں", "ar": "صف موقفاً صعباً تغلبت عليه في العمل", "es": "Describe una situación desafiante que superaste en el trabajo", "fr": "Décrivez une situation difficile que vous avez surmontée au travail"},
    {"en": "Why do you want to work for our company?", "ur": "آپ ہماری کمپنی کے لیے کیوں کام کرنا چاہتے ہیں؟", "ar": "لماذا تريد العمل في شركتنا؟", "es": "¿Por qué quieres trabajar para nuestra empresa?", "fr": "Pourquoi voulez-vous travailler pour notre entreprise?"}
  ]',
  'intermediate',
  'professional',
  'en',
  TRUE
);
*/

-- Add comment for migration tracking
COMMENT ON TABLE emotional_intelligence_sessions IS 'Stores detailed emotional intelligence analysis for each practice session';
COMMENT ON TABLE emotional_intelligence_trends IS 'Tracks daily aggregated emotional intelligence progress for trending analysis';
COMMENT ON TABLE presentation_practice_sessions IS 'Specialized table for presentation-specific practice sessions and analysis';
COMMENT ON TABLE emotional_coaching_feedback IS 'Stores real-time coaching feedback provided during practice sessions';
COMMENT ON TABLE user_ei_goals IS 'User-defined emotional intelligence improvement goals and progress tracking';

-- Migration completed successfully
SELECT 'Emotional Intelligence migration completed successfully!' as status;