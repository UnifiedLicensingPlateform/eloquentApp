import { supabase } from '../lib/supabase'

// Cache for platform settings
let settingsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch platform settings from database
 * Uses caching to reduce database calls
 */
export async function getPlatformSettings(forceRefresh = false) {
  // Return cached settings if available and not expired
  if (!forceRefresh && settingsCache && cacheTimestamp) {
    const now = Date.now()
    if (now - cacheTimestamp < CACHE_DURATION) {
      return settingsCache
    }
  }

  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('setting_key, setting_value, setting_type')

    if (error) {
      console.error('Error fetching platform settings:', error)
      return getFallbackSettings()
    }

    // Convert array to object
    const settings = {}
    data?.forEach(setting => {
      let value = setting.setting_value

      // Parse based on type
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseFloat(value)
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          console.error('Error parsing JSON setting:', setting.setting_key, e)
        }
      }

      settings[setting.setting_key] = value
    })

    // Update cache
    settingsCache = settings
    cacheTimestamp = Date.now()

    return settings
  } catch (error) {
    console.error('Error in getPlatformSettings:', error)
    return getFallbackSettings()
  }
}

/**
 * Get a specific setting value
 */
export async function getSetting(key, defaultValue = null) {
  const settings = await getPlatformSettings()
  return settings[key] !== undefined ? settings[key] : defaultValue
}

/**
 * Get Stripe configuration
 * Falls back to environment variables if not set in database
 */
export async function getStripeConfig() {
  const settings = await getPlatformSettings()
  
  return {
    publishableKey: settings.stripe_publishable_key || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: settings.stripe_secret_key || '' // Secret key should never be exposed to frontend
  }
}

/**
 * Get Gemini API key
 * Falls back to environment variable if not set in database
 */
export async function getGeminiApiKey() {
  const settings = await getPlatformSettings()
  return settings.gemini_api_key || import.meta.env.VITE_GEMINI_API_KEY || ''
}

/**
 * Fallback settings from environment variables
 */
function getFallbackSettings() {
  return {
    stripe_publishable_key: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    stripe_secret_key: '', // Never expose secret key to frontend
    gemini_api_key: import.meta.env.VITE_GEMINI_API_KEY || '',
    app_name: 'Eloquent',
    support_email: 'support@eloquent-app.com',
    max_free_sessions: 5,
    enable_email_notifications: true,
    maintenance_mode: false
  }
}

/**
 * Clear settings cache
 * Call this after updating settings in admin dashboard
 */
export function clearSettingsCache() {
  settingsCache = null
  cacheTimestamp = null
}

/**
 * Update a platform setting (admin only)
 */
export async function updatePlatformSetting(key, value) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

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
          setting_value: String(value),
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
          setting_value: String(value),
          updated_by: user.id
        })

      if (error) throw error
    }

    // Clear cache to force refresh
    clearSettingsCache()
    
    return { success: true }
  } catch (error) {
    console.error('Error updating platform setting:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if app is in maintenance mode
 */
export async function isMaintenanceMode() {
  const mode = await getSetting('maintenance_mode', false)
  return mode === true || mode === 'true'
}

/**
 * Get max free sessions limit
 */
export async function getMaxFreeSessions() {
  return await getSetting('max_free_sessions', 5)
}
