import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePartnerSettingsQuery } from '@/hooks/queries/usePartnerSettingsQuery';
import { useUpdatePartnerProfileMutation } from '@/hooks/mutations/useUpdatePartnerProfileMutation';
import { useUpdatePartnerPasswordMutation } from '@/hooks/mutations/useUpdatePartnerPasswordMutation';
import { useUpdatePartnerPreferencesMutation } from '@/hooks/mutations/useUpdatePartnerPreferencesMutation';
import { toast } from 'sonner';

export default function PartnerSettings() {
  const { data: settings, isLoading } = usePartnerSettingsQuery();
  const updateProfile = useUpdatePartnerProfileMutation();
  const updatePassword = useUpdatePartnerPasswordMutation();
  const updatePreferences = useUpdatePartnerPreferencesMutation();

  // Profile
  const [name, setName] = useState(settings?.name || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [upiId, setUpiId] = useState(settings?.upiId || '');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(settings?.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(settings?.smsNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(settings?.pushNotifications ?? true);
  const [earningsAlerts, setEarningsAlerts] = useState(settings?.earningsAlerts ?? true);
  const [payoutAlerts, setPayoutAlerts] = useState(settings?.payoutAlerts ?? true);
  const [referralAlerts, setReferralAlerts] = useState(settings?.referralAlerts ?? true);

  const handleUpdateProfile = async () => {
    if (!name || !email || !phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await updateProfile.mutateAsync({ name, email, phone, upiId });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await updatePassword.mutateAsync({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences.mutateAsync({
        emailNotifications,
        smsNotifications,
        pushNotifications,
        earningsAlerts,
        payoutAlerts,
        referralAlerts
      });
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Partner Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Status */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {settings?.name?.[0].toUpperCase() || 'P'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{settings?.name || 'Partner'}</h3>
              <p className="text-gray-400">Partner ID: {settings?.partnerId || 'N/A'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">Active</Badge>
                <Badge variant="gold">{settings?.commissionRate || 2}% Commission</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="text-white font-medium">{settings?.memberSince || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          Profile Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white">Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Email Address *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Phone Number *</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="bg-[#0A0E27] border-cyan-500/30"
              disabled
            />
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Phone number cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">UPI ID (for payouts)</Label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={handleUpdateProfile}
            disabled={updateProfile.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-400" />
          Change Password
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Current Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-[#0A0E27] border-cyan-500/30 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">New Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="bg-[#0A0E27] border-cyan-500/30"
            />
            <p className="text-gray-400 text-sm">Minimum 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Confirm New Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="bg-[#0A0E27] border-cyan-500/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={handleUpdatePassword}
            disabled={updatePassword.isPending}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Lock className="w-4 h-4 mr-2" />
            {updatePassword.isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Notification Preferences
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-white font-semibold mb-4">Notification Channels</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">SMS Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Receive push notifications</p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Alert Preferences</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Earnings Alerts</p>
                    <p className="text-gray-400 text-sm">Notify when you earn commission</p>
                  </div>
                </div>
                <Switch
                  checked={earningsAlerts}
                  onCheckedChange={setEarningsAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-white font-medium">Payout Alerts</p>
                    <p className="text-gray-400 text-sm">Notify about payout status updates</p>
                  </div>
                </div>
                <Switch
                  checked={payoutAlerts}
                  onCheckedChange={setPayoutAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium">Referral Alerts</p>
                    <p className="text-gray-400 text-sm">Notify when someone signs up</p>
                  </div>
                </div>
                <Switch
                  checked={referralAlerts}
                  onCheckedChange={setReferralAlerts}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={handleUpdatePreferences}
            disabled={updatePreferences.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold text-white">{settings?.stats.totalReferrals || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-white">
                ₹{(settings?.stats.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Account Status</p>
              <Badge variant="success" className="mt-1">Verified</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}