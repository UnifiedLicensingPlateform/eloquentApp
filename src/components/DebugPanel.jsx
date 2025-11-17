import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUsageTracking } from '../hooks/useUsageTracking'

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState(null)
  const { usage, subscription } = useUsageTracking()

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const fetchDebugInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get subscription data
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)

      // Get usage data
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)

      setDebugInfo({
        userId: user.id,
        email: user.email,
        subscriptions: subData,
        usage: usageData,
        currentMonth,
        hookData: { usage, subscription }
      })

    } catch (error) {
      console.error('Debug fetch error:', error)
    }
  }

  const upgradeToProForTesting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_name: 'pro',
          status: 'active',
          stripe_session_id: 'test_session_' + Date.now(),
          cancel_at_period_end: false
        })

      if (error) throw error
      
      alert('✅ Upgraded to Pro for testing!')
      window.location.reload()

    } catch (error) {
      console.error('Upgrade error:', error)
      alert('❌ Upgrade failed: ' + error.message)
    }
  }

  const resetToFree = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      
      alert('✅ Reset to Free plan!')
      window.location.reload()

    } catch (error) {
      console.error('Reset error:', error)
      alert('❌ Reset failed: ' + error.message)
    }
  }

  if (!debugInfo) {
    return <div className="p-4 bg-gray-100 rounded">Loading debug info...</div>
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-red-500 rounded-lg p-4 shadow-lg z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-red-600 mb-2">🐛 Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>User ID:</strong> {debugInfo.userId?.slice(0, 8)}...
        </div>
        
        <div>
          <strong>Email:</strong> {debugInfo.email}
        </div>
        
        <div>
          <strong>Subscription Status:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1">
            {JSON.stringify(debugInfo.subscriptions, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Usage Hook Data:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1">
            {JSON.stringify(debugInfo.hookData.usage, null, 2)}
          </pre>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={upgradeToProForTesting}
            className="px-3 py-1 bg-green-500 text-white rounded text-xs"
          >
            Test Pro
          </button>
          <button
            onClick={resetToFree}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Reset Free
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}