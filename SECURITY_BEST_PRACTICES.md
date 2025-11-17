# Security Best Practices for API Keys

## ✅ Recommended Approach: Environment Variables in Hosting Platform

### Why Environment Variables are More Secure:
1. **Not stored in database** - No risk of SQL injection or database breach exposing keys
2. **Not in code** - Keys never committed to git repository
3. **Platform-level encryption** - Hosting platforms encrypt environment variables
4. **Easy rotation** - Change keys without code deployment
5. **Access control** - Only authorized team members can view/edit

## 🔐 Netlify Configuration (Recommended)

### Step 1: Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to: **Site settings** → **Environment variables**
4. Add the following variables:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
VITE_GEMINI_API_KEY=AIzaSy_your_key_here
VITE_ADMIN_EMAILS=admin@eloquent-app.com,your-email@example.com
```

### Step 2: For Secret Keys (Backend Only)

For secret keys that should NEVER be exposed to frontend:
```
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** Secret keys should only be used in:
- Netlify Functions (serverless functions)
- Backend API routes
- Never in frontend code

## 🏗️ Architecture: Hybrid Approach

### Current Implementation:
```
Priority Order:
1. Environment Variables (Netlify/Vercel) ← MOST SECURE
2. Database Settings (Super Admin Dashboard) ← Fallback
3. .env file (Local Development Only) ← Development only
```

### How It Works:
```javascript
// In platformSettingsService.js
const apiKey = 
  import.meta.env.VITE_GEMINI_API_KEY ||  // 1. Check env first
  databaseSettings.gemini_api_key ||       // 2. Fallback to DB
  ''                                        // 3. Empty if none
```

## 🚀 Deployment Platforms Configuration

### Netlify
```bash
# Via Netlify UI
Site Settings → Environment variables → Add variable

# Via Netlify CLI
netlify env:set VITE_GEMINI_API_KEY "your_key_here"
```

### Vercel
```bash
# Via Vercel UI
Project Settings → Environment Variables → Add

# Via Vercel CLI
vercel env add VITE_GEMINI_API_KEY
```

### Other Platforms
- **Render**: Environment → Add Environment Variable
- **Railway**: Variables → New Variable
- **Heroku**: Settings → Config Vars → Add

## 🔒 What to Store Where

### ✅ Environment Variables (Hosting Platform)
- Stripe Publishable Key (pk_live_...)
- Stripe Secret Key (sk_live_...) - **Backend only**
- Gemini API Key
- Supabase URL
- Supabase Anon Key
- Admin emails list

### ❌ Never Store in Database
- Stripe Secret Key
- Supabase Service Role Key
- OAuth client secrets
- Private encryption keys

### ⚠️ Optional in Database (Less Sensitive)
- App name
- Support email
- Feature flags
- UI configuration
- Max free sessions limit

## 🛡️ Security Checklist

- [ ] All API keys in environment variables
- [ ] Secret keys never exposed to frontend
- [ ] .env file in .gitignore
- [ ] No keys committed to git
- [ ] Environment variables encrypted by platform
- [ ] Regular key rotation schedule
- [ ] Access logs monitored
- [ ] 2FA enabled on hosting platform
- [ ] Team access properly restricted

## 📝 Recommended Setup

### For Production:
1. **Use Netlify/Vercel environment variables** for all keys
2. **Disable database settings** or use only for non-sensitive config
3. **Implement key rotation** every 90 days
4. **Use separate keys** for test/production

### For Development:
1. Use `.env` file locally (never commit)
2. Share keys securely via password manager
3. Use test/sandbox keys only

## 🔄 Key Rotation Process

### When to Rotate:
- Every 90 days (scheduled)
- After team member leaves
- If key potentially exposed
- After security incident

### How to Rotate:
1. Generate new key in service (Stripe/Google)
2. Update environment variable in Netlify
3. Test in staging environment
4. Deploy to production
5. Revoke old key after 24 hours

## 🚨 If Keys Are Compromised

### Immediate Actions:
1. **Revoke compromised keys** immediately
2. **Generate new keys** in service dashboard
3. **Update environment variables** in hosting platform
4. **Deploy immediately**
5. **Monitor for unauthorized usage**
6. **Review access logs**
7. **Notify affected users** if necessary

## 📊 Comparison: Database vs Environment Variables

| Feature | Database | Env Variables |
|---------|----------|---------------|
| Security | ⚠️ Medium | ✅ High |
| Easy to change | ✅ Yes (via UI) | ⚠️ Requires redeploy |
| Git safe | ✅ Yes | ✅ Yes |
| Encryption | ⚠️ Manual | ✅ Automatic |
| Access control | ⚠️ Via RLS | ✅ Platform-level |
| Audit trail | ✅ Yes | ⚠️ Limited |
| Best for | UI config | API keys |

## 💡 Recommendation

**For Eloquent App:**
1. ✅ Use **Netlify environment variables** for all API keys
2. ✅ Keep database settings for **non-sensitive configuration** only
3. ✅ Use Super Admin Dashboard for **feature flags** and **app settings**
4. ❌ Remove API key inputs from Super Admin Dashboard (or make read-only)

## 🔧 Implementation

The current code already supports this! It checks environment variables first:

```javascript
// Automatically uses env vars if available
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || dbSettings.gemini_api_key
```

**No code changes needed** - just set environment variables in Netlify!
