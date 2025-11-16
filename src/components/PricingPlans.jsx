import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 practice sessions per month',
      'Basic repetition analysis',
      'Simple progress tracking',
      'Web app access'
    ],
    limitations: [
      'No emotional intelligence coaching',
      'No advanced analytics',
      'No export features',
      'No custom topics'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'month',
    description: 'For serious speech improvement',
    features: [
      'Unlimited practice sessions',
      '🎭 Emotional Intelligence coaching',
      'Real-time confidence & anxiety tracking',
      'Advanced speech analytics',
      'Progress export (PDF/CSV)',
      'Custom practice topics',
      'Detailed fluency insights',
      'Email progress reports',
      'Priority support'
    ],
    limitations: [],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Team',
    price: '$29',
    period: 'month',
    description: 'For coaches and organizations',
    features: [
      'Everything in Pro',
      '🎭 Advanced EI team analytics',
      'Team emotional intelligence dashboard',
      'Up to 10 team members',
      'Team progress dashboard',
      'Bulk user management',
      'Advanced reporting',
      'API access',
      'Custom branding',
      'Dedicated support'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false
  }
]

export default function PricingPlans({ currentPlan = 'free' }) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleProUpgrade = async () => {
    if (isUpgrading) return

    try {
      setIsUpgrading(true)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('User error:', userError)
        alert('Please sign in to upgrade to Pro.')
        return
      }

      console.log('Attempting to upgrade user:', user.id)

      // Try insert first, then update if exists
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_name: 'pro',
          status: 'active',
          cancel_at_period_end: false
        })
        .select()
        .single()

      if (error) {
        console.error('Insert failed, trying update:', error)
        
        // If insert fails, try update
        const { data: updateData, error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            plan_name: 'pro',
            status: 'active',
            cancel_at_period_end: false
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Update also failed:', updateError)
          alert(`Failed to upgrade: ${updateError.message}. Check console for details.`)
          return
        }

        console.log('Update successful:', updateData)
      } else {
        console.log('Insert successful:', data)
      }

      alert('You are now on the Pro plan!')
      window.location.reload()

    } catch (error) {
      console.error('Unexpected error upgrading to Pro:', error)
      alert(`Unexpected error: ${error.message}. Check console for details.`)
    } finally {
      setIsUpgrading(false)
    }
  }

  const handlePlanSelect = (planName) => {
    if (planName === 'Free') {
      return
    }

    if (planName === 'Team') {
      window.open('mailto:sales@eloquent-app.com?subject=Team Plan Inquiry', '_blank')
      return
    }

    if (planName === 'Pro') {
      handleProUpgrade()
      return
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600">
          Improve your speech fluency with the right plan for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-lg shadow-sm border-2 p-8 ${
              plan.popular 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Not included:</h4>
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => handlePlanSelect(plan.name)}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : currentPlan.toLowerCase() === plan.name.toLowerCase()
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
              disabled={currentPlan.toLowerCase() === plan.name.toLowerCase() || (plan.name === 'Pro' && isUpgrading)}
            >
              {currentPlan.toLowerCase() === plan.name.toLowerCase()
                ? 'Current Plan'
                : plan.name === 'Pro' && isUpgrading
                ? 'Upgrading...'
                : plan.cta
              }
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>✓ Cancel anytime</span>
          <span>✓ 30-day money-back guarantee</span>
          <span>✓ Secure payments via Stripe</span>
        </div>
      </div>
    </div>
  )
}