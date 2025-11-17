# 🔐 Super Admin Access - Quick Reference

## 📍 Access URL

### Development
```
http://localhost:5173
```

### Production
```
https://your-app-domain.com
```
(Replace with your actual deployed URL)

## 👤 Default Admin Emails

These are the **default configured emails**. You need to either:
1. Create accounts with these emails, OR
2. Add your own email to the configuration

**Default Emails:**
- `admin@eloquent-app.com`
- `superadmin@eloquent-app.com`

## 🔧 How to Add Your Email

### Quick Method (3 minutes):

1. **Edit `.env` file:**
   ```env
   VITE_ADMIN_EMAILS=your-email@example.com,admin@eloquent-app.com
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

3. **Create account:**
   - Go to http://localhost:5173
   - Sign up with `your-email@example.com`
   - Login and click Shield icon 🛡️

## 🎯 Step-by-Step Access

```
1. Configure Email
   ↓
2. Create Account in Supabase
   ↓
3. Login to App
   ↓
4. Click Shield Icon 🛡️
   ↓
5. Access Super Admin Dashboard ✅
```

## 🔑 Creating Admin Credentials

### Option 1: Via App (Recommended)
1. Start app: `npm run dev`
2. Go to: `http://localhost:5173`
3. Click "Sign Up"
4. Email: `your-email@example.com` (from .env)
5. Password: Create a strong password
6. Login with these credentials

### Option 2: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **EloquentApp**
3. Navigate: **Authentication** → **Users** → **Add user**
4. Email: `your-email@example.com`
5. Password: Create a strong password
6. ✅ Check "Auto Confirm User"
7. Click "Create user"

## 📋 Current Configuration

**File:** `.env`
```env
VITE_ADMIN_EMAILS=admin@eloquent-app.com,superadmin@eloquent-app.com
```

**To add your email:**
```env
VITE_ADMIN_EMAILS=your-email@example.com,admin@eloquent-app.com
```

## 🎬 Complete Setup Commands

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and add your email
# VITE_ADMIN_EMAILS=your-email@example.com

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:5173

# 6. Sign up with your admin email
# 7. Login
# 8. Click Shield icon → Super Admin
```

## 🛡️ What You'll See

After successful login as admin:

**Navigation Bar:**
```
[Dashboard] [Practice] [Text Assistant] [Emotional IQ] [Pricing] [Billing] [🛡️ Super Admin]
                                                                              ↑
                                                                         Click here!
```

**Super Admin Dashboard:**
- **Overview** - Platform statistics
- **Pricing Plans** - Manage pricing tiers
- **Users** - View all users
- **Languages** - Configure languages
- **Settings** - Platform configuration

## ⚠️ Important Notes

1. **No Default Password** - You must create accounts yourself
2. **Email Must Match** - Login email must be in `VITE_ADMIN_EMAILS`
3. **Restart Required** - Restart dev server after changing `.env`
4. **Case Sensitive** - Email addresses are case-sensitive
5. **No Spaces** - Ensure no extra spaces in email configuration

## 🔍 Verification

To verify your setup:

```bash
# Check .env file
cat .env | grep ADMIN

# Should output:
# VITE_ADMIN_EMAILS=your-email@example.com,admin@eloquent-app.com
```

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Shield icon not showing | Check email matches `.env` exactly |
| "Access denied" alert | Email not in admin list |
| Can't login | Create account in Supabase first |
| Changes not working | Restart dev server |

## 📞 Quick Help

**Can't access?**
1. ✅ Check `.env` has your email
2. ✅ Account created in Supabase
3. ✅ Dev server restarted
4. ✅ Logged in with correct email
5. ✅ Look for Shield icon 🛡️

## 🎉 Success Indicators

You're successfully logged in as admin when you see:
- ✅ Shield icon in navigation
- ✅ "Super Admin" menu item
- ✅ Can click and access dashboard
- ✅ See Overview, Pricing, Users, Languages, Settings tabs

## 🔐 Security Reminder

**For Production:**
- Use environment variables in hosting platform
- Never commit `.env` to git
- Use strong passwords
- Limit admin access to trusted users only
- Regularly review admin list

---

## 📚 More Information

- **Detailed Guide:** See `SUPER_ADMIN_ACCESS_GUIDE.md`
- **Quick Setup:** See `QUICK_ADMIN_SETUP.md`
- **Features:** See `SUPER_ADMIN_FEATURES.md`
- **Changelog:** See `CHANGELOG.md`
