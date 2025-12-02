import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Plus,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usePayoutRequestsQuery } from '@/hooks/queries/usePayoutRequestsQuery';
import { useCreatePayoutRequestMutation } from '@/hooks/mutations/useCreatePayoutRequestMutation';
import { useCancelPayoutRequestMutation } from '@/hooks/mutations/useCancelPayoutRequestMutation';
import { toast } from 'sonner';

export default function PayoutRequests() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: payouts, isLoading } = usePayoutRequestsQuery();
  const createRequest = useCreatePayoutRequestMutation();
  const cancelRequest = useCancelPayoutRequestMutation();

  const handleCreateRequest = async () => {
    if (!amount || parseFloat(amount) < (payouts?.minWithdrawal || 500)) {
      toast.error(`Minimum withdrawal amount is ₹${payouts?.minWithdrawal || 500}`);
      return;
    }

    if (parseFloat(amount) > (payouts?.availableBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    try {
      await createRequest.mutateAsync({
        amount: parseFloat(amount),
        upiId,
        notes
      });
      toast.success('Payout request created successfully');
      setShowNewRequest(false);
      setAmount('');
      setUpiId('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to create payout request');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest.mutateAsync(id);
      toast.success('Payout request cancelled');
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Payout Requests
          </h1>
          <p className="text-gray-400 mt-1">
            Request withdrawals and track payout status
          </p>
        </div>

        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Payout Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1f3a] border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Create Payout Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    ₹{(payouts?.availableBalance || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  Minimum withdrawal: ₹{payouts?.minWithdrawal || 500}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-[#0A0E27] border-cyan-500/30"
                  min={payouts?.minWithdrawal || 500}
                  max={payouts?.availableBalance || 0}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">UPI ID</Label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-[#0A0E27] border-cyan-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="bg-[#0A0E27] border-cyan-500/30"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCreateRequest}
                  disabled={createRequest.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {createRequest.isPending ? 'Creating...' : 'Create Request'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewRequest(false)}
                  className="border-cyan-500/30"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-green-400">
              ₹{(payouts?.availableBalance || 0).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Pending Payouts</p>
            <p className="text-3xl font-bold text-amber-400">
              ₹{(payouts?.pendingAmount || 0).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Paid Out</p>
            <p className="text-3xl font-bold text-cyan-400">
              ₹{(payouts?.totalPaidOut || 0).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Payout Requests List */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-400" />
          Recent Payout Requests
        </h3>

        <div className="space-y-4">
          {payouts?.requests.map((request: any, index: number) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#0A0E27] rounded-lg p-6 border border-cyan-500/20"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Request Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">
                        ₹{request.amount.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">Request #{request.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">UPI ID</p>
                      <p className="text-white font-mono">{request.upiId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Requested On</p>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="w-4 h-4" />
                        {request.requestedDate}
                      </div>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-sm mb-1">Notes</p>
                      <p className="text-gray-300 text-sm">{request.notes}</p>
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <Badge variant={
                    request.status === 'completed' ? 'success' :
                    request.status === 'pending' ? 'warning' :
                    request.status === 'processing' ? 'default' :
                    'destructive'
                  } className="text-base">
                    {request.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {request.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                    {request.status === 'rejected' && <X className="w-4 h-4 mr-1" />}
                    {request.status}
                  </Badge>

                  {request.status === 'completed' && (
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Processed On</p>
                      <p className="text-green-400 text-sm font-medium">
                        {request.processedDate}
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-red-400 text-sm font-medium mb-1">Rejection Reason</p>
                          <p className="text-gray-300 text-sm">{request.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(request.id)}
                      disabled={cancelRequest.isPending}
                      className="border-red-500/30 hover:border-red-500 text-red-400"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>

              {/* Processing Timeline */}
              {request.status === 'processing' && (
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                  <div className="flex items-center gap-2 text-cyan-400 text-sm">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Your request is being processed. Expected completion in 24-48 hours.</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {(!payouts?.requests || payouts.requests.length === 0) && (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg mb-2">No payout requests yet</p>
              <p className="text-gray-500 text-sm mb-4">
                Create your first payout request to withdraw your earnings
              </p>
              <Button
                onClick={() => setShowNewRequest(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Payout Information */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-cyan-400" />
          Payout Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-3">Withdrawal Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Minimum Withdrawal</span>
                <span className="text-white font-medium">₹{payouts?.minWithdrawal || 500}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Maximum Withdrawal</span>
                <span className="text-white font-medium">₹{payouts?.maxWithdrawal || 50000}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Processing Time</span>
                <span className="text-white font-medium">24-48 hours</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Important Notes</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Ensure your UPI ID is correct before submitting</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Payouts are processed within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>You can cancel pending requests anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Contact support for any payout issues</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-white">{payouts?.stats.totalRequests || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-cyan-400" />
          </div>
        </Card>

        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{payouts?.stats.completed || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Average Amount</p>
              <p className="text-2xl font-bold text-cyan-400">
                ₹{(payouts?.stats.avgAmount || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}