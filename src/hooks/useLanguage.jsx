import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

// Language context with default values
const LanguageContext = createContext({
  currentLanguage: 'en',
  supportedLanguages: [],
  isRTL: false,
  loading: false,
  changeLanguage: () => {},
  t: (key) => key,
  getLanguageName: (code) => code
})

// Language provider component
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [supportedLanguages, setSupportedLanguages] = useState([])
  const [translations, setTranslations] = useState({})
  const [isRTL, setIsRTL] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeLanguage()
  }, [])

  const initializeLanguage = async () => {
    try {
      // Fetch supported languages
      const { data: languages } = await supabase
        .from('supported_languages')
        .select('*')
        .eq('is_active', true)
        .order('language_code')

      setSupportedLanguages(languages || [])

      // Get user's preferred language
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('preferred_language')
          .eq('user_id', user.id)
          .single()

        if (preferences?.preferred_language) {
          await changeLanguage(preferences.preferred_language)
        }
      }

      // Load default language (English)
      await loadTranslations('en')
      
    } catch (error) {
      console.error('Error initializing language:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeLanguage = async (languageCode) => {
    try {
      setCurrentLanguage(languageCode)
      
      // Find language info
      const language = supportedLanguages.find(lang => lang.language_code === languageCode)
      setIsRTL(language?.is_rtl || false)

      // Load translations
      await loadTranslations(languageCode)

      // Update user preferences if logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferred_language: languageCode
          })
      }

      // Update document direction
      document.documentElement.dir = language?.is_rtl ? 'rtl' : 'ltr'
      document.documentElement.lang = languageCode

    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  const loadTranslations = async (languageCode) => {
    try {
      // In a real app, you'd load from a translation service or files
      // For now, we'll use basic translations
      const basicTranslations = getBasicTranslations(languageCode)
      setTranslations(basicTranslations)
    } catch (error) {
      console.error('Error loading translations:', error)
    }
  }

  const t = (key, params = {}) => {
    let translation = translations[key] || key
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param])
    })
    
    return translation
  }

  const getLanguageName = (languageCode, inLanguage = currentLanguage) => {
    const language = supportedLanguages.find(lang => lang.language_code === languageCode)
    if (!language) return languageCode

    try {
      const names = typeof language.language_name === 'string' 
        ? JSON.parse(language.language_name) 
        : language.language_name
      
      return names[inLanguage] || names['en'] || language.native_name
    } catch {
      return language.native_name
    }
  }

  const value = {
    currentLanguage,
    supportedLanguages,
    isRTL,
    loading,
    changeLanguage,
    t,
    getLanguageName
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return default values instead of throwing error during development
    return {
      currentLanguage: 'en',
      supportedLanguages: [],
      isRTL: false,
      loading: false,
      changeLanguage: () => {},
      t: (key) => key,
      getLanguageName: (code) => code
    }
  }
  return context
}

// Basic translations for key UI elements
function getBasicTranslations(languageCode) {
  const translations = {
    en: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.practice': 'Practice',
      'nav.pricing': 'Pricing',
      'nav.billing': 'Billing',
      'nav.analytics': 'Analytics',
      'nav.signOut': 'Sign Out',
      
      // Auth
      'auth.welcome': 'Welcome to Eloquent',
      'auth.subtitle': 'Your AI-powered speech coach',
      'auth.email': 'Email address',
      'auth.password': 'Password',
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.loading': 'Loading...',
      'auth.noAccount': "Don't have an account? Sign up",
      'auth.hasAccount': 'Already have an account? Sign in',
      
      // Practice
      'practice.title': 'Practice Drill',
      'practice.startDrill': 'Start 60-Second Drill',
      'practice.stopDrill': 'Stop Drill',
      'practice.recording': 'Recording...',
      'practice.notRecording': 'Not recording',
      'practice.transcript': 'Live Transcript:',
      'practice.transcriptPlaceholder': 'Start speaking to see your transcript here...',
      'practice.analysis': 'Analysis Results',
      'practice.totalWords': 'Total Words',
      'practice.repetitions': 'Repetitions',
      'practice.repetitionRate': 'Repetition Rate',
      'practice.fluencyScore': 'Fluency Score',
      'practice.repeatedWords': 'Most Repeated Words:',
      
      // Dashboard
      'dashboard.title': 'Your Progress Dashboard',
      'dashboard.subtitle': 'Track your speech fluency improvement over time',
      'dashboard.totalSessions': 'Total Sessions',
      'dashboard.latestScore': 'Latest Fluency Score',
      'dashboard.avgRepetition': 'Avg Repetition Rate',
      'dashboard.trend': 'Trend',
      'dashboard.improving': 'Improving',
      'dashboard.stable': 'Stable',
      'dashboard.needsWork': 'Needs Work',
      
      // Pricing
      'pricing.title': 'Choose Your Plan',
      'pricing.subtitle': 'Improve your speech fluency with the right plan for you',
      'pricing.currentPlan': 'Current Plan',
      'pricing.upgrade': 'Upgrade',
      'pricing.free': 'Free',
      'pricing.pro': 'Pro',
      'pricing.team': 'Team',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.yes': 'Yes',
      'common.no': 'No'
    },
    
    ur: {
      // Navigation
      'nav.dashboard': 'ڈیش بورڈ',
      'nav.practice': 'مشق',
      'nav.pricing': 'قیمتیں',
      'nav.billing': 'بلنگ',
      'nav.analytics': 'تجزیات',
      'nav.signOut': 'سائن آؤٹ',
      
      // Auth
      'auth.welcome': 'Eloquent میں خوش آمدید',
      'auth.subtitle': 'آپ کا AI طاقت سے بھرپور تقریری کوچ',
      'auth.email': 'ای میل ایڈریس',
      'auth.password': 'پاس ورڈ',
      'auth.signIn': 'سائن ان',
      'auth.signUp': 'سائن اپ',
      'auth.loading': 'لوڈ ہو رہا ہے...',
      'auth.noAccount': 'اکاؤنٹ نہیں ہے؟ سائن اپ کریں',
      'auth.hasAccount': 'پہلے سے اکاؤنٹ ہے؟ سائن ان کریں',
      
      // Practice
      'practice.title': 'مشق ڈرل',
      'practice.startDrill': '60 سیکنڈ ڈرل شروع کریں',
      'practice.stopDrill': 'ڈرل بند کریں',
      'practice.recording': 'ریکارڈ ہو رہا ہے...',
      'practice.notRecording': 'ریکارڈ نہیں ہو رہا',
      'practice.transcript': 'لائیو ٹرانسکرپٹ:',
      'practice.transcriptPlaceholder': 'اپنا ٹرانسکرپٹ یہاں دیکھنے کے لیے بولنا شروع کریں...',
      'practice.analysis': 'تجزیہ کے نتائج',
      'practice.totalWords': 'کل الفاظ',
      'practice.repetitions': 'تکرار',
      'practice.repetitionRate': 'تکرار کی شرح',
      'practice.fluencyScore': 'روانی کا سکور',
      'practice.repeatedWords': 'سب سے زیادہ دہرائے گئے الفاظ:',
      
      // Common
      'common.loading': 'لوڈ ہو رہا ہے...',
      'common.error': 'خرابی',
      'common.success': 'کامیابی',
      'common.cancel': 'منسوخ',
      'common.save': 'محفوظ کریں',
      'common.delete': 'حذف کریں',
      'common.edit': 'ترمیم',
      'common.close': 'بند کریں',
      'common.back': 'واپس',
      'common.next': 'اگلا',
      'common.previous': 'پچھلا',
      'common.yes': 'ہاں',
      'common.no': 'نہیں'
    },
    
    ar: {
      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.practice': 'التدريب',
      'nav.pricing': 'الأسعار',
      'nav.billing': 'الفواتير',
      'nav.analytics': 'التحليلات',
      'nav.signOut': 'تسجيل الخروج',
      
      // Auth
      'auth.welcome': 'مرحباً بك في Eloquent',
      'auth.subtitle': 'مدرب الكلام المدعوم بالذكاء الاصطناعي',
      'auth.email': 'عنوان البريد الإلكتروني',
      'auth.password': 'كلمة المرور',
      'auth.signIn': 'تسجيل الدخول',
      'auth.signUp': 'إنشاء حساب',
      'auth.loading': 'جاري التحميل...',
      'auth.noAccount': 'ليس لديك حساب؟ أنشئ حساباً',
      'auth.hasAccount': 'لديك حساب بالفعل؟ سجل الدخول',
      
      // Practice
      'practice.title': 'تدريب الكلام',
      'practice.startDrill': 'ابدأ تدريب 60 ثانية',
      'practice.stopDrill': 'أوقف التدريب',
      'practice.recording': 'جاري التسجيل...',
      'practice.notRecording': 'غير مسجل',
      'practice.transcript': 'النص المباشر:',
      'practice.transcriptPlaceholder': 'ابدأ بالتحدث لرؤية النص هنا...',
      'practice.analysis': 'نتائج التحليل',
      'practice.totalWords': 'إجمالي الكلمات',
      'practice.repetitions': 'التكرارات',
      'practice.repetitionRate': 'معدل التكرار',
      'practice.fluencyScore': 'نقاط الطلاقة',
      'practice.repeatedWords': 'الكلمات الأكثر تكراراً:',
      
      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.cancel': 'إلغاء',
      'common.save': 'حفظ',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.close': 'إغلاق',
      'common.back': 'رجوع',
      'common.next': 'التالي',
      'common.previous': 'السابق',
      'common.yes': 'نعم',
      'common.no': 'لا'
    }
  }

  return translations[languageCode] || translations.en
}