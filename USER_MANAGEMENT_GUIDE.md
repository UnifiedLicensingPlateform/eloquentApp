# User Management Guide - Super Admin Dashboard

## 🎯 Overview

The Super Admin Dashboard now includes comprehensive user management features allowing you to:
- View all users and their subscriptions
- Change user plans (Free, Pro, Team)
- Update user status (Active, Inactive, Canceled, Blocked, Past Due)
- View detailed user information
- Delete users (with confirmation)
- Monitor user statistics

## 📊 User Management Features

### 1. User Statistics Dashboard

At the top of the Users tab, you'll see real-time statistics:
- **Total Users**: All registered users
- **Active Subscriptions**: Users with active paid plans
- **Free Users**: Users on the free plan
- **Canceled**: Users who canceled their subscription

### 2. User Table

The main table displays all users with the following information:
- User ID (with copy button)
- Current Plan (dropdown to change)
- Status (dropdown to change)
- Stripe Customer ID (clickable link to Stripe dashboard)
- Created Date
- Action buttons (View Details, Delete)

### 3. Quick Actions

#### Change User Plan
- Click the plan dropdown in the table
- Select: Free, Pro, or Team
- Confirm the change
- Plan updates immediately

#### Change User Status
Available statuses:
- **Active**: User can access all features
- **Inactive**: User account is inactive
- **Canceled**: User canceled subscription
- **Blocked**: User is blocked from accessing the app
- **Past Due**: Payment is overdue

#### View User Details
- Click the edit icon (pencil)
- View full user information
- Edit plan and status
- See creation and update timestamps
- Save changes

#### Delete User
- Click the delete icon (trash)
- Confirm deletion by typing "DELETE"
- Permanently removes user and all data
- ⚠️ This action cannot be undone!

## 🔐 User Status Meanings

### Active
- User has full access to their plan features
- Can create practice sessions
- All features enabled

### Inactive
- User account is temporarily disabled
- Cannot login or access features
- Data is preserved

### Canceled
- User canceled their subscription
- May have access until period end
- Will revert to free plan

### Blocked
- User is permanently blocked
- Cannot access the application
- Use for policy violations or abuse

### Past Due
- Payment failed or overdue
- Limited access until payment resolved
- Stripe will retry payment

## 🛠️ Common Admin Tasks

### Task 1: Upgrade User to Pro
1. Find user in the table
2. Click plan dropdown
3. Select "Pro"
4. Confirm change
5. User immediately has Pro features

### Task 2: Block Abusive User
1. Find user in the table
2. Click status dropdown
3. Select "Blocked"
4. Confirm change
5. User cannot access app

### Task 3: Manually Cancel Subscription
1. Find user in the table
2. Click status dropdown
3. Select "Canceled"
4. Confirm change
5. User subscription is canceled

### Task 4: View User Details
1. Click edit icon on user row
2. Review all user information
3. Make any necessary changes
4. Click "Save Changes"
5. Or click "Cancel" to discard

### Task 5: Delete User Account
1. Click delete icon on user row
2. Read warning message
3. Type "DELETE" to confirm
4. User and all data permanently deleted

## 📋 User Management Best Practices

### When to Block Users
- Policy violations
- Abuse of service
- Fraudulent activity
- Spam or malicious behavior

### When to Change Plans
- Manual upgrades/downgrades
- Promotional offers
- Customer service requests
- Testing purposes

### When to Delete Users
- User requested account deletion (GDPR)
- Duplicate accounts
- Test accounts cleanup
- Spam accounts

### When to Set Inactive
- Temporary suspension
- Investigation pending
- User requested pause
- Payment issues being resolved

## ⚠️ Important Warnings

### Deleting Users
- **Permanent action** - cannot be undone
- Deletes all user data:
  - Practice sessions
  - Progress tracking
  - Subscription history
  - Usage data
- Stripe customer remains (for records)
- Consider setting to "Inactive" instead

### Changing Plans
- Does not affect Stripe billing
- Manual plan changes bypass Stripe
- May cause billing discrepancies
- Use for testing or special cases only

### Blocking Users
- User cannot login
- Active sessions terminated
- Data preserved
- Can be unblocked later

## 🔄 Integration with Stripe

### Stripe Customer Links
- Click Stripe Customer ID to open Stripe dashboard
- View payment history
- Manage subscriptions
- Process refunds
- Update payment methods

### Sync Considerations
- Manual changes in admin dashboard don't sync to Stripe
- Stripe webhooks update database automatically
- For billing changes, use Stripe dashboard
- Admin dashboard is for access control only

## 📊 Monitoring Users

### Regular Checks
- Review blocked users monthly
- Check past due accounts weekly
- Monitor free to paid conversion
- Track cancellation reasons

### Reports to Generate
- Monthly active users
- Subscription churn rate
- Plan distribution
- Revenue per user

## 🔒 Security & Privacy

### Access Control
- Only superadmins can manage users
- All actions are logged
- User IDs are truncated for privacy
- Full IDs available on click

### Data Protection
- User data encrypted in database
- Secure connections (HTTPS)
- RLS policies enforce access control
- Audit trail for all changes

### GDPR Compliance
- Users can request deletion
- Export user data before deletion
- Maintain deletion records
- Respect data retention policies

## 🚨 Troubleshooting

### Problem: Can't change user plan
**Solution:**
- Check database connection
- Verify RLS policies
- Ensure you're a superadmin
- Check browser console for errors

### Problem: User still has access after blocking
**Solution:**
- User may have active session
- Wait for session to expire (24 hours)
- Or implement real-time session checking
- User must logout and login again

### Problem: Deleted user still appears
**Solution:**
- Refresh the page
- Check if deletion actually succeeded
- Review database constraints
- Check for foreign key issues

### Problem: Stripe link doesn't work
**Solution:**
- Verify Stripe Customer ID is valid
- Check Stripe account access
- Ensure using correct Stripe account (test vs live)

## 📝 User Management Checklist

Daily:
- [ ] Review new signups
- [ ] Check for blocked users
- [ ] Monitor past due accounts

Weekly:
- [ ] Review cancellations
- [ ] Check for duplicate accounts
- [ ] Update user statistics

Monthly:
- [ ] Clean up test accounts
- [ ] Review inactive users
- [ ] Generate usage reports
- [ ] Audit admin actions

## 🎓 Training for Team

### For Support Team
- How to view user details
- How to check subscription status
- When to escalate to admin
- How to handle user requests

### For Admins
- All user management features
- When to use each status
- How to handle edge cases
- Security best practices

## 📞 Support Scenarios

### Scenario 1: User Can't Access Pro Features
1. Check user plan in admin dashboard
2. Verify status is "Active"
3. Check Stripe subscription status
4. If needed, manually set to Pro
5. Ask user to logout and login

### Scenario 2: User Wants Refund
1. View user in admin dashboard
2. Click Stripe Customer ID link
3. Process refund in Stripe
4. Set status to "Canceled"
5. Confirm with user

### Scenario 3: Suspected Fraud
1. Set status to "Blocked" immediately
2. Review user activity
3. Check payment history in Stripe
4. Document findings
5. Delete account if confirmed

## 🔮 Future Enhancements

Planned features:
- [ ] Bulk user operations
- [ ] Advanced filtering and search
- [ ] Export user list to CSV
- [ ] User activity timeline
- [ ] Automated blocking rules
- [ ] Email notifications to users
- [ ] Usage analytics per user
- [ ] Custom user notes/tags

## 📚 Related Documentation

- [Super Admin Features](SUPER_ADMIN_FEATURES.md)
- [Security Best Practices](SECURITY_BEST_PRACTICES.md)
- [Admin Access Guide](SUPER_ADMIN_ACCESS_GUIDE.md)
- [Stripe Integration](STRIPE_INTEGRATION_GUIDE.md)
