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
    <div className="min-h-screen bg-[#0A0E27] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1E40AF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="bg-[#1A1F3A]/80 backdrop-blur-md border-b border-[#FFD700]/20 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/game')}
                className="text-white hover:text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                ← Back to Game
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] drop-shadow-sm">
                My Profile
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl group-hover:bg-[#FFD700]/10 transition-all"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-glow-gold border-4 border-[#0A0E27]">
                  <User className="w-16 h-16 text-[#0A0E27]" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                  {getStatusBadge(profile.status)}
                  {getVerificationBadge(profile.isVerified)}
                </div>
                <p className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-6 flex-wrap text-sm text-gray-300 bg-[#0A0E27]/50 p-4 rounded-xl border border-[#FFD700]/10">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FFD700]" />
                    {profile.phone}
                  </span>
                  {profile.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#FFD700]" />
                      {profile.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button
                  variant="premium-gold"
                  onClick={handleEdit}
                  className="gap-2 shadow-lg"
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
            className="mt-8"
          >
            <Card className="bg-[#1A1F3A]/80 backdrop-blur-md border border-[#FFD700]/30 p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-[#FFD700] mb-6 flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                Edit Information
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white font-medium mb-2 block">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0A0E27] border-[#FFD700]/30 text-white h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white font-medium mb-2 block">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[#0A0E27] border-[#FFD700]/30 text-white h-12"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-400 font-medium mb-2 block">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    disabled
                    className="bg-[#0A0E27]/50 border-[#FFD700]/10 text-gray-400 cursor-not-allowed h-12"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Phone number cannot be changed for security reasons
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-[#FFD700]/10">
                  <Button
                    variant="premium-gold"
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="gap-2 min-w-[140px]"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={updateProfile.isPending}
                    className="gap-2 text-gray-400 hover:text-white"
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
          className="mt-8"
        >
          <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-8 border-l-4 border-[#FFD700] pl-4">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-[#0A0E27]/50 rounded-2xl border border-[#FFD700]/10">
                <div className="text-4xl font-black text-[#FFD700] mb-2 drop-shadow-md">
                  {profile.statistics?.gamesPlayed || 0}
                </div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-wider">Games Played</div>
              </div>
              <div className="text-center p-6 bg-[#0A0E27]/50 rounded-2xl border border-[#FFD700]/10">
                <div className="text-4xl font-black text-[#00F5FF] mb-2 drop-shadow-md">
                  {profile.statistics?.gamesWon || 0}
                </div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-wider">Games Won</div>
              </div>
              <div className="text-center p-6 bg-[#0A0E27]/50 rounded-2xl border border-[#FFD700]/10">
                <div className="text-4xl font-black text-white mb-2 drop-shadow-md">
                  {profile.statistics?.gamesPlayed
                    ? ((profile.statistics.gamesWon / profile.statistics.gamesPlayed) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-wider">Win Rate</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[
            { title: 'Wallet', desc: 'Manage your balance and transactions', path: '/user/wallet' },
            { title: 'Referrals', desc: 'Invite friends and earn rewards', path: '/user/referrals' },
            { title: 'Bonuses', desc: 'View your active bonuses', path: '/user/bonuses' },
            { title: 'Settings', desc: 'Manage your account preferences', path: '/user/settings' }
          ].map((item) => (
            <Card
              key={item.title}
              className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 cursor-pointer hover:border-[#FFD700] hover:bg-[#1A1F3A]/80 transition-all hover:-translate-y-1 group"
              onClick={() => setLocation(item.path)}
            >
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}