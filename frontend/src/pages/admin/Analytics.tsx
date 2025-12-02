import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  UserPlus,
  Gamepad2,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsQuery } from '@/hooks/queries/useAnalyticsQuery';

type TimeRange = 'today' | 'week' | 'month' | 'year';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
  color: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { data: analytics, isLoading } = useAnalyticsQuery(timeRange);

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value', 'Change'],
      ['Total Users', analytics.totalUsers, `${analytics.userGrowth}%`],
      ['Active Users', analytics.activeUsers, `${analytics.activeGrowth}%`],
      ['Total Revenue', analytics.totalRevenue, `${analytics.revenueGrowth}%`],
      ['Games Played', analytics.gamesPlayed, `${analytics.gamesGrowth}%`],
      ['Avg Bet', analytics.avgBet, `${analytics.avgBetGrowth}%`],
      ['Win Rate', `${analytics.winRate}%`, `${analytics.winRateChange}%`],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const metrics: MetricCardProps[] = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers.toLocaleString() || '0',
      change: analytics?.userGrowth || 0,
      icon: Users,
      trend: (analytics?.userGrowth || 0) >= 0 ? 'up' : 'down',
      color: 'cyan'
    },
    {
      title: 'Active Users',
      value: analytics?.activeUsers.toLocaleString() || '0',
      change: analytics?.activeGrowth || 0,
      icon: UserPlus,
      trend: (analytics?.activeGrowth || 0) >= 0 ? 'up' : 'down',
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: analytics?.revenueGrowth || 0,
      icon: DollarSign,
      trend: (analytics?.revenueGrowth || 0) >= 0 ? 'up' : 'down',
      color: 'gold'
    },
    {
      title: 'Games Played',
      value: analytics?.gamesPlayed.toLocaleString() || '0',
      change: analytics?.gamesGrowth || 0,
      icon: Gamepad2,
      trend: (analytics?.gamesGrowth || 0) >= 0 ? 'up' : 'down',
      color: 'purple'
    },
    {
      title: 'Average Bet',
      value: `₹${(analytics?.avgBet || 0).toLocaleString()}`,
      change: analytics?.avgBetGrowth || 0,
      icon: Target,
      trend: (analytics?.avgBetGrowth || 0) >= 0 ? 'up' : 'down',
      color: 'blue'
    },
    {
      title: 'Win Rate',
      value: `${analytics?.winRate || 0}%`,
      change: analytics?.winRateChange || 0,
      icon: TrendingUp,
      trend: (analytics?.winRateChange || 0) >= 0 ? 'up' : 'down',
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive platform insights and metrics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-40 bg-[#1a1f3a] border-cyan-500/30">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={exportData}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} index={index} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Revenue Trend
            </h3>
            <Badge variant="gold">
              {timeRange === 'today' ? 'Hourly' : 'Daily'}
            </Badge>
          </div>
          
          <RevenueChart data={analytics?.revenueChart || []} />
        </Card>

        {/* User Growth Chart */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              User Growth
            </h3>
            <Badge variant="success">
              +{analytics?.userGrowth || 0}%
            </Badge>
          </div>
          
          <UserGrowthChart data={analytics?.userGrowthChart || []} />
        </Card>

        {/* Game Activity */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
              Game Activity
            </h3>
            <Badge variant="default">
              {analytics?.gamesPlayed || 0} games
            </Badge>
          </div>
          
          <GameActivityChart data={analytics?.gameActivityChart || []} />
        </Card>

        {/* Bet Distribution */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              Bet Distribution
            </h3>
            <Badge variant="warning">
              ₹{(analytics?.totalBets || 0).toLocaleString()}
            </Badge>
          </div>
          
          <BetDistributionChart data={analytics?.betDistribution || []} />
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Conversion Funnel
        </h3>
        
        <ConversionFunnel data={analytics?.conversionFunnel || []} />
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Top Players
          </h3>
          
          <div className="space-y-3">
            {analytics?.topUsers.map((user: any, index: number) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-[#0A0E27] rounded-lg border border-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold">₹{user.wagered.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{user.games} games</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Top Partners */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Top Partners
          </h3>
          
          <div className="space-y-3">
            {analytics?.topPartners.map((partner: any, index: number) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-[#0A0E27] rounded-lg border border-green-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{partner.name}</p>
                    <p className="text-gray-400 text-sm">{partner.referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">₹{partner.earnings.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{partner.commission}% rate</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon: Icon, trend, color, index }: MetricCardProps & { index: number }) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    gold: 'from-amber-500 to-yellow-600',
    purple: 'from-purple-500 to-pink-600',
    blue: 'from-blue-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600'
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6 hover:border-cyan-500/60 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}

// Simple Bar Chart Component
function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((point, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{point.date}</span>
            <span className="text-cyan-400 font-medium">₹{point.value.toLocaleString()}</span>
          </div>
          <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(point.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// User Growth Chart
function UserGrowthChart({ data }: { data: ChartDataPoint[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((point, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{point.date}</span>
            <span className="text-green-400 font-medium">{point.value}</span>
          </div>
          <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(point.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Game Activity Chart
function GameActivityChart({ data }: { data: ChartDataPoint[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((point, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{point.date}</span>
            <span className="text-purple-400 font-medium">{point.value} games</span>
          </div>
          <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(point.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Bet Distribution Chart
function BetDistributionChart({ data }: { data: Array<{ range: string; count: number; amount: number }> }) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{item.range}</span>
            <div className="text-right">
              <span className="text-amber-400 font-medium">₹{item.amount.toLocaleString()}</span>
              <span className="text-gray-500 ml-2">({item.count})</span>
            </div>
          </div>
          <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.amount / totalAmount) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Conversion Funnel
function ConversionFunnel({ data }: { data: Array<{ stage: string; count: number; rate: number }> }) {
  return (
    <div className="space-y-4">
      {data.map((stage, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{stage.stage}</span>
            <div className="flex items-center gap-4">
              <span className="text-cyan-400 font-bold">{stage.count.toLocaleString()}</span>
              <Badge variant="default">{stage.rate}%</Badge>
            </div>
          </div>
          <div className="w-full bg-[#0A0E27] rounded-full h-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stage.rate}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-sm font-medium">{stage.rate}%</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}