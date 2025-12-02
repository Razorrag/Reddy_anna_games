import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Save,
  RefreshCw,
  Shield,
  Mail,
  MessageSquare,
  Bell,
  Key,
  Database,
  Server,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSystemSettingsQuery } from '@/hooks/queries/useSystemSettingsQuery';
import { useUpdateSystemSettingsMutation } from '@/hooks/mutations/useUpdateSystemSettingsMutation';
import { toast } from 'sonner';

type SettingsCategory = 'general' | 'security' | 'payments' | 'communications' | 'integrations' | 'maintenance';

export default function SystemSettings() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const { data: settings, isLoading } = useSystemSettingsQuery();
  const updateSettings = useUpdateSystemSettingsMutation();

  const [formData, setFormData] = useState({
    // General
    platformName: settings?.platformName || 'Reddy Anna',
    platformUrl: settings?.platformUrl || 'https://reddyanna.com',
    supportEmail: settings?.supportEmail || 'support@reddyanna.com',
    supportPhone: settings?.supportPhone || '+91 1234567890',
    timezone: settings?.timezone || 'Asia/Kolkata',
    currency: settings?.currency || 'INR',
    
    // Security
    sessionTimeout: settings?.sessionTimeout || 30,
    maxLoginAttempts: settings?.maxLoginAttempts || 5,
    passwordMinLength: settings?.passwordMinLength || 8,
    twoFactorEnabled: settings?.twoFactorEnabled || false,
    ipWhitelist: settings?.ipWhitelist || '',
    
    // Payments
    minDeposit: settings?.minDeposit || 100,
    maxDeposit: settings?.maxDeposit || 100000,
    minWithdrawal: settings?.minWithdrawal || 500,
    maxWithdrawal: settings?.maxWithdrawal || 500000,
    withdrawalProcessingTime: settings?.withdrawalProcessingTime || 24,
    autoApproveDeposits: settings?.autoApproveDeposits || false,
    
    // Communications
    whatsappEnabled: settings?.whatsappEnabled || true,
    whatsappNumber: settings?.whatsappNumber || '+91 9876543210',
    emailNotifications: settings?.emailNotifications || true,
    smsNotifications: settings?.smsNotifications || false,
    pushNotifications: settings?.pushNotifications || true,
    
    // Integrations
    omeStreamUrl: settings?.omeStreamUrl || 'wss://stream.reddyanna.com',
    apiKey: settings?.apiKey || '',
    webhookUrl: settings?.webhookUrl || '',
    analyticsEnabled: settings?.analyticsEnabled || true,
    
    // Maintenance
    maintenanceMode: settings?.maintenanceMode || false,
    maintenanceMessage: settings?.maintenanceMessage || 'System under maintenance',
    allowedIPs: settings?.allowedIPs || ''
  });

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleReset = () => {
    setFormData({
      platformName: settings?.platformName || 'Reddy Anna',
      platformUrl: settings?.platformUrl || '',
      supportEmail: settings?.supportEmail || '',
      supportPhone: settings?.supportPhone || '',
      timezone: settings?.timezone || 'Asia/Kolkata',
      currency: settings?.currency || 'INR',
      sessionTimeout: settings?.sessionTimeout || 30,
      maxLoginAttempts: settings?.maxLoginAttempts || 5,
      passwordMinLength: settings?.passwordMinLength || 8,
      twoFactorEnabled: settings?.twoFactorEnabled || false,
      ipWhitelist: settings?.ipWhitelist || '',
      minDeposit: settings?.minDeposit || 100,
      maxDeposit: settings?.maxDeposit || 100000,
      minWithdrawal: settings?.minWithdrawal || 500,
      maxWithdrawal: settings?.maxWithdrawal || 500000,
      withdrawalProcessingTime: settings?.withdrawalProcessingTime || 24,
      autoApproveDeposits: settings?.autoApproveDeposits || false,
      whatsappEnabled: settings?.whatsappEnabled || true,
      whatsappNumber: settings?.whatsappNumber || '',
      emailNotifications: settings?.emailNotifications || true,
      smsNotifications: settings?.smsNotifications || false,
      pushNotifications: settings?.pushNotifications || true,
      omeStreamUrl: settings?.omeStreamUrl || '',
      apiKey: settings?.apiKey || '',
      webhookUrl: settings?.webhookUrl || '',
      analyticsEnabled: settings?.analyticsEnabled || true,
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceMessage: settings?.maintenanceMessage || '',
      allowedIPs: settings?.allowedIPs || ''
    });
    toast.info('Settings reset to saved values');
  };

  const categories = [
    { id: 'general' as SettingsCategory, label: 'General', icon: Settings },
    { id: 'security' as SettingsCategory, label: 'Security', icon: Shield },
    { id: 'payments' as SettingsCategory, label: 'Payments', icon: DollarSign },
    { id: 'communications' as SettingsCategory, label: 'Communications', icon: MessageSquare },
    { id: 'integrations' as SettingsCategory, label: 'Integrations', icon: Zap },
    { id: 'maintenance' as SettingsCategory, label: 'Maintenance', icon: Server }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Settings className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Configure global platform settings and preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          {formData.maintenanceMode && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Maintenance Mode Active
            </Badge>
          )}
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-cyan-500/30 hover:border-cyan-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-4 h-fit">
          <h3 className="text-white font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeCategory === id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-[#0A0E27] text-gray-400 hover:text-white hover:bg-[#0f1432]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeCategory === 'general' && (
            <GeneralSettings formData={formData} setFormData={setFormData} />
          )}
          {activeCategory === 'security' && (
            <SecuritySettings formData={formData} setFormData={setFormData} />
          )}
          {activeCategory === 'payments' && (
            <PaymentSettings formData={formData} setFormData={setFormData} />
          )}
          {activeCategory === 'communications' && (
            <CommunicationSettings formData={formData} setFormData={setFormData} />
          )}
          {activeCategory === 'integrations' && (
            <IntegrationSettings formData={formData} setFormData={setFormData} />
          )}
          {activeCategory === 'maintenance' && (
            <MaintenanceSettings formData={formData} setFormData={setFormData} />
          )}
        </div>
      </div>
    </div>
  );
}

// General Settings Section
function GeneralSettings({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Platform Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input
              value={formData.platformName}
              onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label>Platform URL</Label>
            <Input
              value={formData.platformUrl}
              onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label>Support Phone</Label>
            <Input
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Input
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Security Settings Section
function SecuritySettings({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Security Configuration
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={formData.sessionTimeout}
                onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input
                type="number"
                value={formData.maxLoginAttempts}
                onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Password Min Length</Label>
              <Input
                type="number"
                value={formData.passwordMinLength}
                onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-gray-400 text-sm">Require 2FA for admin users</p>
              </div>
            </div>
            <Switch
              checked={formData.twoFactorEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, twoFactorEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>IP Whitelist (one per line)</Label>
            <Textarea
              value={formData.ipWhitelist}
              onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
              rows={4}
              className="bg-[#0A0E27] border-cyan-500/30"
              placeholder="192.168.1.1&#10;10.0.0.0/24"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Payment Settings Section
function PaymentSettings({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          Payment Configuration
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Min Deposit (₹)</Label>
              <Input
                type="number"
                value={formData.minDeposit}
                onChange={(e) => setFormData({ ...formData, minDeposit: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Deposit (₹)</Label>
              <Input
                type="number"
                value={formData.maxDeposit}
                onChange={(e) => setFormData({ ...formData, maxDeposit: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Min Withdrawal (₹)</Label>
              <Input
                type="number"
                value={formData.minWithdrawal}
                onChange={(e) => setFormData({ ...formData, minWithdrawal: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Withdrawal (₹)</Label>
              <Input
                type="number"
                value={formData.maxWithdrawal}
                onChange={(e) => setFormData({ ...formData, maxWithdrawal: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Withdrawal Processing Time (hours)</Label>
              <Input
                type="number"
                value={formData.withdrawalProcessingTime}
                onChange={(e) => setFormData({ ...formData, withdrawalProcessingTime: parseInt(e.target.value) })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Auto-Approve Deposits</p>
                <p className="text-gray-400 text-sm">Automatically approve deposit requests</p>
              </div>
            </div>
            <Switch
              checked={formData.autoApproveDeposits}
              onCheckedChange={(checked) => setFormData({ ...formData, autoApproveDeposits: checked })}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Communication Settings Section
function CommunicationSettings({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Communication Settings
        </h3>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">WhatsApp Integration</p>
                  <p className="text-gray-400 text-sm">Enable WhatsApp payments</p>
                </div>
              </div>
              <Switch
                checked={formData.whatsappEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, whatsappEnabled: checked })}
              />
            </div>

            {formData.whatsappEnabled && (
              <div className="space-y-2 ml-12">
                <Label>WhatsApp Number</Label>
                <Input
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="bg-[#0A0E27] border-cyan-500/30"
                  placeholder="+91 9876543210"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Send email notifications to users</p>
              </div>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-gray-400 text-sm">Send SMS notifications to users</p>
              </div>
            </div>
            <Switch
              checked={formData.smsNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-gray-400 text-sm">Send push notifications</p>
              </div>
            </div>
            <Switch
              checked={formData.pushNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Integration Settings Section
function IntegrationSettings({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          External Integrations
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>OvenMediaEngine Stream URL</Label>
            <Input
              value={formData.omeStreamUrl}
              onChange={(e) => setFormData({ ...formData, omeStreamUrl: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
              placeholder="wss://stream.reddyanna.com"
            />
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="bg-[#0A0E27] border-cyan-500/30"
              />
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              className="bg-[#0A0E27] border-cyan-500/30"
              placeholder="https://api.example.com/webhook"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">Analytics Tracking</p>
                <p className="text-gray-400 text-sm">Enable analytics and tracking</p>
              </div>
            </div>
            <Switch
              checked={formData.analyticsEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, analyticsEnabled: checked })}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Maintenance Settings Section
function MaintenanceSettings({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-[#1a1f3a] border-red-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Maintenance Mode
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-3">
              {formData.maintenanceMode ? (
                <Lock className="w-5 h-5 text-red-400" />
              ) : (
                <Unlock className="w-5 h-5 text-green-400" />
              )}
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-gray-400 text-sm">
                  {formData.maintenanceMode 
                    ? 'Platform is currently in maintenance mode' 
                    : 'Platform is operating normally'}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.maintenanceMode}
              onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Maintenance Message</Label>
            <Textarea
              value={formData.maintenanceMessage}
              onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
              rows={3}
              className="bg-[#0A0E27] border-cyan-500/30"
              placeholder="System is under maintenance. We'll be back soon!"
            />
          </div>

          <div className="space-y-2">
            <Label>Allowed IPs During Maintenance (one per line)</Label>
            <Textarea
              value={formData.allowedIPs}
              onChange={(e) => setFormData({ ...formData, allowedIPs: e.target.value })}
              rows={4}
              className="bg-[#0A0E27] border-cyan-500/30"
              placeholder="192.168.1.1&#10;10.0.0.0/24"
            />
            <p className="text-gray-400 text-sm">
              These IP addresses will have access during maintenance mode
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}