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
        .single()

      setSubscription(subData)

      // Fetch plan features
      const planName = subData?.plan_name || 'free'
      const { data: planData } = await supabase
        .from('pricing_plans')
        .select('emotional_intelligence_enabled, ei_coaching_enabled, ei_analytics_enabled')
        .eq('plan_name', planName)
        .single()

      if (planData) {
        setPlanFeatures({
          emotionalIntelligenceEnabled: planData.emotional_intelligence_enabled,
          eiCoachingEnabled: planData.ei_coaching_enabled,
          eiAnalyticsEnabled: planData.ei_analytics_enabled
        })
      }

      // Fetch current month usage
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single()

      // Determine limits and features based on plan
      let sessionsLimit = 5 // Free plan default
      let hasEIAccess = false
      let hasAdvancedEI = false
      
      if (subData?.plan_name === 'pro') {
        sessionsLimit = 999999 // Unlimited
        hasEIAccess = true
        hasAdvancedEI = false
      } else if (subData?.plan_name === 'team') {
        sessionsLimit = 999999 // Unlimited
        hasEIAccess = true
        hasAdvancedEI = true
      }

      const sessionsUsed = usageData?.sessions_used || 0
      const canCreateSession = sessionsUsed < sessionsLimit

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