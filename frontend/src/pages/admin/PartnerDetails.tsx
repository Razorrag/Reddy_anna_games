import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Edit, Ban, CheckCircle, XCircle, DollarSign, Users, TrendingUp, Calendar, Phone, Mail, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePartnerDetailsQuery } from '@/hooks/queries/usePartnerDetailsQuery';
import { useUpdatePartnerMutation } from '@/hooks/mutations/useUpdatePartnerMutation';
import { useSuspendPartnerMutation } from '@/hooks/mutations/useSuspendPartnerMutation';
import { useBanPartnerMutation } from '@/hooks/mutations/useBanPartnerMutation';
import { useProcessPayoutMutation } from '@/hooks/mutations/useProcessPayoutMutation';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EditableFields {
  full_name: string;
  email: string;
  commission_rate: number;
}

export default function PartnerDetails() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditableFields | null>(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const { data: partner, isLoading, refetch } = usePartnerDetailsQuery(partnerId!);
  const updateMutation = useUpdatePartnerMutation();
  const suspendMutation = useSuspendPartnerMutation();
  const banMutation = useBanPartnerMutation();
  const payoutMutation = useProcessPayoutMutation();

  const handleEdit = () => {
    if (partner) {
      setEditFields({
        full_name: partner.full_name || '',
        email: partner.email || '',
        commission_rate: partner.commission_rate || 2,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editFields || !partnerId) return;

    try {
      await updateMutation.mutateAsync({
        partnerId,
        data: editFields,
      });
      toast.success('Partner updated successfully');
      setIsEditing(false);
      setEditFields(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update partner');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFields(null);
  };

  const handleSuspend = async () => {
    if (!partnerId) return;

    try {
      await suspendMutation.mutateAsync({ partnerId });
      toast.success('Partner suspended successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend partner');
    }
  };

  const handleBan = async () => {
    if (!partnerId) return;

    try {
      await banMutation.mutateAsync({ partnerId });
      toast.success('Partner banned successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban partner');
    }
  };

  const handleActivate = async () => {
    if (!partnerId) return;

    try {
      await updateMutation.mutateAsync({
        partnerId,
        data: { status: 'active' },
      });
      toast.success('Partner activated successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate partner');
    }
  };

  const handlePayout = async () => {
    if (!partnerId || !payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error('Please enter valid payout amount');
      return;
    }

    try {
      await payoutMutation.mutateAsync({
        partnerId,
        amount: parseFloat(payoutAmount),
        notes: payoutNotes,
      });
      toast.success('Payout processed successfully');
      setShowPayoutDialog(false);
      setPayoutAmount('');
      setPayoutNotes('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Partner not found</p>
          <Button onClick={() => setLocation('/admin/partners')}>
            Back to Partners
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
              onClick={() => setLocation('/admin/partners')}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Partner Details</h1>
              <p className="text-gray-400">ID: {partner.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
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
                {partner.status === 'active' && (
                  <>
                    <Button
                      onClick={() => setShowPayoutDialog(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Process Payout
                    </Button>
                    <Button
                      onClick={handleSuspend}
                      variant="outline"
                      className="border-yellow-500/20 text-yellow-400"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend
                    </Button>
                  </>
                )}
                {partner.status !== 'banned' && (
                  <Button
                    onClick={handleBan}
                    variant="outline"
                    className="border-red-500/20 text-red-400"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Ban
                  </Button>
                )}
                {partner.status !== 'active' && (
                  <Button
                    onClick={handleActivate}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
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
                  <div className="text-white text-lg">{partner.full_name || 'Not provided'}</div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Phone Number</div>
                <div className="flex items-center gap-2 text-white text-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {partner.phone}
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
                    {partner.email || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Status</div>
                <div>{getStatusBadge(partner.status)}</div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Commission Rate</div>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editFields?.commission_rate || 0}
                    onChange={(e) => setEditFields(prev => prev ? { ...prev, commission_rate: parseFloat(e.target.value) } : null)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="text-cyan-400 text-2xl font-bold">
                    {partner.commission_rate}%
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Total Earnings</div>
                <div className="flex items-center gap-2 text-green-400 text-2xl font-bold">
                  <DollarSign className="w-6 h-6" />
                  ₹{(partner.stats?.total_earnings || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Pending Earnings</div>
                <div className="flex items-center gap-2 text-amber-400 text-2xl font-bold">
                  <DollarSign className="w-6 h-6" />
                  ₹{(partner.stats?.pending_earnings || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Joined</div>
                <div className="flex items-center gap-2 text-white text-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  {format(new Date(partner.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Referrals', value: partner.stats?.total_referrals || 0, icon: Users, color: 'cyan' },
            { label: 'Active Users', value: partner.stats?.active_referrals || 0, icon: Users, color: 'green' },
            { label: 'Total Wagered', value: `₹${(partner.stats?.total_wagered || 0).toFixed(2)}`, icon: TrendingUp, color: 'blue' },
            { label: 'Paid Out', value: `₹${(partner.stats?.total_paid_out || 0).toFixed(2)}`, icon: DollarSign, color: 'amber' },
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
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Referred Users */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Referred Users</h3>
          {partner.referred_users && partner.referred_users.length > 0 ? (
            <div className="space-y-2">
              {partner.referred_users.slice(0, 10).map((user: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.full_name || user.phone}</div>
                      <div className="text-xs text-gray-400">
                        Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      ₹{(user.total_wagered || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Total Wagered</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No referred users yet
            </div>
          )}
        </div>

        {/* Earnings History */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Earnings</h3>
          {partner.earnings_history && partner.earnings_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {partner.earnings_history.slice(0, 10).map((earning: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {format(new Date(earning.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{earning.type}</td>
                      <td className="px-4 py-3 text-right text-green-400 font-bold">
                        ₹{earning.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={earning.status === 'paid' ? 'success' : 'warning'}>
                          {earning.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No earnings history yet
            </div>
          )}
        </div>

        {/* Payout Dialog */}
        {showPayoutDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowPayoutDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0E27] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Process Payout</h3>
              
              <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="text-sm text-amber-400">
                  Available for payout: ₹{(partner.stats?.pending_earnings || 0).toFixed(2)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Payout Amount *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes..."
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setShowPayoutDialog(false)}
                  variant="outline"
                  className="border-white/10 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayout}
                  disabled={!payoutAmount || payoutMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  Process Payout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}