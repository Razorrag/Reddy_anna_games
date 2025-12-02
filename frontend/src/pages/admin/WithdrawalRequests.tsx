import { useState } from 'react';
import { Search, Download, RefreshCw, Check, X, Eye, Clock, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWithdrawalRequestsQuery } from '@/hooks/queries/useWithdrawalRequestsQuery';
import { useApproveWithdrawalMutation } from '@/hooks/mutations/useApproveWithdrawalMutation';
import { useRejectWithdrawalMutation } from '@/hooks/mutations/useRejectWithdrawalMutation';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WithdrawalFilters {
  search: string;
  status: 'all' | 'pending' | 'processing' | 'completed' | 'rejected';
  dateFrom: string;
  dateTo: string;
  sortBy: 'created_desc' | 'created_asc' | 'amount_desc' | 'amount_asc';
  page: number;
  limit: number;
}

interface ActionDialog {
  requestId: string;
  action: 'approve' | 'reject';
  transactionId?: string;
  notes?: string;
}

export default function WithdrawalRequests() {
  const [filters, setFilters] = useState<WithdrawalFilters>({
    search: '',
    status: 'pending',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_desc',
    page: 1,
    limit: 20,
  });
  const [actionDialog, setActionDialog] = useState<ActionDialog | null>(null);

  const { data, isLoading, refetch } = useWithdrawalRequestsQuery(filters);
  const approveMutation = useApproveWithdrawalMutation();
  const rejectMutation = useRejectWithdrawalMutation();

  const requests = data?.requests || [];
  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  const handleFilterChange = (key: keyof WithdrawalFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCopyUPI = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard');
  };

  const handleApprove = async () => {
    if (!actionDialog || !actionDialog.transactionId?.trim()) {
      toast.error('Please provide UPI transaction ID');
      return;
    }

    try {
      await approveMutation.mutateAsync({
        requestId: actionDialog.requestId,
        transactionId: actionDialog.transactionId,
        notes: actionDialog.notes,
      });
      toast.success('Withdrawal approved and processed');
      setActionDialog(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async () => {
    if (!actionDialog || !actionDialog.notes?.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        requestId: actionDialog.requestId,
        reason: actionDialog.notes,
      });
      toast.success('Withdrawal rejected, amount refunded');
      setActionDialog(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject withdrawal');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'User', 'Phone', 'Amount', 'UPI ID', 'Status', 'Created', 'Processed'].join(','),
      ...requests.map((r: any) => [
        r.id,
        r.user?.full_name || r.user?.phone || '-',
        r.user?.phone || '-',
        r.amount,
        r.upi_id || '-',
        r.status,
        format(new Date(r.created_at), 'yyyy-MM-dd HH:mm'),
        r.processed_at ? format(new Date(r.processed_at), 'yyyy-MM-dd HH:mm') : '-',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawals-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      processing: 'default',
      completed: 'success',
      rejected: 'destructive',
    };
    const icons: Record<string, any> = {
      pending: Clock,
      processing: RefreshCw,
      completed: CheckCircle2,
      rejected: XCircle,
    };
    const Icon = icons[status];
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {status.toUpperCase()}
      </Badge>
    );
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
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Withdrawal Requests</h1>
            <p className="text-gray-400">Process user withdrawal requests to UPI</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Requests', value: data?.total || 0, color: 'cyan' },
            { label: 'Pending', value: data?.stats?.pending || 0, color: 'yellow' },
            { label: 'Processing', value: data?.stats?.processing || 0, color: 'blue' },
            { label: 'Completed', value: data?.stats?.completed || 0, color: 'green' },
            { label: 'Rejected', value: data?.stats?.rejected || 0, color: 'red' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {stat.value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by user, phone, or UPI ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="From Date"
            />

            <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-400 mb-2">No withdrawal requests found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">UPI ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Created</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {requests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                        {request.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">
                            {request.user?.full_name || 'No Name'}
                          </div>
                          <div className="text-xs text-gray-400">{request.user?.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-cyan-400 font-bold text-lg">
                          ₹{request.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{request.upi_id}</span>
                          <Button
                            onClick={() => handleCopyUPI(request.upi_id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {format(new Date(request.created_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {request.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setActionDialog({
                                requestId: request.id,
                                action: 'approve',
                                transactionId: '',
                                notes: '',
                              })}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => setActionDialog({
                                requestId: request.id,
                                action: 'reject',
                                notes: '',
                              })}
                              size="sm"
                              variant="outline"
                              className="border-red-500/20 text-red-400"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data?.total || 0)} of {data?.total || 0} requests
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={filters.page === 1}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                Previous
              </Button>
              <Button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page === totalPages}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Action Dialog */}
        {actionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setActionDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0E27] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {actionDialog.action === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
              </h3>

              {actionDialog.action === 'approve' ? (
                <>
                  <p className="text-gray-400 mb-4 text-sm">
                    After approving, you must manually transfer the amount via UPI and provide the transaction ID.
                  </p>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">
                        UPI Transaction ID *
                      </label>
                      <Input
                        placeholder="Enter transaction ID after payment"
                        value={actionDialog.transactionId || ''}
                        onChange={(e) => setActionDialog({ ...actionDialog, transactionId: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">
                        Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="Add notes..."
                        value={actionDialog.notes || ''}
                        onChange={(e) => setActionDialog({ ...actionDialog, notes: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <Button
                      onClick={() => setActionDialog(null)}
                      variant="outline"
                      className="border-white/10 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={!actionDialog.transactionId?.trim() || approveMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      Confirm Payment
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-400 mb-4 text-sm">
                    The withdrawal amount will be refunded to the user's wallet.
                  </p>
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Rejection Reason *
                    </label>
                    <Textarea
                      placeholder="Provide reason for rejection..."
                      value={actionDialog.notes || ''}
                      onChange={(e) => setActionDialog({ ...actionDialog, notes: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <Button
                      onClick={() => setActionDialog(null)}
                      variant="outline"
                      className="border-white/10 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={!actionDialog.notes?.trim() || rejectMutation.isPending}
                      className="bg-gradient-to-r from-red-500 to-red-600"
                    >
                      Reject & Refund
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}