import { useState } from 'react';
import { Search, Download, RefreshCw, Eye, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaymentHistoryQuery } from '@/hooks/queries/usePaymentHistoryQuery';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PaymentFilters {
  search: string;
  type: 'all' | 'deposit' | 'withdrawal';
  status: 'all' | 'pending' | 'approved' | 'completed' | 'rejected';
  dateFrom: string;
  dateTo: string;
  sortBy: 'created_desc' | 'created_asc' | 'amount_desc' | 'amount_asc';
  page: number;
  limit: number;
}

export default function PaymentHistory() {
  const [filters, setFilters] = useState<PaymentFilters>({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_desc',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, refetch } = usePaymentHistoryQuery(filters);

  const payments = data?.payments || [];
  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Type', 'User', 'Phone', 'Amount', 'Status', 'Transaction ID', 'Created', 'Processed'].join(','),
      ...payments.map((p: any) => [
        p.id,
        p.type,
        p.user?.full_name || p.user?.phone || '-',
        p.user?.phone || '-',
        p.amount,
        p.status,
        p.transaction_id || '-',
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
        p.processed_at ? format(new Date(p.processed_at), 'yyyy-MM-dd HH:mm') : '-',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeBadge = (type: string) => {
    return type === 'deposit' ? (
      <Badge variant="success" className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        DEPOSIT
      </Badge>
    ) : (
      <Badge variant="default" className="flex items-center gap-1">
        <TrendingDown className="w-3 h-3" />
        WITHDRAWAL
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      approved: 'success',
      completed: 'success',
      rejected: 'destructive',
      processing: 'default',
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
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment History</h1>
            <p className="text-gray-400">Complete history of all deposits and withdrawals</p>
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
            { label: 'Total Payments', value: data?.total || 0, icon: DollarSign, color: 'cyan' },
            { label: 'Total Deposits', value: `₹${(data?.stats?.total_deposits || 0).toFixed(2)}`, icon: TrendingUp, color: 'green' },
            { label: 'Total Withdrawals', value: `₹${(data?.stats?.total_withdrawals || 0).toFixed(2)}`, icon: TrendingDown, color: 'blue' },
            { label: 'Net Amount', value: `₹${((data?.stats?.total_deposits || 0) - (data?.stats?.total_withdrawals || 0)).toFixed(2)}`, icon: DollarSign, color: 'amber' },
            { label: 'Pending', value: data?.stats?.pending || 0, icon: RefreshCw, color: 'yellow' },
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
              <div className={`text-xl font-bold text-${stat.color}-400`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by user, phone, or transaction ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="From"
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

        {/* Payments Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-400 mb-2">No payment history found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Processed</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Processed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                        {payment.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">{getTypeBadge(payment.type)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">
                            {payment.user?.full_name || 'No Name'}
                          </div>
                          <div className="text-xs text-gray-400">{payment.user?.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`font-bold text-lg ${
                          payment.type === 'deposit' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {payment.type === 'deposit' ? '+' : '-'}₹{payment.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-mono text-sm">
                          {payment.transaction_id || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {format(new Date(payment.created_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {payment.processed_at 
                          ? format(new Date(payment.processed_at), 'MMM dd, HH:mm')
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {payment.processed_by?.full_name || '-'}
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
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data?.total || 0)} of {data?.total || 0} payments
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => setFilters(prev => ({ ...prev, page }))}
                    variant={filters.page === page ? 'default' : 'outline'}
                    size="sm"
                    className={filters.page === page
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'border-white/10 text-white'
                    }
                  >
                    {page}
                  </Button>
                );
              })}
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

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Transactions</div>
              <div className="text-2xl font-bold text-cyan-400">{data?.total || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Success Rate</div>
              <div className="text-2xl font-bold text-green-400">
                {data?.stats?.success_rate || 0}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg Deposit</div>
              <div className="text-2xl font-bold text-amber-400">
                ₹{(data?.stats?.avg_deposit || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg Withdrawal</div>
              <div className="text-2xl font-bold text-blue-400">
                ₹{(data?.stats?.avg_withdrawal || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}