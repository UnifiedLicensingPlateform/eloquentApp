# 💳 Stripe Integration Guide - Eloquent SaaS

## Overview
Complete guide to integrate Stripe payments for Pro plan subscriptions in your Eloquent app.

---

## 🚀 Quick Setup (30 minutes)

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create account
2. Complete business verification
3. Get API keys from Dashboard > Developers > API keys

### 2. Install Stripe Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. Environment Variables
Add to `.env`:
```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key  # Server-side only
```

---

## 🔧 Implementation

### 1. Create Stripe Service
```javascript
// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const createCheckoutSession = async (priceId, userId) => {
  try {
    const stripe = await stripePromise
    
    // Call your backend to create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    })
    
    const session = await response.json()
    
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
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
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId }),
  })
  
  const session = await response.json()
  window.location.href = session.url
}
```

### 2. Update PricingPlans Component
```javascript
// Update src/components/PricingPlans.jsx
import { createCheckoutSession } from '../services/stripeService'

const STRIPE_PRICES = {
  pro_monthly: 'price_1234567890abcdef', // Replace with your actual price ID
}

const handleProUpgrade = async () => {
  if (isUpgrading) return

  try {
    setIsUpgrading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to upgrade to Pro.')
      return
    }

    // Create Stripe checkout session
    await createCheckoutSession(STRIPE_PRICES.pro_monthly, user.id)
    
  } catch (error) {
    console.error('Payment error:', error)
    alert('Payment failed. Please try again.')
  } finally {
    setIsUpgrading(false)
  }
}
```

### 3. Create Supabase Edge Functions (Backend)
```javascript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { priceId, userId, successUrl, cancelUrl } = await req.json()
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
      },
    })

    return new Response(
      JSON.stringify({ id: session.id }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 4. Webhook Handler for Subscription Updates
```javascript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '')
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await handleSubscriptionCreated(session)
        break
        
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await handleSubscriptionUpdated(subscription)
        break
        
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object
        await handleSubscriptionCanceled(deletedSub)
        break
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})

async function handleSubscriptionCreated(session: any) {
  const userId = session.client_reference_id
  
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_name: 'pro',
      status: 'active',
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
    })
}
```

---

## 📱 Mobile App Conversion Options

### Option 1: Progressive Web App (PWA) - EASIEST ✅
**Time**: 2-4 hours | **Cost**: Free | **Effort**: Low

```javascript
// Add to vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Eloquent - Speech Coaching',
        short_name: 'Eloquent',
        description: 'AI-powered speech coaching app',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

**Benefits**:
- ✅ Works on all devices (iOS, Android, Desktop)
- ✅ App-like experience with home screen icon
- ✅ Offline functionality
- ✅ Push notifications
- ✅ No app store approval needed
- ✅ Same codebase as web app

### Option 2: Capacitor (Hybrid App) - RECOMMENDED 🚀
**Time**: 1-2 weeks | **Cost**: $99-199 (app store fees) | **Effort**: Medium

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init eloquent com.eloquent.app

# Build and add platforms
npm run build
npx cap add ios
npx cap add android

# Open in native IDEs
npx cap open ios
npx cap open android
```

**Benefits**:
- ✅ Native app store distribution
- ✅ Full native device access (camera, microphone, etc.)
- ✅ Better performance than PWA
- ✅ Push notifications
- ✅ In-app purchases support
- ✅ Same React codebase

### Option 3: React Native (Native App) - MOST WORK 🔧
**Time**: 2-3 months | **Cost**: $99-199 + development time | **Effort**: High

**Benefits**:
- ✅ Best performance
- ✅ Full native features
- ✅ Platform-specific optimizations

**Drawbacks**:
- ❌ Need to rewrite entire app
- ❌ Separate codebase to maintain
- ❌ Much longer development time

---

## 🎯 **RECOMMENDATIONS**

### **For Stripe Integration**: 
**✅ IMPLEMENT IMMEDIATELY** - Essential for revenue generation
- **Time**: 4-6 hours setup
- **Priority**: HIGH - Required for Pro plan sales
- **ROI**: Immediate revenue capability

### **For Mobile App**:
**✅ START WITH PWA** - Quick wins, then upgrade
1. **Phase 1**: PWA (2-4 hours) - Immediate mobile experience
2. **Phase 2**: Capacitor (1-2 weeks) - Native app store presence
3. **Phase 3**: React Native (future) - If needed for advanced features

### **Launch Strategy**:
```
Week 1: ✅ Integrate Stripe payments
Week 2: ✅ Launch web app with PWA
Week 3: 🚀 Submit to app stores via Capacitor
Week 4: 📈 Marketing and user acquisition
```

---

## 💰 **Revenue Impact**

### **With Stripe Integration**:
- ✅ Immediate Pro plan sales ($9/month)
- ✅ Automated subscription management
- ✅ Professional payment experience
- ✅ Revenue tracking and analytics

### **With Mobile App**:
- ✅ 60% of users prefer mobile apps
- ✅ Higher engagement and retention
- ✅ App store discovery and downloads
- ✅ Push notifications for re-engagement

---

## ✅ **Next Steps**

### **Priority 1: Stripe Integration** (This Week)
1. Create Stripe account and get API keys
2. Set up products and pricing in Stripe dashboard
3. Implement checkout flow in React app
4. Create webhook handlers in Supabase
5. Test payment flow end-to-end

### **Priority 2: PWA Conversion** (Next Week)
1. Install PWA plugin and configure manifest
2. Add app icons and splash screens
3. Test installation on mobile devices
4. Deploy PWA-enabled version

### **Priority 3: Native App** (Month 2)
1. Set up Capacitor for iOS/Android
2. Test native features (microphone, etc.)
3. Submit to app stores
4. Launch mobile marketing campaign

**Bottom Line**: Your React app is PERFECT for mobile conversion. Start with PWA for immediate mobile experience, then upgrade to native apps for maximum reach! 🚀