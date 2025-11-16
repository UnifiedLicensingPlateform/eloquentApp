import { useState, useEffect } from 'react'
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [billingHistory, setBillingHistory] = useState([])

  useEffect(() => {
    fetchSubscription()
    fetchBillingHistory()
  }, [])

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBillingHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      setBillingHistory(data || [])
    } catch (error) {
      console.error('Error fetching billing history:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access to Pro features at the end of your billing period.')) {
      return
    }

    try {
      // TODO: Implement Stripe subscription cancellation
      console.log('Cancel subscription')
      alert('Subscription cancellation requested. You\'ll receive a confirmation email shortly.')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Failed to cancel subscription. Please contact support.')
    }
  }

  const handleUpdatePayment = () => {
    // TODO: Implement Stripe customer portal
    console.log('Redirect to Stripe customer portal')
    alert('Redirecting to payment management...')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading subscription details...</div>
      </div>
    )
  }

  const isActive = subscription?.status === 'active'
  const isPro = subscription?.plan_name === 'pro'
  const isTeam = subscription?.plan_name === 'team'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription & Billing</h2>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          <div className="flex items-center">
            {isActive ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {subscription ? subscription.plan_name.toUpperCase() : 'FREE'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Plan</p>
            <p className="font-medium">
              {subscription ? subscription.plan_name.charAt(0).toUpperCase() + subscription.plan_name.slice(1) : 'Free'}
            </p>
          </div>
          
          {subscription && (
            <>
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">
                  ${subscription.plan_name === 'pro' ? '9.00' : '29.00'}/month
                </p>
              </div>
            </>
          )}
        </div>

        {subscription && isActive && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleUpdatePayment}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment Method
            </button>
            
            <button
              onClick={handleCancelSubscription}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {!subscription && (
          <div className="mt-6">
            <p className="text-gray-600 mb-4">
              You're currently on the free plan. Upgrade to unlock unlimited practice sessions and advanced features.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
        
        {billingHistory.length === 0 ? (
          <p className="text-gray-600">No billing history available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billingHistory.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}