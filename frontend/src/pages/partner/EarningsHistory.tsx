import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  Calendar,
  Download,
  TrendingUp,
  Users,
  Gamepad2,
  Filter,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEarningsHistoryQuery } from '@/hooks/queries/useEarningsHistoryQuery';

type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
type EarningsType = 'all' | 'commission' | 'bonus' | 'referral';

export default function EarningsHistory() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [earningsType, setEarningsType] = useState<EarningsType>('all');
  const [page, setPage] = useState(1);

  const { data: earnings, isLoading } = useEarningsHistoryQuery({ timeRange, earningsType, page });

  const exportData = () => {
    if (!earnings?.transactions) return;
    
    const csvData = [
      ['Date', 'Type', 'Player', 'Amount', 'Rate', 'Status', 'Description'],
      ...earnings.transactions.map((t: any) => [
        t.date,
        t.type,
        t.playerName,
        t.amount,
        t.commissionRate,
        t.status,
        t.description
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-history-${timeRange}-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading earnings...</p>
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
            Earnings History
          </h1>
          <p className="text-gray-400 mt-1">
            Track your commission earnings and payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-40 bg-[#1a1f3a] border-cyan-500/30">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={exportData}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Earnings"
          value={`₹${(earnings?.summary.totalEarnings || 0).toLocaleString()}`}
          change={earnings?.summary.earningsChange || 0}
          icon={DollarSign}
          color="green"
        />
        <SummaryCard
          title="This Period"
          value={`₹${(earnings?.summary.periodEarnings || 0).toLocaleString()}`}
          change={earnings?.summary.periodChange || 0}
          icon={TrendingUp}
          color="cyan"
        />
        <SummaryCard
          title="Avg Per Player"
          value={`₹${(earnings?.summary.avgPerPlayer || 0).toLocaleString()}`}
          change={earnings?.summary.avgChange || 0}
          icon={Users}
          color="amber"
        />
        <SummaryCard
          title="Commission Rate"
          value={`${earnings?.summary.commissionRate || 2}%`}
          change={0}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings by Type */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            Earnings by Type
          </h3>

          <div className="space-y-4">
            {earnings?.breakdown.map((item: any, index: number) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{item.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">
                      ₹{item.amount.toLocaleString()}
                    </span>
                    <Badge variant="default">{item.percentage}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Monthly Trend
          </h3>

          <div className="space-y-3">
            {earnings?.monthlyTrend.map((month: any, index: number) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-[#0A0E27] rounded-lg border border-cyan-500/20"
              >
                <div>
                  <p className="text-white font-medium">{month.month}</p>
                  <p className="text-gray-400 text-sm">{month.transactions} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    ₹{month.earnings.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${
                    month.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {month.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{Math.abs(month.change)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-cyan-400" />
          <Select value={earningsType} onValueChange={(value) => setEarningsType(value as EarningsType)}>
            <SelectTrigger className="w-48 bg-[#0A0E27] border-cyan-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Earnings</SelectItem>
              <SelectItem value="commission">Commission Only</SelectItem>
              <SelectItem value="bonus">Bonus Only</SelectItem>
              <SelectItem value="referral">Referral Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          Transaction History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left text-gray-400 font-medium pb-4">Date</th>
                <th className="text-left text-gray-400 font-medium pb-4">Type</th>
                <th className="text-left text-gray-400 font-medium pb-4">Player</th>
                <th className="text-left text-gray-400 font-medium pb-4">Game Activity</th>
                <th className="text-left text-gray-400 font-medium pb-4">Rate</th>
                <th className="text-left text-gray-400 font-medium pb-4">Amount</th>
                <th className="text-left text-gray-400 font-medium pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings?.transactions.map((transaction: any, index: number) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-cyan-500/10 hover:bg-[#0A0E27] transition-colors"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {transaction.date}
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge variant={
                      transaction.type === 'commission' ? 'default' :
                      transaction.type === 'bonus' ? 'warning' :
                      'success'
                    }>
                      {transaction.type}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-white font-medium">{transaction.playerName}</p>
                      <p className="text-gray-400 text-sm">{transaction.playerPhone}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-white text-sm">{transaction.gameType}</p>
                        <p className="text-gray-400 text-xs">
                          Wagered: ₹{transaction.wagered.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge variant="default">{transaction.commissionRate}%</Badge>
                  </td>
                  <td className="py-4">
                    <p className="text-green-400 font-bold">
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4">
                    <Badge variant={
                      transaction.status === 'paid' ? 'success' :
                      transaction.status === 'pending' ? 'warning' :
                      'default'
                    }>
                      {transaction.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-cyan-500/30 bg-[#0A0E27]">
                <td colSpan={5} className="py-4 text-white font-bold">Total</td>
                <td className="py-4 text-green-400 font-bold text-lg">
                  ₹{(earnings?.totalAmount || 0).toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {(!earnings?.transactions || earnings.transactions.length === 0) && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg mb-2">No earnings yet</p>
              <p className="text-gray-500 text-sm">
                Your commission earnings will appear here as your referred players play games
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {earnings?.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-cyan-500/20">
            <p className="text-gray-400 text-sm">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, earnings.total)} of {earnings.total} transactions
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="border-cyan-500/30"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, earnings.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={page === pageNum ? 'bg-cyan-500' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === earnings.totalPages}
                className="border-cyan-500/30"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Top Earning Players */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Top Earning Players
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {earnings?.topPlayers.map((player: any, index: number) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0A0E27] rounded-lg p-4 border border-cyan-500/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{player.name}</p>
                    <p className="text-gray-400 text-xs">{player.games} games</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Wagered</span>
                  <span className="text-cyan-400">₹{player.wagered.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Your Earnings</span>
                  <span className="text-green-400 font-bold">
                    ₹{player.earnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    cyan: 'from-cyan-500 to-blue-600',
    amber: 'from-amber-500 to-orange-600',
    purple: 'from-purple-500 to-pink-600'
  };

  const TrendIcon = change >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {change !== 0 && (
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
}