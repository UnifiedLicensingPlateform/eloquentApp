# Super Admin Dashboard - Feature Documentation

## Overview
The Super Admin Dashboard is a comprehensive SaaS management interface that allows administrators to manage all aspects of the Eloquent App platform.

## Access Control
- **Admin Emails**: Configure authorized admin emails in `App.jsx`
- **Default Admins**: 
  - `admin@eloquent-app.com`
  - `superadmin@eloquent-app.com`
- **Navigation**: Shield icon appears in navigation for authorized users only

## Dashboard Tabs

### 1. Overview Tab
Real-time platform statistics and monitoring:
- **Total Users**: Count of all registered users
- **Active Subscriptions**: Number of paid (Pro/Team) active subscriptions
- **Monthly Revenue**: Calculated from active subscriptions
- **Total Sessions**: All practice sessions across platform
- **Recent Subscriptions Table**: Last 10 subscriptions with status

### 2. Pricing Plans Management
Full control over pricing tiers:
- **View All Plans**: Free, Pro, Team with visual cards
- **Edit Plans**: Modal-based editing interface
  - Monthly and yearly pricing
  - Session limits (-1 for unlimited)
  - Feature toggles:
    - AI Analysis
    - Advanced Analytics
    - Export Enabled
    - Custom Topics
    - Team Features
    - API Access
    - Priority Support
- **Toggle Active Status**: Enable/disable plans
- **Multi-language Support**: Display names and descriptions in multiple languages

### 3. User Management
Monitor and manage user subscriptions:
- **User List**: All users with subscription details
- **Information Displayed**:
  - User ID (truncated for privacy)
  - Current plan (Free/Pro/Team)
  - Subscription status (active/canceled/past_due)
  - Stripe customer ID
  - Account creation date
- **Visual Status Badges**: Color-coded for quick identification

### 4. Language Management
Configure supported languages:
- **Language Cards**: All supported languages with native names
- **Language Features**:
  - RTL (Right-to-Left) support indicator
  - Speech recognition support
  - Gemini AI support
  - Active/Inactive status toggle
- **Supported Languages**:
  - English, Urdu, Arabic, Spanish, French
  - German, Hindi, Chinese, Japanese, Korean

### 5. Settings Tab
Platform configuration:
- **Admin Access Management**: Add/remove admin emails
- **Stripe Configuration**: 
  - Publishable key
  - Secret key
- **Gemini AI Configuration**: API key management

## Database Schema

### Tables Used
1. **pricing_plans**: Store all pricing tier information
2. **user_subscriptions**: Track user subscription status
3. **practice_sessions**: Monitor platform usage
4. **supported_languages**: Language configuration
5. **billing_history**: Payment tracking

### Security
- Row Level Security (RLS) enabled on all tables
- Admin-only read access for sensitive data
- Public read for pricing plans and languages
- User-specific access for subscriptions

## Technical Implementation

### Components
- `SuperAdminDashboard.jsx`: Main dashboard component
- Integrated into `App.jsx` with conditional rendering

### Features
- Real-time data fetching with Supabase
- Optimistic UI updates
- Modal-based editing
- Responsive design
- Error handling and user feedback
- Visual status indicators

### API Integration
- Supabase for database operations
- Stripe for payment processing
- Gemini AI for analysis features

## Usage Instructions

### For Admins
1. Log in with an authorized admin email
2. Click the "Super Admin" menu item (Shield icon)
3. Navigate between tabs to manage different aspects
4. Use edit buttons to modify pricing plans or languages
5. Monitor platform health via Overview tab

### Adding New Admins
1. Go to Settings tab
2. Enter admin email address
3. Click "Add Admin"
4. Admin will have access on next login

### Editing Pricing Plans
1. Go to Pricing Plans tab
2. Click "Edit" on desired plan
3. Modify pricing, limits, or features
4. Click "Save Changes"
5. Changes reflect immediately

### Managing Languages
1. Go to Languages tab
2. Toggle active status to enable/disable
3. Click "Edit" to modify language settings
4. Add new languages with "Add Language" button

## Future Enhancements
- [ ] Bulk user operations
- [ ] Advanced analytics and reporting
- [ ] Email notification system
- [ ] Audit log for admin actions
- [ ] Custom plan creation
- [ ] Revenue forecasting
- [ ] User activity monitoring
- [ ] Automated billing reports

## Security Considerations
- Always use environment variables for API keys
- Regularly rotate admin credentials
- Monitor admin access logs
- Implement 2FA for admin accounts (future)
- Regular security audits

## Support
For issues or questions about the Super Admin Dashboard:
- Check database RLS policies
- Verify admin email configuration
- Review Supabase logs
- Contact development team
