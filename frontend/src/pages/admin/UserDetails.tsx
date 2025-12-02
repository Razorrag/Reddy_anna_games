import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Ban, CheckCircle, XCircle, Trash2, Key, Mail, Phone, Calendar, Wallet, TrendingUp, Users, Award, MessageSquare, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUserDetailsQuery } from '@/hooks/queries/useUserDetailsQuery';
import { useUpdateUserMutation } from '@/hooks/mutations/useUpdateUserMutation';
import { useSuspendUserMutation } from '@/hooks/mutations/useSuspendUserMutation';
import { useBanUserMutation } from '@/hooks/mutations/useBanUserMutation';
import { useVerifyUserMutation } from '@/hooks/mutations/useVerifyUserMutation';
import { useDeleteUserMutation } from '@/hooks/mutations/useDeleteUserMutation';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EditableFields {
  full_name: string;
  email: string;
  balance: number;
  bonus_balance: number;
}

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditableFields | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showActionDialog, setShowActionDialog] = useState<'suspend' | 'ban' | 'delete' | null>(null);

  const { data: user, isLoading, refetch } = useUserDetailsQuery(userId!);
  const updateUserMutation = useUpdateUserMutation();
  const suspendMutation = useSuspendUserMutation();
  const banMutation = useBanUserMutation();
  const verifyMutation = useVerifyUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const handleEdit = () => {
    if (user) {
      setEditFields({
        full_name: user.full_name || '',
        email: user.email || '',
        balance: user.balance,
        bonus_balance: user.bonus_balance,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editFields || !userId) return;

    try {
      await updateUserMutation.mutateAsync({
        userId,
        data: editFields,
      });
      toast.success('User updated successfully');
      setIsEditing(false);
      setEditFields(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFields(null);
  };

  const handleSuspend = async () => {
    if (!userId || !actionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await suspendMutation.mutateAsync({
        userId,
        reason: actionReason,
      });
      toast.success('User suspended successfully');
      setShowActionDialog(null);
      setActionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend user');
    }
  };

  const handleBan = async () => {
    if (!userId || !actionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await banMutation.mutateAsync({
        userId,
        reason: actionReason,
      });
      toast.success('User banned successfully');
      setShowActionDialog(null);
      setActionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
    }
  };

  const handleActivate = async () => {
    if (!userId) return;

    try {
      await updateUserMutation.mutateAsync({
        userId,
        data: { status: 'active' },
      });
      toast.success('User activated successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user');
    }
  };

  const handleVerify = async () => {
    if (!userId) return;

    try {
      await verifyMutation.mutateAsync({ userId });
      toast.success('User verified successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify user');
    }
  };

  const handleDelete = async () => {
    if (!userId || !actionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        userId,
        reason: actionReason,
      });
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">User not found</p>
          <Button onClick={() => navigate('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      suspended: 'warning',
      banned: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/users')}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">User Details</h1>
              <p className="text-gray-400">ID: {user.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-white/10 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="border-cyan-500/20 text-cyan-400"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {user.status === 'active' && (
                  <Button
                    onClick={() => setShowActionDialog('suspend')}
                    variant="outline"
                    className="border-yellow-500/20 text-yellow-400"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                )}
                {user.status !== 'banned' && (
                  <Button
                    onClick={() => setShowActionDialog('ban')}
                    variant="outline"
                    className="border-red-500/20 text-red-400"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Ban
                  </Button>
                )}
                {user.status !== 'active' && (
                  <Button
                    onClick={handleActivate}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
                {!user.is_verified && (
                  <Button
                    onClick={handleVerify}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                )}
                <Button
                  onClick={() => setShowActionDialog('delete')}
                  variant="outline"
                  className="border-red-500/20 text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Full Name</div>
                {isEditing ? (
                  <Input
                    value={editFields?.full_name || ''}
                    onChange={(e) => setEditFields(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="text-white text-lg">{user.full_name || 'Not provided'}</div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Phone Number</div>
                <div className="flex items-center gap-2 text-white text-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {user.phone}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Email</div>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editFields?.email || ''}
                    onChange={(e) => setEditFields(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-white text-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    {user.email || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Status</div>
                <div>{getStatusBadge(user.status)}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Verification</div>
                <Badge variant={user.is_verified ? 'success' : 'warning'}>
                  {user.is_verified ? 'VERIFIED' : 'NOT VERIFIED'}
                </Badge>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Main Balance</div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editFields?.balance || 0}
                    onChange={(e) => setEditFields(prev => prev ? { ...prev, balance: parseFloat(e.target.value) } : null)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-cyan-400 text-2xl font-bold">
                    <Wallet className="w-6 h-6" />
                    ₹{user.balance.toFixed(2)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Bonus Balance</div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editFields?.bonus_balance || 0}
                    onChange={(e) => setEditFields(prev => prev ? { ...prev, bonus_balance: parseFloat(e.target.value) } : null)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-amber-400 text-2xl font-bold">
                    <Award className="w-6 h-6" />
                    ₹{user.bonus_balance.toFixed(2)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Referral Code</div>
                <div className="text-white text-lg font-mono">{user.referral_code}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Referred By</div>
                <div className="text-white text-lg">
                  {user.referred_by ? (
                    <Button
                      onClick={() => navigate(`/admin/users/${user.referred_by}`)}
                      variant="link"
                      className="p-0 h-auto text-cyan-400"
                    >
                      View Referrer
                    </Button>
                  ) : (
                    'Direct signup'
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Joined</div>
                <div className="flex items-center gap-2 text-white text-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Bets', value: user.statistics?.total_bets || 0, icon: TrendingUp, color: 'cyan' },
            { label: 'Total Wagered', value: `₹${(user.statistics?.total_wagered || 0).toFixed(2)}`, icon: Wallet, color: 'blue' },
            { label: 'Total Won', value: `₹${(user.statistics?.total_won || 0).toFixed(2)}`, icon: Award, color: 'green' },
            { label: 'Referrals', value: user.statistics?.total_referrals || 0, icon: Users, color: 'amber' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Action Dialog */}
        {showActionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowActionDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0E27] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {showActionDialog === 'suspend' && 'Suspend User'}
                {showActionDialog === 'ban' && 'Ban User'}
                {showActionDialog === 'delete' && 'Delete User'}
              </h3>
              <p className="text-gray-400 mb-4">
                {showActionDialog === 'suspend' && 'This will temporarily suspend the user account.'}
                {showActionDialog === 'ban' && 'This will permanently ban the user account.'}
                {showActionDialog === 'delete' && 'This will permanently delete the user and all their data. This action cannot be undone.'}
              </p>
              <Textarea
                placeholder="Provide a reason..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="bg-white/5 border-white/10 text-white mb-4"
                rows={3}
              />
              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => {
                    setShowActionDialog(null);
                    setActionReason('');
                  }}
                  variant="outline"
                  className="border-white/10 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (showActionDialog === 'suspend') handleSuspend();
                    else if (showActionDialog === 'ban') handleBan();
                    else if (showActionDialog === 'delete') handleDelete();
                  }}
                  disabled={!actionReason.trim()}
                  className="bg-gradient-to-r from-red-500 to-red-600"
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}