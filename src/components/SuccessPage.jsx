import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      // Update user subscription status
      updateSubscriptionStatus()
    }
  }, [sessionId])

  const updateSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update user to Pro plan
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_name: 'pro',
          status: 'active',
          stripe_session_id: sessionId,
          cancel_at_period_end: false
        })

      setLoading(false)
    } catch (error) {
      console.error('Error updating subscription:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Pro! 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription is now active. You have access to all Pro features including:
        </p>

        <div className="text-left mb-8 space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Unlimited practice sessions
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            🎭 Emotional Intelligence coaching
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Real-time confidence & anxiety tracking
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Advanced speech analytics
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Job Interview Simulation (STAR method)
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Wedding Speech Practice
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Conference Talk Preparation
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          Start Using Pro Features
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Questions? Contact us at support@eloquent-app.com
        </p>
      </div>
    </div>
  )
}