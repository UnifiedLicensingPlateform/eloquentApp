import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { createCheckoutSession, STRIPE_PRICES } from '../services/stripeService'

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
    comingSoon: true,
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
    cta: 'Coming Soon',
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

      console.log('Redirecting to Stripe checkout for user:', user.id)

      // Redirect to Stripe Checkout
      await createCheckoutSession(STRIPE_PRICES.pro_monthly, user.id)

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again or contact support.')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handlePlanSelect = (planName, plan) => {
    if (planName === 'Free') {
      return
    }

    if (planName === 'Team') {
      if (plan.comingSoon) {
        alert('Team plan is coming soon! We\'ll notify you when it\'s available.')
        return
      }
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
              plan.comingSoon 
                ? 'border-gray-300 opacity-75' 
                : plan.popular 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200'
            }`}
          >
            {plan.comingSoon && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            )}
            {plan.popular && !plan.comingSoon && (
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
              onClick={() => handlePlanSelect(plan.name, plan)}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                plan.comingSoon
                  ? 'bg-orange-100 text-orange-700 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : currentPlan.toLowerCase() === plan.name.toLowerCase()
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
              disabled={plan.comingSoon || currentPlan.toLowerCase() === plan.name.toLowerCase() || (plan.name === 'Pro' && isUpgrading)}
            >
              {plan.comingSoon
                ? 'Coming Soon'
                : currentPlan.toLowerCase() === plan.name.toLowerCase()
                ? 'Current Plan'
                : plan.name === 'Pro' && isUpgrading
                ? 'Upgrading...'
                : plan.cta
              }
            </button>
          </div>
        ))}
      </div>

      {/* Team Plan Notification */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">🚀 Team Plan Coming Soon!</h3>
        <p className="text-orange-800 mb-4">
          Get notified when our Team plan launches with advanced team analytics, member management, and collaboration features.
        </p>
        <div className="flex justify-center items-center space-x-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email for early access"
            className="flex-1 px-4 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
            Notify Me
          </button>
        </div>
        <p className="text-xs text-orange-600 mt-2">Expected launch: Q1 2024</p>
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