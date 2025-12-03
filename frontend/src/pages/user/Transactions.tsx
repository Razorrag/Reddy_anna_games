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

  // Safe access to the transactions array
  const transactionList = transactions?.transactions || [];

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
          <Badge variant="success" className="gap-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/50">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'failed':
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50">
            <XCircle className="w-3 h-3" />
            {status === 'failed' ? 'Failed' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, React.ReactNode> = {
      deposit: <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Deposit</Badge>,
      withdrawal: <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Withdrawal</Badge>,
      bet: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Bet</Badge>,
      win: <Badge className="bg-premium-gold text-[#0A0E27] font-bold border-none">Win</Badge>,
      bonus: <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Bonus</Badge>,
      commission: <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/50">Commission</Badge>,
    };
    return badges[type] || <Badge>{type}</Badge>;
  };

  const handleExportCSV = () => {
    if (transactionList.length === 0) return;

    const headers = ['Date', 'Type', 'Amount', 'Status', 'Balance After', 'Description'];
    const rows = transactionList.map((t: any) => [
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
        <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
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
                onClick={() => setLocation('/user/wallet')}
                className="text-white hover:text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                ← Back
              </Button>
              <div className="p-2 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/20">
                <IndianRupee className="w-6 h-6 text-[#FFD700]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] drop-shadow-sm">
                Transaction History
              </h1>
            </div>
            <Button
              variant="premium-gold"
              onClick={handleExportCSV}
              disabled={transactionList.length === 0}
              className="gap-2 shadow-glow-gold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6 border-b border-[#FFD700]/10 pb-4">
              <Filter className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Filter Transactions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-[#FFD700] font-bold mb-2 block uppercase tracking-wide">Transaction Type</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType)}>
                  <SelectTrigger className="bg-[#0A0E27] border-[#FFD700]/30 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F3A] border-[#FFD700]/30 text-white">
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
                <label className="text-sm text-[#FFD700] font-bold mb-2 block uppercase tracking-wide">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus)}>
                  <SelectTrigger className="bg-[#0A0E27] border-[#FFD700]/30 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F3A] border-[#FFD700]/30 text-white">
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
          <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 overflow-hidden shadow-2xl">
            {transactionList.length === 0 ? (
              <div className="p-16 text-center bg-[#0A0E27]/30">
                <div className="w-24 h-24 rounded-full bg-[#FFD700]/5 flex items-center justify-center mx-auto mb-6 border border-[#FFD700]/10">
                  <Clock className="w-12 h-12 text-[#FFD700]/30" />
                </div>
                <p className="text-gray-300 text-xl font-bold mb-2">No transactions found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your transaction history will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#0A0E27]/80">
                    <TableRow className="border-[#FFD700]/20 hover:bg-transparent">
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Date & Time</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Balance After</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionList.map((transaction: any) => (
                      <TableRow
                        key={transaction.id}
                        className="border-[#FFD700]/10 hover:bg-[#FFD700]/5 transition-colors"
                      >
                        <TableCell className="text-white">
                          <div className="flex flex-col">
                            <span className="font-bold">{format(new Date(transaction.createdAt), 'MMM dd, yyyy')}</span>
                            <span className="text-xs text-gray-400 font-mono">
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
                          <div className="flex items-center gap-1 font-bold text-lg">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
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
                        <TableCell className="text-white font-semibold">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
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
        {transactionList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all shadow-lg">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Transactions</p>
              <p className="text-3xl font-black text-white">{transactionList.length}</p>
            </Card>
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all shadow-lg">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Deposits</p>
              <p className="text-2xl font-black text-green-400 flex items-center gap-1">
                <span className="text-lg text-green-400/50">₹</span>
                {transactionList
                  .filter((t: any) => t.type === 'deposit' && t.status === 'completed')
                  .reduce((sum: number, t: any) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </Card>
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all shadow-lg">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Withdrawals</p>
              <p className="text-2xl font-black text-red-400 flex items-center gap-1">
                <span className="text-lg text-red-400/50">₹</span>
                {transactionList
                  .filter((t: any) => t.type === 'withdrawal' && t.status === 'completed')
                  .reduce((sum: number, t: any) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </Card>
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all shadow-lg">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Winnings</p>
              <p className="text-2xl font-black text-[#FFD700] flex items-center gap-1">
                <span className="text-lg text-[#FFD700]/50">₹</span>
                {transactionList
                  .filter((t: any) => t.type === 'win' && t.status === 'completed')
                  .reduce((sum: number, t: any) => sum + t.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}