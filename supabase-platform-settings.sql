-- Create platform_settings table for storing API keys and configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT, -- Encrypted value
  setting_type TEXT DEFAULT 'string', -- string, json, boolean, number
  is_encrypted BOOLEAN DEFAULT TRUE,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table for managing admin access
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, superadmin
  added_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create indexes
CREATE INDEX idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_settings
-- Only admins can view settings (we'll check this in the application layer)
CREATE POLICY "Admins can view platform settings" ON platform_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = TRUE
    )
  );

CREATE POLICY "Admins can update platform settings" ON platform_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = TRUE
    )
  );

CREATE POLICY "Admins can insert platform settings" ON platform_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = TRUE
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
    )
  );

CREATE POLICY "Superadmins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.role = 'superadmin'
      AND au.is_active = TRUE
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings (these will be overridden by admin)
INSERT INTO platform_settings (setting_key, setting_value, setting_type, is_encrypted, description) VALUES
  ('stripe_publishable_key', '', 'string', FALSE, 'Stripe Publishable Key (pk_live_... or pk_test_...)'),
  ('stripe_secret_key', '', 'string', TRUE, 'Stripe Secret Key (sk_live_... or sk_test_...)'),
  ('gemini_api_key', '', 'string', TRUE, 'Google Gemini AI API Key'),
  ('app_name', 'Eloquent', 'string', FALSE, 'Application Name'),
  ('support_email', 'support@eloquent-app.com', 'string', FALSE, 'Support Email Address'),
  ('max_free_sessions', '5', 'number', FALSE, 'Maximum free sessions per month'),
  ('enable_email_notifications', 'true', 'boolean', FALSE, 'Enable email notifications'),
  ('maintenance_mode', 'false', 'boolean', FALSE, 'Enable maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to get setting value
CREATE OR REPLACE FUNCTION get_platform_setting(key TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM platform_settings
  WHERE setting_key = key;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update setting value
CREATE OR REPLACE FUNCTION update_platform_setting(
  key TEXT,
  value TEXT,
  updated_by_user UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE platform_settings
  SET 
    setting_value = value,
    updated_by = updated_by_user,
    updated_at = NOW()
  WHERE setting_key = key;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_platform_setting(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_platform_setting(TEXT, TEXT, UUID) TO authenticated;

-- Comments
COMMENT ON TABLE platform_settings IS 'Stores platform-wide configuration settings including API keys';
COMMENT ON TABLE admin_users IS 'Manages admin user access to the Super Admin Dashboard';
COMMENT ON COLUMN platform_settings.is_encrypted IS 'Indicates if the value should be encrypted (for sensitive data like API keys)';
