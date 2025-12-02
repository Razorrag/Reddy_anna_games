import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserTransactions } from '@/hooks/queries/user/useUserTransactions';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'commission';
type TransactionStatus = 'all' | 'pending' | 'completed' | 'failed' | 'rejected';

export default function Transactions() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>('all');

  const { data: transactions, isLoading } = useUserTransactions(user?.id || '', {
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'bonus':
      case 'commission':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
      case 'bet':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'failed':
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            {status === 'failed' ? 'Failed' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      deposit: <Badge variant="success">Deposit</Badge>,
      withdrawal: <Badge variant="destructive">Withdrawal</Badge>,
      bet: <Badge variant="secondary">Bet</Badge>,
      win: <Badge variant="success">Win</Badge>,
      bonus: <Badge variant="neon">Bonus</Badge>,
      commission: <Badge variant="gold">Commission</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>{type}</Badge>;
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Amount', 'Status', 'Balance After', 'Description'];
    const rows = transactions.map((t) => [
      format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      t.type,
      t.amount,
      t.status,
      t.balanceAfter,
      t.description || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading transactions...</div>
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
                onClick={() => setLocation('/user/wallet')}
                className="text-white hover:text-[#FFD700]"
              >
                ← Back
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Transaction History</h1>
            </div>
            <Button
              variant="gold"
              onClick={handleExportCSV}
              disabled={!transactions || transactions.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Transaction Type</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="bet">Bets</SelectItem>
                    <SelectItem value="win">Wins</SelectItem>
                    <SelectItem value="bonus">Bonuses</SelectItem>
                    <SelectItem value="commission">Commissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 overflow-hidden">
            {!transactions || transactions.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No transactions found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your transaction history will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#FFD700]/20 hover:bg-[#2a2f4a]/50">
                      <TableHead className="text-[#FFD700]">Date & Time</TableHead>
                      <TableHead className="text-[#FFD700]">Type</TableHead>
                      <TableHead className="text-[#FFD700]">Amount</TableHead>
                      <TableHead className="text-[#FFD700]">Status</TableHead>
                      <TableHead className="text-[#FFD700]">Balance After</TableHead>
                      <TableHead className="text-[#FFD700]">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-[#FFD700]/10 hover:bg-[#2a2f4a]/50"
                      >
                        <TableCell className="text-white">
                          <div className="flex flex-col">
                            <span>{format(new Date(transaction.createdAt), 'MMM dd, yyyy')}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(transaction.createdAt), 'hh:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            {getTypeBadge(transaction.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold">
                            <IndianRupee className="w-4 h-4" />
                            <span
                              className={
                                ['deposit', 'win', 'bonus', 'commission'].includes(transaction.type)
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {['deposit', 'win', 'bonus', 'commission'].includes(transaction.type) ? '+' : '-'}
                              {transaction.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {transaction.balanceAfter.toLocaleString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm max-w-xs truncate">
                          {transaction.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Summary Stats */}
        {transactions && transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{transactions.length}</p>
            </Card>
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Total Deposits</p>
              <p className="text-2xl font-bold text-green-500 flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {transactions
                  .filter((t) => t.type === 'deposit' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </Card>
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-500 flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {transactions
                  .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </Card>
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Total Winnings</p>
              <p className="text-2xl font-bold text-[#FFD700] flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {transactions
                  .filter((t) => t.type === 'win' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}