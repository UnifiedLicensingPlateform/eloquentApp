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
  -- Emotional Intelligence columns
  confidence_level DECIMAL(5,2) DEFAULT 0,
  energy_level TEXT DEFAULT 'moderate', -- low, moderate, high
  anxiety_score DECIMAL(5,2) DEFAULT 0,
  positivity_score DECIMAL(5,2) DEFAULT 0,
  emotional_tone TEXT DEFAULT 'neutral', -- positive, neutral, negative, confident-energetic, anxious, etc.
  filler_words_count INTEGER DEFAULT 0,
  speaking_pace DECIMAL(5,2) DEFAULT 0, -- words per minute
  pause_analysis JSONB DEFAULT '{}', -- pause patterns and analysis
  voice_quality_score DECIMAL(5,2) DEFAULT 0,
  emotional_insights JSONB DEFAULT '{}', -- detailed emotional analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);

-- Create an index on created_at for sorting
CREATE INDEX idx_practice_sessions_created_at ON practice_sessions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own sessions
CREATE POLICY "Users can view their own practice sessions" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own sessions
CREATE POLICY "Users can insert their own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own sessions
CREATE POLICY "Users can update their own practice sessions" ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own sessions
CREATE POLICY "Users can delete their own practice sessions" ON practice_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
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
  plan_name TEXT NOT NULL DEFAULT 'free', -- free, pro, team
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, incomplete
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
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- paid, pending, failed
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table for monitoring limits
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  sessions_used INTEGER DEFAULT 0,
  sessions_limit INTEGER DEFAULT 5, -- Free plan limit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Add indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);

-- Enable RLS on new tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

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

-- Create triggers for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage tracking
CREATE OR REPLACE FUNCTION increment_session_usage(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_month TEXT;
  current_limit INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get user's current plan limit
  SELECT 
    CASE 
      WHEN us.plan_name = 'free' THEN 5
      WHEN us.plan_name = 'pro' THEN 999999 -- Unlimited
      WHEN us.plan_name = 'team' THEN 999999 -- Unlimited
      ELSE 5
    END INTO current_limit
  FROM user_subscriptions us 
  WHERE us.user_id = user_uuid;
  
  -- If no subscription found, use free plan limit
  IF current_limit IS NULL THEN
    current_limit := 5;
  END IF;
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (user_id, month_year, sessions_used, sessions_limit)
  VALUES (user_uuid, current_month, 1, current_limit)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    sessions_used = usage_tracking.sessions_used + 1,
    sessions_limit = current_limit,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create new session
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
  
  -- If no usage record, user can create session (first session of month)
  IF usage_record IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN usage_record.sessions_used < usage_record.sessions_limit;
END;
$$ LANGUAGE plpgsql;

-- Create pricing_plans table for dynamic pricing management
CREATE TABLE pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE, -- free, pro, team, enterprise
  display_name JSONB NOT NULL, -- Multi-language display names
  description JSONB NOT NULL, -- Multi-language descriptions
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  features JSONB NOT NULL DEFAULT '[]', -- Array of feature objects with multi-language support
  limitations JSONB DEFAULT '[]', -- Array of limitation objects
  session_limit INTEGER DEFAULT 5, -- Monthly session limit (-1 for unlimited)
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

-- Create supported_languages table
CREATE TABLE supported_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT NOT NULL UNIQUE, -- en, ur, ar, es, fr, etc.
  language_name JSONB NOT NULL, -- Multi-language names
  native_name TEXT NOT NULL, -- Native language name
  is_rtl BOOLEAN DEFAULT FALSE, -- Right-to-left languages
  speech_recognition_supported BOOLEAN DEFAULT TRUE,
  gemini_supported BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table for language and settings
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en' REFERENCES supported_languages(language_code),
  timezone TEXT DEFAULT 'UTC',
  email_notifications BOOLEAN DEFAULT TRUE,
  progress_reports BOOLEAN DEFAULT TRUE,
  ai_insights BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light', -- light, dark, auto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create ai_analysis_sessions table for Gemini AI insights
CREATE TABLE ai_analysis_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES supported_languages(language_code),
  gemini_request_id TEXT, -- For tracking API requests
  analysis_type TEXT NOT NULL, -- 'fluency', 'grammar', 'vocabulary', 'pronunciation'
  ai_insights JSONB NOT NULL DEFAULT '{}', -- Structured AI insights
  suggestions JSONB DEFAULT '[]', -- Array of improvement suggestions
  confidence_score DECIMAL(5,2), -- AI confidence in analysis (0-100)
  processing_time_ms INTEGER,
  tokens_used INTEGER, -- For usage tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_practice_topics table
CREATE TABLE custom_practice_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title JSONB NOT NULL, -- Multi-language titles
  description JSONB, -- Multi-language descriptions
  prompts JSONB NOT NULL DEFAULT '[]', -- Array of practice prompts
  difficulty_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced
  category TEXT, -- business, casual, academic, etc.
  language_code TEXT REFERENCES supported_languages(language_code),
  is_public BOOLEAN DEFAULT FALSE, -- Can other users use this topic?
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_management table for team plans
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
  role TEXT DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create export_requests table for tracking data exports
CREATE TABLE export_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'pdf', 'csv', 'json'
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  file_url TEXT, -- S3 or storage URL
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing plans with multi-language support
INSERT INTO pricing_plans (
  plan_name, 
  display_name, 
  description, 
  price_monthly, 
  price_yearly,
  features,
  limitations,
  session_limit,
  sort_order
) VALUES 
(
  'free',
  '{"en": "Free", "ur": "مفت", "ar": "مجاني", "es": "Gratis", "fr": "Gratuit"}',
  '{"en": "Perfect for getting started", "ur": "شروعات کے لیے بہترین", "ar": "مثالي للبدء", "es": "Perfecto para empezar", "fr": "Parfait pour commencer"}',
  0.00,
  0.00,
  '[
    {"en": "5 practice sessions per month", "ur": "ماہانہ 5 مشق سیشن", "ar": "5 جلسات تدريب شهريا", "es": "5 sesiones de práctica por mes", "fr": "5 sessions de pratique par mois"},
    {"en": "Basic repetition analysis", "ur": "بنیادی تکرار تجزیہ", "ar": "تحليل التكرار الأساسي", "es": "Análisis básico de repetición", "fr": "Analyse de répétition de base"},
    {"en": "Simple progress tracking", "ur": "سادہ پیش قدمی ٹریکنگ", "ar": "تتبع التقدم البسيط", "es": "Seguimiento simple del progreso", "fr": "Suivi simple des progrès"},
    {"en": "Web app access", "ur": "ویب ایپ رسائی", "ar": "الوصول إلى تطبيق الويب", "es": "Acceso a la aplicación web", "fr": "Accès à la application web"}
  ]',
  '[
    {"en": "No emotional intelligence coaching", "ur": "کوئی جذباتی ذہانت کوچنگ نہیں", "ar": "لا يوجد تدريب ذكاء عاطفي", "es": "Sin coaching de inteligencia emocional", "fr": "Pas de coaching intelligence émotionnelle"},
    {"en": "No AI insights", "ur": "کوئی AI بصیرت نہیں", "ar": "لا توجد رؤى ذكية", "es": "Sin información de IA", "fr": "Pas de insights IA"},
    {"en": "No export features", "ur": "کوئی ایکسپورٹ فیچر نہیں", "ar": "لا توجد ميزات تصدير", "es": "Sin funciones de exportación", "fr": "Pas de fonctions de export"}
  ]',
  5,
  1
),
(
  'pro',
  '{"en": "Pro", "ur": "پرو", "ar": "احترافي", "es": "Pro", "fr": "Pro"}',
  '{"en": "For serious speech improvement", "ur": "سنجیدہ تقریری بہتری کے لیے", "ar": "لتحسين الكلام الجاد", "es": "Para mejora seria del habla", "fr": "Pour une amélioration sérieuse de la parole"}',
  9.99,
  99.99,
  '[
    {"en": "Unlimited practice sessions", "ur": "لامحدود مشق سیشن", "ar": "جلسات تدريب غير محدودة", "es": "Sesiones de práctica ilimitadas", "fr": "Sessions de pratique illimitées"},
    {"en": "🎭 Emotional Intelligence coaching", "ur": "🎭 جذباتی ذہانت کوچنگ", "ar": "🎭 تدريب الذكاء العاطفي", "es": "🎭 Coaching de inteligencia emocional", "fr": "🎭 Coaching intelligence émotionnelle"},
    {"en": "Real-time confidence & anxiety tracking", "ur": "ریئل ٹائم اعتماد اور پریشانی ٹریکنگ", "ar": "تتبع الثقة والقلق في الوقت الفعلي", "es": "Seguimiento de confianza y ansiedad en tiempo real", "fr": "Suivi confiance et anxiété en temps réel"},
    {"en": "AI-powered insights with Gemini", "ur": "Gemini کے ساتھ AI طاقت سے بھرپور بصیرت", "ar": "رؤى مدعومة بالذكاء الاصطناعي مع Gemini", "es": "Información impulsada por IA con Gemini", "fr": "Insights alimentés par IA avec Gemini"},
    {"en": "Advanced speech analytics", "ur": "اعلیٰ درجے کی تقریری تجزیات", "ar": "تحليلات الكلام المتقدمة", "es": "Análisis avanzado del habla", "fr": "Analyses avancées de la parole"},
    {"en": "Progress export (PDF/CSV)", "ur": "پیش قدمی ایکسپورٹ (PDF/CSV)", "ar": "تصدير التقدم (PDF/CSV)", "es": "Exportación de progreso (PDF/CSV)", "fr": "Export des progrès (PDF/CSV)"},
    {"en": "Custom practice topics", "ur": "کسٹم مشق کے موضوعات", "ar": "مواضيع تدريب مخصصة", "es": "Temas de práctica personalizados", "fr": "Sujets de pratique personnalisés"},
    {"en": "Multi-language support", "ur": "کثیر زبان سپورٹ", "ar": "دعم متعدد اللغات", "es": "Soporte multiidioma", "fr": "Support multilingue"}
  ]',
  '[]',
  -1,
  2
),
(
  'team',
  '{"en": "Team", "ur": "ٹیم", "ar": "فريق", "es": "Equipo", "fr": "Équipe"}',
  '{"en": "For coaches and organizations", "ur": "کوچز اور تنظیموں کے لیے", "ar": "للمدربين والمنظمات", "es": "Para entrenadores y organizaciones", "fr": "Pour les coachs et organisations"}',
  29.99,
  299.99,
  '[
    {"en": "Everything in Pro", "ur": "پرو میں سب کچھ", "ar": "كل شيء في الاحترافي", "es": "Todo en Pro", "fr": "Tout dans Pro"},
    {"en": "🎯 Advanced EI analytics & trends", "ur": "🎯 اعلیٰ درجے کی EI تجزیات اور رجحانات", "ar": "🎯 تحليلات وتوجهات الذكاء العاطفي المتقدمة", "es": "🎯 Análisis y tendencias avanzadas de IE", "fr": "🎯 Analyses et tendances IE avancées"},
    {"en": "Team emotional intelligence dashboard", "ur": "ٹیم جذباتی ذہانت ڈیش بورڈ", "ar": "لوحة الذكاء العاطفي للفريق", "es": "Panel de inteligencia emocional del equipo", "fr": "Tableau de bord intelligence émotionnelle équipe"},
    {"en": "Presentation practice coaching", "ur": "پریزنٹیشن پریکٹس کوچنگ", "ar": "تدريب ممارسة العروض التقديمية", "es": "Coaching de práctica de presentaciones", "fr": "Coaching pratique de présentation"},
    {"en": "Up to 10 team members", "ur": "10 ٹیم ممبرز تک", "ar": "حتى 10 أعضاء فريق", "es": "Hasta 10 miembros del equipo", "fr": "Jusquà 10 membres de équipe"},
    {"en": "Team progress dashboard", "ur": "ٹیم پیش قدمی ڈیش بورڈ", "ar": "لوحة تقدم الفريق", "es": "Panel de progreso del equipo", "fr": "Tableau de bord des progrès de équipe"},
    {"en": "Bulk user management", "ur": "بلک یوزر منیجمنٹ", "ar": "إدارة المستخدمين بالجملة", "es": "Gestión masiva de usuarios", "fr": "Gestion en masse des utilisateurs"},
    {"en": "API access", "ur": "API رسائی", "ar": "الوصول إلى API", "es": "Acceso a API", "fr": "Accès API"},
    {"en": "Priority support", "ur": "ترجیحی سپورٹ", "ar": "دعم أولوية", "es": "Soporte prioritario", "fr": "Support prioritaire"}
  ]',
  '[]',
  -1,
  3
);

-- Insert supported languages
INSERT INTO supported_languages (language_code, language_name, native_name, is_rtl, speech_recognition_supported, gemini_supported) VALUES
('en', '{"en": "English", "ur": "انگریزی", "ar": "الإنجليزية", "es": "Inglés", "fr": "Anglais"}', 'English', FALSE, TRUE, TRUE),
('ur', '{"en": "Urdu", "ur": "اردو", "ar": "الأردية", "es": "Urdu", "fr": "Ourdou"}', 'اردو', TRUE, TRUE, TRUE),
('ar', '{"en": "Arabic", "ur": "عربی", "ar": "العربية", "es": "Árabe", "fr": "Arabe"}', 'العربية', TRUE, TRUE, TRUE),
('es', '{"en": "Spanish", "ur": "ہسپانوی", "ar": "الإسبانية", "es": "Español", "fr": "Espagnol"}', 'Español', FALSE, TRUE, TRUE),
('fr', '{"en": "French", "ur": "فرانسیسی", "ar": "الفرنسية", "es": "Francés", "fr": "Français"}', 'Français', FALSE, TRUE, TRUE),
('de', '{"en": "German", "ur": "جرمن", "ar": "الألمانية", "es": "Alemán", "fr": "Allemand"}', 'Deutsch', FALSE, TRUE, TRUE),
('hi', '{"en": "Hindi", "ur": "ہندی", "ar": "الهندية", "es": "Hindi", "fr": "Hindi"}', 'हिन्दी', FALSE, TRUE, TRUE),
('zh', '{"en": "Chinese", "ur": "چینی", "ar": "الصينية", "es": "Chino", "fr": "Chinois"}', '中文', FALSE, TRUE, TRUE),
('ja', '{"en": "Japanese", "ur": "جاپانی", "ar": "اليابانية", "es": "Japonés", "fr": "Japonais"}', '日本語', FALSE, TRUE, TRUE),
('ko', '{"en": "Korean", "ur": "کوریائی", "ar": "الكورية", "es": "Coreano", "fr": "Coréen"}', '한국어', FALSE, TRUE, TRUE);

-- Add indexes for performance
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

-- Enable RLS on new tables
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_practice_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;

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

-- Create triggers for updated_at columns
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

-- Function to get user's current plan with features
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