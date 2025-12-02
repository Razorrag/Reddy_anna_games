import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserProfile } from '@/hooks/queries/user/useUserProfile';
import { useUpdateProfile } from '@/hooks/mutations/user/useUpdateProfile';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const { data: profile, isLoading } = useUserProfile(user?.id || '');
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Initialize form data when profile loads
  if (profile && !isEditing && formData.name === '') {
    setFormData({
      name: profile.name,
      email: profile.email || '',
      phone: profile.phone,
    });
  }

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email || '',
        phone: profile.phone,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email || '',
        phone: profile.phone,
      });
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        data: {
          name: formData.name,
          email: formData.email || null,
        },
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
    toast.info('Logged out successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="success" className="gap-1">
        <Shield className="w-3 h-3" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <Shield className="w-3 h-3" />
        Not Verified
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/game')}
                className="text-white hover:text-[#FFD700]"
              >
                ← Back to Game
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Profile</h1>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:text-red-400 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-[#FFD700]/30 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                  <User className="w-12 h-12 text-[#0A0E27]" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  {getStatusBadge(profile.status)}
                  {getVerificationBadge(profile.isVerified)}
                </div>
                <p className="text-gray-400">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button
                  variant="gold"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6"
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Edit Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-400">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    disabled
                    className="mt-1 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="gold"
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={updateProfile.isPending}
                    className="gap-2 text-white hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Account Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6"
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFD700] mb-2">
                  {profile.statistics?.gamesPlayed || 0}
                </div>
                <div className="text-gray-400 text-sm">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00F5FF] mb-2">
                  {profile.statistics?.gamesWon || 0}
                </div>
                <div className="text-gray-400 text-sm">Games Won</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {profile.statistics?.gamesPlayed
                    ? ((profile.statistics.gamesWon / profile.statistics.gamesPlayed) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card
            className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 cursor-pointer hover:border-[#FFD700] transition-colors"
            onClick={() => setLocation('/user/wallet')}
          >
            <h4 className="text-lg font-semibold text-white mb-2">Wallet</h4>
            <p className="text-gray-400 text-sm">Manage your balance and transactions</p>
          </Card>

          <Card
            className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 cursor-pointer hover:border-[#FFD700] transition-colors"
            onClick={() => setLocation('/user/referrals')}
          >
            <h4 className="text-lg font-semibold text-white mb-2">Referrals</h4>
            <p className="text-gray-400 text-sm">Invite friends and earn rewards</p>
          </Card>

          <Card
            className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 cursor-pointer hover:border-[#FFD700] transition-colors"
            onClick={() => setLocation('/user/bonuses')}
          >
            <h4 className="text-lg font-semibold text-white mb-2">Bonuses</h4>
            <p className="text-gray-400 text-sm">View your active bonuses</p>
          </Card>

          <Card
            className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 cursor-pointer hover:border-[#FFD700] transition-colors"
            onClick={() => setLocation('/user/settings')}
          >
            <h4 className="text-lg font-semibold text-white mb-2">Settings</h4>
            <p className="text-gray-400 text-sm">Manage your account preferences</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}