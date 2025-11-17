import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LanguageProvider, useLanguage } from './hooks/useLanguage.jsx'
import { BarChart3, Mic, MessageSquare, CreditCard, Settings, Heart, Shield } from 'lucide-react'
import Auth from './components/Auth'
import SimpleLandingPage from './components/SimpleLandingPage'
import Dashboard from './components/Dashboard'
import PracticeDrill from './components/PracticeDrill'
import PricingPlans from './components/PricingPlans'
import SubscriptionManager from './components/SubscriptionManager'
import AdvancedAnalytics from './components/AdvancedAnalytics'
import SmartTextAssistant from './components/SmartTextAssistant'
import EmotionalIntelligenceDashboard from './components/EmotionalIntelligenceDashboard'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import SuccessPage from './components/SuccessPage'
import LanguageSelector from './components/LanguageSelector'
import DebugPanel from './components/DebugPanel'

function AppContent() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('landing')
  const [loading, setLoading] = useState(true)
  const [userSubscription, setUserSubscription] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { t, isRTL } = useLanguage()

  // Check for success page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('session_id')) {
      setCurrentView('success')
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUserSubscription(session.user.id)
        checkAdminStatus(session.user.email)
        // Set to dashboard when user is logged in
        setCurrentView('dashboard')
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUserSubscription(session.user.id)
        checkAdminStatus(session.user.email)
        // Set to dashboard when user logs in
        setCurrentView('dashboard')
      } else {
        // Reset to landing when user logs out
        setCurrentView('landing')
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = (email) => {
    const adminEmails = ['admin@eloquent-app.com', 'superadmin@eloquent-app.com']
    setIsAdmin(adminEmails.includes(email))
  }

  const fetchUserSubscription = async (userId) => {
    try {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
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

  // Show landing page first, then auth
  if (!session && currentView === 'landing') {
    return <SimpleLandingPage />
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
              <img 
                src="/logo.png" 
                alt="Eloquent Logo" 
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { key: 'dashboard', label: t('nav.dashboard'), icon: BarChart3 },
                { key: 'practice', label: t('nav.practice'), icon: Mic },
                { key: 'textassistant', label: 'Text Assistant', icon: MessageSquare },
                { key: 'emotional', label: 'Emotional IQ', icon: Heart },
                { key: 'pricing', label: t('nav.pricing'), icon: CreditCard },
                { key: 'billing', label: t('nav.billing'), icon: Settings },
                ...(isAdmin ? [{ key: 'superadmin', label: 'Super Admin', icon: Shield }] : [])
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
          {currentView === 'dashboard' && (
            <Dashboard 
              onStartFirstSession={() => setCurrentView('practice')} 
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'practice' && <PracticeDrill />}
          {currentView === 'pricing' && (
            <PricingPlans currentPlan={userSubscription?.plan_name || 'free'} />
          )}
          {currentView === 'billing' && <SubscriptionManager />}
          {currentView === 'textassistant' && <SmartTextAssistant />}
          {currentView === 'emotional' && <EmotionalIntelligenceDashboard />}
          {currentView === 'superadmin' && isAdmin && <SuperAdminDashboard />}
          {currentView === 'success' && <SuccessPage />}
        </div>
      </main>
      
      {/* Debug Panel - Only show in development */}
      {window.location.hostname === 'localhost' && <DebugPanel />}
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