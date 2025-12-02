import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Share2,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferralStatsQuery } from '@/hooks/queries/useReferralStatsQuery';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function ReferralStats() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { data: stats, isLoading } = useReferralStatsQuery(timeRange);

  const exportData = () => {
    if (!stats) return;
    
    const csvData = [
      ['Referral Statistics Report'],
      ['Time Period', timeRange],
      [''],
      ['Metric', 'Value', 'Change'],
      ['Total Signups', stats.totalSignups, `${stats.signupsChange}%`],
      ['Active Users', stats.activeUsers, `${stats.activeChange}%`],
      ['Conversion Rate', `${stats.conversionRate}%`, `${stats.conversionChange}%`],
      ['Retention Rate', `${stats.retentionRate}%`, `${stats.retentionChange}%`],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-stats-${timeRange}-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading statistics...</p>
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
            Referral Statistics
          </h1>
          <p className="text-gray-400 mt-1">
            Analyze your referral performance and conversion rates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-40 bg-[#1a1f3a] border-cyan-500/30">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Signups"
          value={stats?.totalSignups.toString() || '0'}
          change={stats?.signupsChange || 0}
          icon={Users}
          color="cyan"
        />
        <MetricCard
          title="Active Users"
          value={stats?.activeUsers.toString() || '0'}
          change={stats?.activeChange || 0}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          change={stats?.conversionChange || 0}
          icon={Target}
          color="amber"
        />
        <MetricCard
          title="Retention Rate"
          value={`${stats?.retentionRate || 0}%`}
          change={stats?.retentionChange || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Conversion Funnel
        </h3>

        <div className="space-y-4">
          {stats?.conversionFunnel.map((stage: any, index: number) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{stage.stage}</span>
                  <Badge variant="default">{stage.count}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-bold">{stage.percentage}%</span>
                  {index > 0 && (
                    <span className={`text-sm ${
                      stage.dropoff >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stage.dropoff >= 0 ? '+' : ''}{stage.dropoff}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm font-medium">{stage.percentage}%</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signup Trend */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Signup Trend
          </h3>

          <div className="space-y-3">
            {stats?.signupTrend.map((point: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{point.period}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold">{point.signups}</span>
                    <div className={`flex items-center gap-1 ${
                      point.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {point.change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{Math.abs(point.change)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(point.signups / Math.max(...stats.signupTrend.map((p: any) => p.signups))) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Breakdown */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-400" />
            User Activity
          </h3>

          <div className="space-y-4">
            {stats?.activityBreakdown.map((activity: any, index: number) => (
              <motion.div
                key={activity.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{activity.status}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{activity.count}</span>
                    <Badge variant={
                      activity.status === 'Active' ? 'success' :
                      activity.status === 'Inactive' ? 'default' :
                      'warning'
                    }>
                      {activity.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activity.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      activity.status === 'Active' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      activity.status === 'Inactive' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      'bg-gradient-to-r from-amber-500 to-orange-600'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Performance Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0A0E27] rounded-lg p-4 border border-cyan-500/20">
            <p className="text-gray-400 text-sm mb-2">Avg. Player Value</p>
            <p className="text-2xl font-bold text-cyan-400">
              ₹{(stats?.avgPlayerValue || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-[#0A0E27] rounded-lg p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm mb-2">Avg. Engagement</p>
            <p className="text-2xl font-bold text-green-400">
              {stats?.avgEngagement || 0} games
            </p>
          </div>

          <div className="bg-[#0A0E27] rounded-lg p-4 border border-amber-500/20">
            <p className="text-gray-400 text-sm mb-2">Best Performing Day</p>
            <p className="text-2xl font-bold text-amber-400">{stats?.bestDay || 'Monday'}</p>
          </div>

          <div className="bg-[#0A0E27] rounded-lg p-4 border border-purple-500/20">
            <p className="text-gray-400 text-sm mb-2">Peak Hour</p>
            <p className="text-2xl font-bold text-purple-400">{stats?.peakHour || '8-9 PM'}</p>
          </div>
        </div>
      </Card>

      {/* Top Referral Sources */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          Top Referral Sources
        </h3>

        <div className="space-y-3">
          {stats?.topSources.map((source: any, index: number) => (
            <motion.div
              key={source.source}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{source.source}</p>
                  <p className="text-gray-400 text-sm">{source.signups} signups</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="success">{source.conversionRate}%</Badge>
                <p className="text-gray-400 text-sm mt-1">
                  ₹{source.revenue.toLocaleString()} revenue
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Insights & Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.insights.map((insight: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1f3a] rounded-lg p-4 border border-cyan-500/20"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-500/20' :
                  insight.type === 'warning' ? 'bg-amber-500/20' :
                  'bg-cyan-500/20'
                }`}>
                  {insight.type === 'success' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : insight.type === 'warning' ? (
                    <Activity className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Target className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">{insight.title}</p>
                  <p className="text-gray-400 text-sm">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Period Comparison</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left text-gray-400 font-medium pb-4">Metric</th>
                <th className="text-left text-gray-400 font-medium pb-4">Current</th>
                <th className="text-left text-gray-400 font-medium pb-4">Previous</th>
                <th className="text-left text-gray-400 font-medium pb-4">Change</th>
              </tr>
            </thead>
            <tbody>
              {stats?.comparison.map((row: any, index: number) => (
                <motion.tr
                  key={row.metric}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-cyan-500/10"
                >
                  <td className="py-4 text-white">{row.metric}</td>
                  <td className="py-4 text-cyan-400 font-bold">{row.current}</td>
                  <td className="py-4 text-gray-400">{row.previous}</td>
                  <td className="py-4">
                    <div className={`flex items-center gap-1 ${
                      row.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {row.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="font-medium">{Math.abs(row.change)}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
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
        
        <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>

      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
}