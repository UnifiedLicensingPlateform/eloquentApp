# Super Admin Access Guide

## 🔐 How to Access the Super Admin Dashboard

### Step 1: Configure Admin Email
The admin access is controlled by email addresses in the code. Currently configured admins:
- `admin@eloquent-app.com`
- `superadmin@eloquent-app.com`

### Step 2: Add Your Email as Admin

You need to add your actual email to the admin list. Edit `src/App.jsx`:

```javascript
const checkAdminStatus = (email) => {
  const adminEmails = [
    'admin@eloquent-app.com', 
    'superadmin@eloquent-app.com',
    'your-actual-email@example.com'  // Add your email here
  ]
  setIsAdmin(adminEmails.includes(email))
}
```

Or in `src/components/SuperAdminDashboard.jsx`:

```javascript
const checkAdminAccess = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = [
    'admin@eloquent-app.com',
    'your-actual-email@example.com'  // Add your email here
  ]
  if (!user || !adminEmails.includes(user.email)) {
    alert('Access denied. Admin privileges required.')
    return
  }
}
```

### Step 3: Access the Dashboard

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   ```
   http://localhost:5173
   ```
   (or whatever port Vite is running on)

3. **Sign up/Login with your admin email:**
   - If you haven't created an account yet, sign up with the email you added to the admin list
   - If you already have an account, just log in

4. **Access Super Admin:**
   - After logging in, you'll see a **Shield icon** in the navigation bar
   - Click on "Super Admin" to access the dashboard

## 🌐 Production URL Access

For production deployment:

1. **Deploy your app** (e.g., Vercel, Netlify, etc.)
2. **Your production URL will be something like:**
   ```
   https://your-app-name.vercel.app
   ```
   or
   ```
   https://eloquent-app.com
   ```

3. **Login with admin credentials** at the production URL
4. **Click the Shield icon** to access Super Admin

## 🔧 Quick Setup for Testing

If you want to test immediately without creating a real account:

### Option 1: Use Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Create a test user with email: `admin@eloquent-app.com`
4. Set a password
5. Use these credentials to login

### Option 2: Modify Code Temporarily
For development/testing only, you can temporarily bypass the email check:

```javascript
// In src/App.jsx - ONLY FOR TESTING
const checkAdminStatus = (email) => {
  setIsAdmin(true)  // This makes everyone an admin - REMOVE IN PRODUCTION!
}
```

**⚠️ WARNING: Remove this before deploying to production!**

## 📋 Complete Access Checklist

- [ ] Add your email to admin list in `src/App.jsx`
- [ ] Add your email to admin list in `src/components/SuperAdminDashboard.jsx`
- [ ] Start development server (`npm run dev`)
- [ ] Create/login with admin email in Supabase Auth
- [ ] Look for Shield icon in navigation
- [ ] Click "Super Admin" to access dashboard

## 🎯 What You'll See

Once logged in as admin, you'll have access to:

1. **Overview Tab** - Platform statistics
2. **Pricing Plans Tab** - Manage pricing tiers
3. **Users Tab** - View all users and subscriptions
4. **Languages Tab** - Configure supported languages
5. **Settings Tab** - Platform configuration

## 🔒 Security Best Practices

### For Production:
1. **Never hardcode admin emails in production code**
2. **Use environment variables:**
   ```javascript
   const adminEmails = process.env.VITE_ADMIN_EMAILS?.split(',') || []
   ```

3. **Create `.env` file:**
   ```env
   VITE_ADMIN_EMAILS=admin@eloquent-app.com,your-email@example.com
   ```

4. **Add to `.env.example`:**
   ```env
   VITE_ADMIN_EMAILS=admin@example.com
   ```

### Recommended: Database-Based Admin Roles

For better security, create an admin roles table in Supabase:

```sql
-- Create admin_users table
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin', -- admin, superadmin, moderator
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy to check if user is admin
CREATE POLICY "Users can view their own admin status" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);
```

Then update your code to check the database:

```javascript
const checkAdminStatus = async (userId) => {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  setIsAdmin(!!data)
}
```

## 🆘 Troubleshooting

### Issue: Shield icon not showing
- **Solution**: Check that your email matches exactly in the admin list
- Verify you're logged in with the correct account
- Check browser console for errors

### Issue: "Access denied" message
- **Solution**: Your email is not in the admin list
- Add your email to both `App.jsx` and `SuperAdminDashboard.jsx`
- Restart the dev server after changes

### Issue: Dashboard not loading data
- **Solution**: Check Supabase connection
- Verify RLS policies are set correctly
- Check browser console for API errors
- Ensure you have data in the database tables

### Issue: Can't see any users/subscriptions
- **Solution**: You need to have actual data in your database
- Create test users in Supabase Auth
- Add test subscriptions to `user_subscriptions` table

## 📝 Current Default Credentials

**Note:** These are placeholder emails. You need to:
1. Create actual accounts in Supabase with these emails, OR
2. Replace them with your real email address

**Default Admin Emails:**
- `admin@eloquent-app.com`
- `superadmin@eloquent-app.com`

**To create an account:**
1. Go to your app URL
2. Click "Sign Up"
3. Use one of the admin emails above
4. Set a password
5. Verify email (if required)
6. Login and access Super Admin

## 🚀 Quick Start Command

```bash
# 1. Update admin emails in code
# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:5173

# 4. Sign up with admin email
# 5. Click Shield icon → Super Admin
```

## 📞 Need Help?

If you're still having trouble accessing the Super Admin Dashboard:
1. Check that Supabase is properly configured
2. Verify your `.env` file has correct Supabase credentials
3. Ensure you're using the correct email
4. Check browser console for errors
5. Review Supabase logs for authentication issues
