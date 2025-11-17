import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUsageTracking() {
  const [usage, setUsage] = useState({
    sessionsUsed: 0,
    sessionsLimit: 5,
    canCreateSession: true,
    hasEIAccess: false,
    hasAdvancedEI: false,
    loading: true
  })

  const [subscription, setSubscription] = useState(null)
  const [planFeatures, setPlanFeatures] = useState({
    emotionalIntelligenceEnabled: false,
    eiCoachingEnabled: false,
    eiAnalyticsEnabled: false
  })

  useEffect(() => {
    fetchUsageAndSubscription()
  }, [])

  const fetchUsageAndSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

      // Fetch subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      setSubscription(subData)

      // Derive plan features without pricing_plans query (schema may vary)
      const planName = subData?.plan_name || 'free'
      const derivedFeatures = {
        emotionalIntelligenceEnabled: planName !== 'free',
        eiCoachingEnabled: planName !== 'free',
        eiAnalyticsEnabled: planName === 'team' // team has most advanced features
      }
      setPlanFeatures(derivedFeatures)

      // Fetch current month usage
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle()

      // Determine limits and features based on plan
      let sessionsLimit = 5 // Free plan default
      let hasEIAccess = false
      let hasAdvancedEI = false
      
      console.log('🔍 Debug - Subscription data:', subData)
      console.log('🔍 Debug - Plan name:', subData?.plan_name)
      console.log('🔍 Debug - Status:', subData?.status)
      
      if (subData?.plan_name === 'pro' && subData?.status === 'active') {
        sessionsLimit = 999999 // Unlimited
        hasEIAccess = true
        hasAdvancedEI = false
        console.log('✅ Pro plan activated - EI access granted')
      } else if (subData?.plan_name === 'team' && subData?.status === 'active') {
        sessionsLimit = 999999 // Unlimited
        hasEIAccess = true
        hasAdvancedEI = true
        console.log('✅ Team plan activated - Advanced EI access granted')
      } else {
        console.log('❌ Free plan or inactive subscription - EI access denied')
      }

      const sessionsUsed = usageData?.sessions_used || 0
      const canCreateSession = sessionsUsed < sessionsLimit

      // TEMPORARY: Manual override for testing (remove in production)
      const isTestingMode = window.location.hostname === 'localhost'
      if (isTestingMode) {
        console.log('🧪 Testing mode - Granting EI access for development')
        hasEIAccess = true
        hasAdvancedEI = true
        sessionsLimit = 999999
      }

      console.log('📊 Final usage state:', {
        sessionsUsed,
        sessionsLimit,
        canCreateSession,
        hasEIAccess,
        hasAdvancedEI,
        planName: subData?.plan_name,
        status: subData?.status
      })

      setUsage({
        sessionsUsed,
        sessionsLimit,
        canCreateSession,
        hasEIAccess,
        hasAdvancedEI,
        loading: false
      })

    } catch (error) {
      console.error('Error fetching usage:', error)
      setUsage(prev => ({ ...prev, loading: false }))
    }
  }

  const incrementUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Call the database function to increment usage
      const { error } = await supabase.rpc('increment_session_usage', {
        user_uuid: user.id
      })

      if (error) throw error

      // Refresh usage data
      await fetchUsageAndSubscription()
      return true

    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  const checkCanCreateSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase.rpc('can_create_session', {
        user_uuid: user.id
      })

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error checking session limit:', error)
      return false
    }
  }

  return {
    usage,
    subscription,
    planFeatures,
    incrementUsage,
    checkCanCreateSession,
    refreshUsage: fetchUsageAndSubscription
  }
}