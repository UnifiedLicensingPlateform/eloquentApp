import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Stripe Price IDs (replace with your actual price IDs from Stripe Dashboard)
export const STRIPE_PRICES = {
  pro_monthly: 'price_1234567890abcdef', // Replace with your Pro plan price ID
  team_monthly: 'price_0987654321fedcba' // Replace with your Team plan price ID (future)
}

export const createCheckoutSession = async (priceId, userId) => {
  try {
    const stripe = await stripePromise
    
    // For now, redirect to Stripe Checkout directly
    // In production, you'd call your backend to create the session
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/pricing`,
      clientReferenceId: userId,
    })

    if (error) {
      console.error('Stripe error:', error)
      throw error
    }
  } catch (error) {
    console.error('Payment error:', error)
    throw error
  }
}

export const createPortalSession = async (customerId) => {
  // This would typically call your backend
  // For now, redirect to Stripe customer portal
  window.open('https://billing.stripe.com/p/login/test_your_portal_link', '_blank')
}