# 🚀 Quick Admin Setup - 3 Steps

## Step 1: Configure Your Admin Email

### Option A: Using Environment Variables (Recommended)

1. Create a `.env` file in the root directory (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your email:
   ```env
   VITE_ADMIN_EMAILS=your-email@example.com,admin@eloquent-app.com
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

### Option B: Direct Code Edit (Quick Test)

Edit `src/App.jsx` line ~75:
```javascript
const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || 'your-email@example.com,admin@eloquent-app.com'
```

## Step 2: Create Admin Account in Supabase

### Method 1: Via Your App (Easiest)
1. Start your app: `npm run dev`
2. Go to: `http://localhost:5173`
3. Click "Sign Up"
4. Use the email you configured in Step 1
5. Create a password
6. Verify email if required

### Method 2: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Users**
4. Click **"Add user"**
5. Enter:
   - Email: `your-email@example.com` (same as Step 1)
   - Password: Create a secure password
   - Auto Confirm User: ✅ (check this)
6. Click **"Create user"**

## Step 3: Access Super Admin Dashboard

1. **Login to your app:**
   ```
   http://localhost:5173
   ```

2. **Use your admin credentials:**
   - Email: The one you configured
   - Password: The one you created

3. **Look for the Shield icon** 🛡️ in the navigation bar

4. **Click "Super Admin"** to access the dashboard

## ✅ Verification Checklist

- [ ] `.env` file has `VITE_ADMIN_EMAILS` with your email
- [ ] Dev server is running (`npm run dev`)
- [ ] Admin account created in Supabase
- [ ] Logged in with admin email
- [ ] Shield icon visible in navigation
- [ ] Can access Super Admin Dashboard

## 🎯 What You Should See

After logging in as admin:

**Navigation Bar:**
```
Dashboard | Practice | Text Assistant | Emotional IQ | Pricing | Billing | 🛡️ Super Admin
```

**Super Admin Dashboard Tabs:**
- Overview (stats and metrics)
- Pricing Plans (manage pricing)
- Users (view all users)
- Languages (configure languages)
- Settings (platform config)

## 🔧 Troubleshooting

### Problem: Shield icon not showing
**Solution:**
```bash
# 1. Check your .env file
cat .env | grep ADMIN

# 2. Verify email matches exactly
# 3. Restart dev server
npm run dev
```

### Problem: "Access denied" alert
**Solution:**
- Your logged-in email doesn't match the admin list
- Check for typos in email address
- Ensure no extra spaces in `.env` file

### Problem: Can't create account
**Solution:**
- Check Supabase connection in `.env`
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase dashboard for errors

## 📝 Example Configuration

**Your `.env` file should look like this:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# Add your email here
VITE_ADMIN_EMAILS=john@example.com,admin@eloquent-app.com
```

## 🎬 Complete Command Sequence

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and add your email to VITE_ADMIN_EMAILS

# 2. Install dependencies (if not done)
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
# http://localhost:5173

# 5. Sign up with your admin email
# 6. Login
# 7. Click Shield icon → Super Admin
```

## 🌐 Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Add environment variable in hosting platform:**
   - Variable name: `VITE_ADMIN_EMAILS`
   - Value: `your-email@example.com,admin@eloquent-app.com`

2. **Redeploy your app**

3. **Access at your production URL:**
   ```
   https://your-app.vercel.app
   ```

## 🔒 Security Tips

1. **Never commit `.env` to git** (it's in `.gitignore`)
2. **Use strong passwords** for admin accounts
3. **Limit admin emails** to trusted users only
4. **Regularly review** admin access
5. **Consider 2FA** for production (future enhancement)

## 📞 Still Need Help?

If you're stuck:
1. Check browser console (F12) for errors
2. Check Supabase logs in dashboard
3. Verify all environment variables are set
4. Ensure Supabase project is active
5. Try creating a test user first

## 🎉 Success!

Once you see the Super Admin Dashboard, you can:
- View platform statistics
- Manage pricing plans
- Monitor user subscriptions
- Configure languages
- Adjust platform settings

**You're all set! 🚀**
