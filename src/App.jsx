import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LanguageProvider, useLanguage } from './hooks/useLanguage.jsx'
import { BarChart3, Mic, MessageSquare, CreditCard, Settings, Heart } from 'lucide-react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import PracticeDrill from './components/PracticeDrill'
import PricingPlans from './components/PricingPlans'
import SubscriptionManager from './components/SubscriptionManager'
import AdvancedAnalytics from './components/AdvancedAnalytics'
import SmartTextAssistant from './components/SmartTextAssistant'
import EmotionalIntelligenceDashboard from './components/EmotionalIntelligenceDashboard'
import LanguageSelector from './components/LanguageSelector'

function AppContent() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [userSubscription, setUserSubscription] = useState(null)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUserSubscription(session.user.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUserSubscription(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserSubscription = async (userId) => {
    try {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      setUserSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile-first Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Eloquent</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { key: 'dashboard', label: t('nav.dashboard'), icon: BarChart3 },
                { key: 'practice', label: t('nav.practice'), icon: Mic },
                { key: 'textassistant', label: 'Text Assistant', icon: MessageSquare },
                { key: 'emotional', label: 'Emotional IQ', icon: Heart },
                { key: 'pricing', label: t('nav.pricing'), icon: CreditCard },
                { key: 'billing', label: t('nav.billing'), icon: Settings }
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    onClick={() => setCurrentView(item.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      currentView === item.key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'practice', label: 'Practice', icon: Mic },
              { key: 'textassistant', label: 'Assistant', icon: MessageSquare },
              { key: 'emotional', label: 'Emotional', icon: Heart },
              { key: 'pricing', label: 'Pricing', icon: CreditCard }
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                    currentView === item.key
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 lg:pb-0">
        <div className="animate-slide-up">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'practice' && <PracticeDrill />}
          {currentView === 'pricing' && (
            <PricingPlans currentPlan={userSubscription?.plan_name || 'free'} />
          )}
          {currentView === 'billing' && <SubscriptionManager />}
          {currentView === 'textassistant' && <SmartTextAssistant />}
          {currentView === 'emotional' && <EmotionalIntelligenceDashboard />}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App