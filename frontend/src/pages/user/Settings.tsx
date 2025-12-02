import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Save,
  Shield,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useChangePassword } from '@/hooks/mutations/user/useChangePassword';
import { useUpdateNotificationSettings } from '@/hooks/mutations/user/useUpdateNotificationSettings';
import { toast } from 'sonner';

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const changePassword = useChangePassword();
  const updateNotifications = useUpdateNotificationSettings();

  // Password Change State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    gameUpdates: true,
    promotions: true,
    winnings: true,
    deposits: true,
    withdrawals: true,
  });

  const handlePasswordChange = async () => {
    if (!user?.id) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword.mutateAsync({
        userId: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleNotificationUpdate = async () => {
    if (!user?.id) return;

    try {
      await updateNotifications.mutateAsync({
        userId: user.id,
        settings: notifications,
      });

      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/user/profile')}
              className="text-white hover:text-[#FFD700]"
            >
              ← Back
            </Button>
            <SettingsIcon className="w-8 h-8 text-[#FFD700]" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a1f3a] mb-8">
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={user?.name || ''}
                      disabled
                      className="mt-1 opacity-75"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      To change your name, go to Profile page
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={user?.phone || ''}
                      disabled
                      className="mt-1 opacity-75"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number cannot be changed for security reasons
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || 'Not set'}
                      disabled
                      className="mt-1 opacity-75"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      To update email, go to Profile page
                    </p>
                  </div>

                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Account Status
                    </Label>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-500 text-sm">
                        {user?.status || 'Active'}
                      </div>
                      <div className="px-3 py-1 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded text-[#00F5FF] text-sm">
                        {user?.isVerified ? 'Verified' : 'Not Verified'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="text-white">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="text-white">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    onClick={handlePasswordChange}
                    disabled={
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      changePassword.isPending
                    }
                    className="w-full gap-2 mt-6"
                  >
                    <Save className="w-4 h-4" />
                    {changePassword.isPending ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  {/* Notification Channels */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Channels</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-[#FFD700]" />
                          <div>
                            <p className="text-white font-medium">Email Notifications</p>
                            <p className="text-xs text-gray-400">Receive updates via email</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-[#FFD700]" />
                          <div>
                            <p className="text-white font-medium">SMS Notifications</p>
                            <p className="text-xs text-gray-400">Receive updates via SMS</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.smsNotifications}
                          onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Notification Types</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <span className="text-white">Game Updates</span>
                        <input
                          type="checkbox"
                          checked={notifications.gameUpdates}
                          onChange={(e) => setNotifications({ ...notifications, gameUpdates: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <span className="text-white">Promotions & Offers</span>
                        <input
                          type="checkbox"
                          checked={notifications.promotions}
                          onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <span className="text-white">Winnings & Payouts</span>
                        <input
                          type="checkbox"
                          checked={notifications.winnings}
                          onChange={(e) => setNotifications({ ...notifications, winnings: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <span className="text-white">Deposit Confirmations</span>
                        <input
                          type="checkbox"
                          checked={notifications.deposits}
                          onChange={(e) => setNotifications({ ...notifications, deposits: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg cursor-pointer">
                        <span className="text-white">Withdrawal Updates</span>
                        <input
                          type="checkbox"
                          checked={notifications.withdrawals}
                          onChange={(e) => setNotifications({ ...notifications, withdrawals: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </label>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    onClick={handleNotificationUpdate}
                    disabled={updateNotifications.isPending}
                    className="w-full gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateNotifications.isPending ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}