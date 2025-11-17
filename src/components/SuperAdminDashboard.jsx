import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Users, DollarSign, TrendingUp, Settings, 
  Database, Shield, Globe, Package, 
  BarChart3, AlertCircle, CheckCircle, XCircle,
  Edit2, Save, X, Plus, Trash2
} from 'lucide-react'

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalSessions: 0
  })
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [pricingPlans, setPricingPlans] = useState([])
  const [languages, setLanguages] = useState([])
  const [editingPlan, setEditingPlan] = useState(null)
  const [editingLanguage, setEditingLanguage] = useState(null)
  const [platformSettings, setPlatformSettings] = useState({
    stripe_publishable_key: '',
    stripe_secret_key: '',
    gemini_api_key: ''
  })
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminUsers, setAdminUsers] = useState([])
  const [savingSettings, setSavingSettings] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    checkAdminAccess()
    fetchDashboardData()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // Get admin emails from environment variable or use defaults
    const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || 'admin@eloquent-app.com,superadmin@eloquent-app.com'
    const adminEmails = adminEmailsEnv.split(',').map(e => e.trim())
    
    if (!user || !adminEmails.includes(user.email)) {
      alert('Access denied. Admin privileges required.')
      return
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchSubscriptions(),
        fetchPricingPlans(),
        fetchLanguages(),
        fetchPlatformSettings(),
        fetchAdminUsers()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Total users
      const { count: userCount } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })

      // Active subscriptions
      const { count: activeCount } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .neq('plan_name', 'free')

      // Total sessions
      const { count: sessionCount } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })

      // Monthly revenue (mock calculation)
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('plan_name')
        .eq('status', 'active')

      const revenue = subs?.reduce((acc, sub) => {
        if (sub.plan_name === 'pro') return acc + 9.99
        if (sub.plan_name === 'team') return acc + 29.99
        return acc
      }, 0) || 0

      setStats({
        totalUsers: userCount || 0,
        activeSubscriptions: activeCount || 0,
        monthlyRevenue: revenue,
        totalSessions: sessionCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const fetchPricingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setPricingPlans(data || [])
    } catch (error) {
      console.error('Error fetching pricing plans:', error)
    }
  }

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('supported_languages')
        .select('*')
        .order('language_code', { ascending: true })

      if (error) throw error
      setLanguages(data || [])
    } catch (error) {
      console.error('Error fetching languages:', error)
    }
  }

  const updatePricingPlan = async (planId, updates) => {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update(updates)
        .eq('id', planId)

      if (error) throw error
      
      alert('Pricing plan updated successfully!')
      await fetchPricingPlans()
      setEditingPlan(null)
    } catch (error) {
      console.error('Error updating pricing plan:', error)
      alert('Failed to update pricing plan')
    }
  }

  const togglePlanStatus = async (planId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId)

      if (error) throw error
      await fetchPricingPlans()
    } catch (error) {
      console.error('Error toggling plan status:', error)
    }
  }

  const updateLanguage = async (langId, updates) => {
    try {
      const { error } = await supabase
        .from('supported_languages')
        .update(updates)
        .eq('id', langId)

      if (error) throw error
      
      alert('Language updated successfully!')
      await fetchLanguages()
      setEditingLanguage(null)
    } catch (error) {
      console.error('Error updating language:', error)
      alert('Failed to update language')
    }
  }

  const toggleLanguageStatus = async (langId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('supported_languages')
        .update({ is_active: !currentStatus })
        .eq('id', langId)

      if (error) throw error
      await fetchLanguages()
    } catch (error) {
      console.error('Error toggling language status:', error)
    }
  }

  const fetchPlatformSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['stripe_publishable_key', 'stripe_secret_key', 'gemini_api_key'])

      if (error) throw error
      
      const settings = {}
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value || ''
      })
      
      setPlatformSettings(prev => ({ ...prev, ...settings }))
    } catch (error) {
      console.error('Error fetching platform settings:', error)
    }
  }

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdminUsers(data || [])
    } catch (error) {
      console.error('Error fetching admin users:', error)
    }
  }

  const savePlatformSetting = async (key, value) => {
    setSavingSettings(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if setting exists
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('setting_key', key)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('platform_settings')
          .update({ 
            setting_value: value,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('platform_settings')
          .insert({ 
            setting_key: key,
            setting_value: value,
            updated_by: user.id
          })

        if (error) throw error
      }

      alert(`${key} updated successfully! Note: You may need to restart the application for changes to take effect.`)
      await fetchPlatformSettings()
    } catch (error) {
      console.error('Error saving platform setting:', error)
      alert('Failed to save setting. Please check console for details.')
    } finally {
      setSavingSettings(false)
    }
  }

  const saveStripeConfig = async () => {
    await Promise.all([
      savePlatformSetting('stripe_publishable_key', platformSettings.stripe_publishable_key),
      savePlatformSetting('stripe_secret_key', platformSettings.stripe_secret_key)
    ])
  }

  const saveGeminiConfig = async () => {
    await savePlatformSetting('gemini_api_key', platformSettings.gemini_api_key)
  }

  const addAdminUser = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: newAdminEmail.toLowerCase().trim(),
          added_by: user.id,
          role: 'admin'
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          alert('This email is already an admin')
        } else {
          throw error
        }
        return
      }

      alert('Admin user added successfully!')
      setNewAdminEmail('')
      await fetchAdminUsers()
    } catch (error) {
      console.error('Error adding admin user:', error)
      alert('Failed to add admin user')
    }
  }

  const removeAdminUser = async (adminId) => {
    if (!confirm('Are you sure you want to remove this admin user?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)

      if (error) throw error
      
      alert('Admin user removed successfully!')
      await fetchAdminUsers()
    } catch (error) {
      console.error('Error removing admin user:', error)
      alert('Failed to remove admin user')
    }
  }

  const updateUserPlan = async (userId, newPlan) => {
    if (!confirm(`Change user plan to ${newPlan}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          plan_name: newPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      
      alert('User plan updated successfully!')
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user plan:', error)
      alert('Failed to update user plan')
    }
  }

  const updateUserStatus = async (userId, newStatus) => {
    if (!confirm(`Change user status to ${newStatus}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      
      alert(`User status updated to ${newStatus}!`)
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    }
  }

  const viewUserDetails = (user) => {
    setEditingUser(user)
  }

  const saveUserChanges = async (user) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_name: user.plan_name,
          status: user.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      
      alert('User updated successfully!')
      setEditingUser(null)
      await fetchUsers()
    } catch (error) {
      console.error('Error saving user changes:', error)
      alert('Failed to save user changes')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('⚠️ WARNING: This will permanently delete the user and all their data. Are you sure?')) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm:')
    if (confirmText !== 'DELETE') {
      alert('Deletion canceled')
      return
    }

    try {
      // This will cascade delete due to foreign key constraints
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      alert('User deleted successfully!')
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user. Check console for details.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your SaaS platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'pricing', label: 'Pricing Plans', icon: DollarSign },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'languages', label: 'Languages', icon: Globe },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSubscriptions}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.monthlyRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSessions}</p>
                  </div>
                  <Database className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Subscriptions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.slice(0, 10).map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.user_id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            sub.plan_name === 'pro' ? 'bg-blue-100 text-blue-800' :
                            sub.plan_name === 'team' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.plan_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                            sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Pricing Plans Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                <span>Add Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.display_name?.en || plan.plan_name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{plan.description?.en}</p>
                    </div>
                    <button
                      onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ${plan.price_monthly}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${plan.price_yearly}/year
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Session Limit:</span>
                      <span className="font-medium">{plan.session_limit === -1 ? 'Unlimited' : plan.session_limit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">AI Analysis:</span>
                      {plan.ai_analysis_enabled ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Advanced Analytics:</span>
                      {plan.advanced_analytics ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Export:</span>
                      {plan.export_enabled ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Plan Modal */}
            {editingPlan && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Edit Pricing Plan</h3>
                    <button onClick={() => setEditingPlan(null)} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={editingPlan.price_monthly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => setEditingPlan({...editingPlan, price_monthly: parseFloat(e.target.value)})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={editingPlan.price_yearly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => setEditingPlan({...editingPlan, price_yearly: parseFloat(e.target.value)})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Session Limit (-1 for unlimited)</label>
                      <input
                        type="number"
                        defaultValue={editingPlan.session_limit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => setEditingPlan({...editingPlan, session_limit: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingPlan.ai_analysis_enabled}
                          onChange={(e) => setEditingPlan({...editingPlan, ai_analysis_enabled: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm">AI Analysis</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingPlan.advanced_analytics}
                          onChange={(e) => setEditingPlan({...editingPlan, advanced_analytics: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm">Advanced Analytics</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingPlan.export_enabled}
                          onChange={(e) => setEditingPlan({...editingPlan, export_enabled: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm">Export Enabled</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingPlan.custom_topics}
                          onChange={(e) => setEditingPlan({...editingPlan, custom_topics: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm">Custom Topics</span>
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => updatePricingPlan(editingPlan.id, editingPlan)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setEditingPlan(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active' && u.plan_name !== 'free').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Free Users</p>
                <p className="text-2xl font-bold text-gray-600">
                  {users.filter(u => u.plan_name === 'free').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Canceled</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.status === 'canceled').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{user.user_id.substring(0, 12)}...</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(user.user_id)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy full ID"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.plan_name}
                            onChange={(e) => updateUserPlan(user.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                              user.plan_name === 'pro' ? 'bg-blue-100 text-blue-800' :
                              user.plan_name === 'team' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="team">Team</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.status}
                            onChange={(e) => updateUserStatus(user.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' :
                              user.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              user.status === 'blocked' ? 'bg-black text-white' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="canceled">Canceled</option>
                            <option value="blocked">Blocked</option>
                            <option value="past_due">Past Due</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.stripe_customer_id ? (
                            <a
                              href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {user.stripe_customer_id.substring(0, 12)}...
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewUserDetails(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Details Modal */}
            {editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">User Details</h3>
                    <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                      <input
                        type="text"
                        value={editingUser.user_id}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                        <select
                          value={editingUser.plan_name}
                          onChange={(e) => setEditingUser({...editingUser, plan_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="team">Team</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editingUser.status}
                          onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="canceled">Canceled</option>
                          <option value="blocked">Blocked</option>
                          <option value="past_due">Past Due</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Customer ID</label>
                      <input
                        type="text"
                        value={editingUser.stripe_customer_id || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                        <input
                          type="text"
                          value={new Date(editingUser.created_at).toLocaleString()}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                        <input
                          type="text"
                          value={new Date(editingUser.updated_at).toLocaleString()}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => saveUserChanges(editingUser)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'languages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Language Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                <span>Add Language</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languages.map((lang) => (
                <div key={lang.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{lang.native_name}</h3>
                      <p className="text-sm text-gray-600">{lang.language_code.toUpperCase()}</p>
                    </div>
                    <button
                      onClick={() => toggleLanguageStatus(lang.id, lang.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lang.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lang.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">RTL:</span>
                      {lang.is_rtl ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Speech Recognition:</span>
                      {lang.speech_recognition_supported ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Gemini Support:</span>
                      {lang.gemini_supported ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingLanguage(lang)}
                    className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Admin Access Management</h3>
              <p className="text-gray-600 mb-4">Add admin email addresses that can access this dashboard.</p>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="admin@eloquent-app.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={addAdminUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Admin</span>
                  </button>
                </div>

                {/* Admin Users List */}
                {adminUsers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Admins:</h4>
                    <div className="space-y-2">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{admin.email}</p>
                            <p className="text-xs text-gray-500">
                              Role: {admin.role} • Added: {new Date(admin.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeAdminUser(admin.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Note: Admin users added here will have access to this dashboard. They must create an account with the specified email.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Stripe Configuration</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ⚠️ Recommended: Use environment variables in Netlify/Vercel instead
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Fallback Only
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                These database values are used as fallback. Environment variables take priority for better security.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publishable Key
                    <span className="text-xs text-gray-500 ml-2">(pk_live_... or pk_test_...)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="pk_live_..."
                    value={platformSettings.stripe_publishable_key}
                    onChange={(e) => setPlatformSettings({...platformSettings, stripe_publishable_key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key
                    <span className="text-xs text-gray-500 ml-2">(sk_live_... or sk_test_...)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="sk_live_..."
                    value={platformSettings.stripe_secret_key}
                    onChange={(e) => setPlatformSettings({...platformSettings, stripe_secret_key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={saveStripeConfig}
                  disabled={savingSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Stripe Configuration'}</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Current keys in .env file will be overridden by database values. Restart the app after saving.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Gemini AI Configuration</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ⚠️ Recommended: Use environment variables in Netlify/Vercel instead
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Fallback Only
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Configure your Google Gemini AI API key for advanced speech analysis. Environment variables take priority.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                    <span className="text-xs text-gray-500 ml-2">(AIza...)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={platformSettings.gemini_api_key}
                    onChange={(e) => setPlatformSettings({...platformSettings, gemini_api_key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={saveGeminiConfig}
                  disabled={savingSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Gemini Configuration'}</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Get your free Gemini API key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">🔒 Security Best Practices</h3>
              <div className="space-y-3 text-sm text-blue-900">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Recommended:</strong> Use environment variables in Netlify/Vercel for maximum security</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p>Database settings are fallback only - environment variables take priority</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Never store secret keys (sk_live_...) in the database - use backend environment variables only</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Settings className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <p>Restart application after changing API keys for changes to take effect</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">📚 How to set environment variables in Netlify:</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Go to Netlify Dashboard → Your Site</li>
                  <li>Navigate to Site Settings → Environment Variables</li>
                  <li>Add: VITE_STRIPE_PUBLISHABLE_KEY, VITE_GEMINI_API_KEY</li>
                  <li>Redeploy your site</li>
                </ol>
                <a 
                  href="https://docs.netlify.com/environment-variables/overview/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm mt-2 inline-block"
                >
                  View Netlify Documentation →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>  
)
}
