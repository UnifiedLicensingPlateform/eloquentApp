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

-- Insert pricing plans (Free Plan)
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
) VALUES (
  'free',
  '{"en": "Free", "ur": "مفت", "ar": "مجاني", "es": "Gratis", "fr": "Gratuit"}',
  '{"en": "Perfect for getting started", "ur": "شروعات کے لیے بہترین", "ar": "مثالي للبدء", "es": "Perfecto para empezar", "fr": "Parfait pour commencer"}',
  0.00,
  0.00,
  '[
    {"en": "5 practice sessions per month", "ur": "ماہانہ 5 مشق سیشن", "ar": "5 جلسات تدريب شهريا", "es": "5 sesiones de práctica por mes", "fr": "5 sessions de pratique par mois"},
    {"en": "Basic repetition analysis", "ur": "بنیادی تکرار تجزیہ", "ar": "تحليل التكرار الأساسي", "es": "Análisis básico de repetición", "fr": "Analyse de répétition de base"},
    {"en": "Simple progress tracking", "ur": "سادہ پیش قدمی ٹریکنگ", "ar": "تتبع التقدم البسيط", "es": "Seguimiento simple del progreso", "fr": "Suivi simple des progrès"},
    {"en": "Web app access", "ur": "ویب ایپ رسائی", "ar": "الوصول إلى تطبيق الويب", "es": "Acceso a la aplicación web", "fr": "Accès à la application web"},
    {"en": "10 text improvements per day", "ur": "روزانہ 10 متن بہتری", "ar": "10 تحسينات نص يوميا", "es": "10 mejoras de texto por día", "fr": "10 améliorations de texte par jour"}
  ]',
  '[
    {"en": "No AI insights", "ur": "کوئی AI بصیرت نہیں", "ar": "لا توجد رؤى ذكية", "es": "Sin información de IA", "fr": "Pas de insights IA"},
    {"en": "No export features", "ur": "کوئی ایکسپورٹ فیچر نہیں", "ar": "لا توجد ميزات تصدير", "es": "Sin funciones de exportación", "fr": "Pas de fonctions de export"},
    {"en": "Limited text improvements", "ur": "محدود متن بہتری", "ar": "تحسينات نص محدودة", "es": "Mejoras de texto limitadas", "fr": "Améliorations de texte limitées"}
  ]',
  5,
  1
);

-- Insert Pro Plan
INSERT INTO pricing_plans (
  plan_name, 
  display_name, 
  description, 
  price_monthly, 
  price_yearly,
  features,
  limitations,
  session_limit,
  ai_analysis_enabled,
  advanced_analytics,
  export_enabled,
  custom_topics,
  sort_order
) VALUES (
  'pro',
  '{"en": "Pro", "ur": "پرو", "ar": "احترافي", "es": "Pro", "fr": "Pro"}',
  '{"en": "For serious speech improvement", "ur": "سنجیدہ تقریری بہتری کے لیے", "ar": "لتحسين الكلام الجاد", "es": "Para mejora seria del habla", "fr": "Pour une amélioration sérieuse de la parole"}',
  9.99,
  99.99,
  '[
    {"en": "Unlimited practice sessions", "ur": "لامحدود مشق سیشن", "ar": "جلسات تدريب غير محدودة", "es": "Sesiones de práctica ilimitadas", "fr": "Sessions de pratique illimitées"},
    {"en": "AI-powered insights with Gemini", "ur": "Gemini کے ساتھ AI طاقت سے بھرپور بصیرت", "ar": "رؤى مدعومة بالذكاء الاصطناعي مع Gemini", "es": "Información impulsada por IA con Gemini", "fr": "Insights alimentés par IA avec Gemini"},
    {"en": "Advanced speech analytics", "ur": "اعلیٰ درجے کی تقریری تجزیات", "ar": "تحليلات الكلام المتقدمة", "es": "Análisis avanzado del habla", "fr": "Analyses avancées de la parole"},
    {"en": "Progress export (PDF/CSV)", "ur": "پیش قدمی ایکسپورٹ (PDF/CSV)", "ar": "تصدير التقدم (PDF/CSV)", "es": "Exportación de progreso (PDF/CSV)", "fr": "Export des progrès (PDF/CSV)"},
    {"en": "Custom practice topics", "ur": "کسٹم مشق کے موضوعات", "ar": "مواضيع تدريب مخصصة", "es": "Temas de práctica personalizados", "fr": "Sujets de pratique personnalisés"},
    {"en": "Unlimited text improvements", "ur": "لامحدود متن بہتری", "ar": "تحسينات نص غير محدودة", "es": "Mejoras de texto ilimitadas", "fr": "Améliorations de texte illimitées"},
    {"en": "Smart Text Assistant", "ur": "سمارٹ ٹیکسٹ اسسٹنٹ", "ar": "مساعد النص الذكي", "es": "Asistente de texto inteligente", "fr": "Assistant de texte intelligent"},
    {"en": "Multi-language support", "ur": "کثیر زبان سپورٹ", "ar": "دعم متعدد اللغات", "es": "Soporte multiidioma", "fr": "Support multilingue"}
  ]',
  '[]',
  -1,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  2
);

-- Insert Team Plan
INSERT INTO pricing_plans (
  plan_name, 
  display_name, 
  description, 
  price_monthly, 
  price_yearly,
  features,
  limitations,
  session_limit,
  ai_analysis_enabled,
  advanced_analytics,
  export_enabled,
  custom_topics,
  team_features,
  api_access,
  priority_support,
  sort_order
) VALUES (
  'team',
  '{"en": "Team", "ur": "ٹیم", "ar": "فريق", "es": "Equipo", "fr": "Équipe"}',
  '{"en": "For coaches and organizations", "ur": "کوچز اور تنظیموں کے لیے", "ar": "للمدربين والمنظمات", "es": "Para entrenadores y organizaciones", "fr": "Pour les coachs et organisations"}',
  29.99,
  299.99,
  '[
    {"en": "Everything in Pro", "ur": "پرو میں سب کچھ", "ar": "كل شيء في الاحترافي", "es": "Todo en Pro", "fr": "Tout dans Pro"},
    {"en": "Up to 10 team members", "ur": "10 ٹیم ممبرز تک", "ar": "حتى 10 أعضاء فريق", "es": "Hasta 10 miembros del equipo", "fr": "Jusquà 10 membres de équipe"},
    {"en": "Team progress dashboard", "ur": "ٹیم پیش قدمی ڈیش بورڈ", "ar": "لوحة تقدم الفريق", "es": "Panel de progreso del equipo", "fr": "Tableau de bord des progrès de équipe"},
    {"en": "Bulk user management", "ur": "بلک یوزر منیجمنٹ", "ar": "إدارة المستخدمين بالجملة", "es": "Gestión masiva de usuarios", "fr": "Gestion en masse des utilisateurs"},
    {"en": "Team text improvement analytics", "ur": "ٹیم ٹیکسٹ بہتری تجزیات", "ar": "تحليلات تحسين نص الفريق", "es": "Análisis de mejora de texto del equipo", "fr": "Analyses damélioration de texte déquipe"},
    {"en": "API access", "ur": "API رسائی", "ar": "الوصول إلى API", "es": "Acceso a API", "fr": "Accès API"},
    {"en": "Priority support", "ur": "ترجیحی سپورٹ", "ar": "دعم أولوية", "es": "Soporte prioritario", "fr": "Support prioritaire"},
    {"en": "Custom integrations", "ur": "کسٹم انٹیگریشن", "ar": "تكاملات مخصصة", "es": "Integraciones personalizadas", "fr": "Intégrations personnalisées"}
  ]',
  '[]',
  -1,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  3
);