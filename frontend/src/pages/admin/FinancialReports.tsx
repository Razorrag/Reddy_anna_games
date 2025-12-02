import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  FileText,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Users,
  Target,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialReportsQuery } from '@/hooks/queries/useFinancialReportsQuery';

type ReportType = 'revenue' | 'expenses' | 'profit' | 'commission';
type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

export default function FinancialReports() {
  const [reportType, setReportType] = useState<ReportType>('revenue');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { data: report, isLoading } = useFinancialReportsQuery(reportType, timeRange);

  const exportToPDF = () => {
    // Generate PDF report
    console.log('Exporting to PDF...');
  };

  const exportToCSV = () => {
    if (!report) return;
    
    const csvData = [
      ['Financial Report', reportType.toUpperCase(), timeRange.toUpperCase()],
      [''],
      ['Metric', 'Amount', 'Change'],
      ['Total Revenue', report.totalRevenue, `${report.revenueChange}%`],
      ['Total Expenses', report.totalExpenses, `${report.expensesChange}%`],
      ['Net Profit', report.netProfit, `${report.profitChange}%`],
      ['Partner Commission', report.partnerCommission, `${report.commissionChange}%`],
      [''],
      ['Detailed Breakdown'],
      ['Category', 'Amount', 'Percentage'],
      ...report.breakdown.map((item: any) => [
        item.category,
        item.amount,
        `${item.percentage}%`
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${reportType}-${timeRange}-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading financial reports...</p>
        </div>
      </div>
    );
  }

  const metrics: FinancialMetric[] = [
    {
      label: 'Total Revenue',
      value: report?.totalRevenue || 0,
      change: report?.revenueChange || 0,
      trend: (report?.revenueChange || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Total Expenses',
      value: report?.totalExpenses || 0,
      change: report?.expensesChange || 0,
      trend: (report?.expensesChange || 0) >= 0 ? 'down' : 'up',
      icon: CreditCard,
      color: 'red'
    },
    {
      label: 'Net Profit',
      value: report?.netProfit || 0,
      change: report?.profitChange || 0,
      trend: (report?.profitChange || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'cyan'
    },
    {
      label: 'Profit Margin',
      value: report?.profitMargin || 0,
      change: report?.marginChange || 0,
      trend: (report?.marginChange || 0) >= 0 ? 'up' : 'down',
      icon: Target,
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Financial Reports
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive financial analysis and insights
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger className="w-40 bg-[#1a1f3a] border-cyan-500/30">
              <FileText className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="profit">Profit/Loss</SelectItem>
              <SelectItem value="commission">Commission</SelectItem>
            </SelectContent>
          </Select>

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
            </SelectContent>
          </Select>

          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-cyan-500/30 hover:border-cyan-500"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>

          <Button
            onClick={exportToPDF}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} index={index} />
        ))}
      </div>

      {/* P&L Statement */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Profit & Loss Statement
        </h3>

        <div className="space-y-4">
          {/* Revenue Section */}
          <div className="border-b border-cyan-500/20 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue
              </h4>
              <span className="text-green-400 font-bold text-xl">
                ₹{report?.totalRevenue.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2 ml-7">
              {report?.revenueBreakdown.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{item.category}</span>
                  <span className="text-white">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses Section */}
          <div className="border-b border-cyan-500/20 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Expenses
              </h4>
              <span className="text-red-400 font-bold text-xl">
                ₹{report?.totalExpenses.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2 ml-7">
              {report?.expensesBreakdown.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{item.category}</span>
                  <span className="text-white">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Net Profit
              </h4>
              <span className={`text-2xl font-bold ${report?.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{report?.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-400">Profit Margin:</span>
              <Badge variant={report?.profitMargin >= 20 ? 'success' : 'warning'}>
                {report?.profitMargin}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Revenue & Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-400" />
            Revenue Sources
          </h3>
          
          <div className="space-y-3">
            {report?.revenueBreakdown.map((item: any, index: number) => (
              <RevenueSourceItem key={index} {...item} index={index} />
            ))}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-red-400" />
            Expense Categories
          </h3>
          
          <div className="space-y-3">
            {report?.expensesBreakdown.map((item: any, index: number) => (
              <ExpenseItem key={index} {...item} index={index} />
            ))}
          </div>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          Partner Commission Details
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left text-gray-400 font-medium pb-3">Partner</th>
                <th className="text-left text-gray-400 font-medium pb-3">Referrals</th>
                <th className="text-left text-gray-400 font-medium pb-3">Total Wagered</th>
                <th className="text-left text-gray-400 font-medium pb-3">Commission Rate</th>
                <th className="text-left text-gray-400 font-medium pb-3">Commission Earned</th>
                <th className="text-left text-gray-400 font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {report?.commissionDetails.map((partner: any, index: number) => (
                <motion.tr
                  key={partner.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-cyan-500/10"
                >
                  <td className="py-3">
                    <div>
                      <p className="text-white font-medium">{partner.name}</p>
                      <p className="text-gray-400 text-sm">{partner.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 text-white">{partner.referrals}</td>
                  <td className="py-3 text-cyan-400">₹{partner.totalWagered.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge variant="default">{partner.commissionRate}%</Badge>
                  </td>
                  <td className="py-3 text-green-400 font-bold">
                    ₹{partner.commissionEarned.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <Badge variant={partner.status === 'paid' ? 'success' : 'warning'}>
                      {partner.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-cyan-500/30 bg-[#0A0E27]">
                <td className="py-3 text-white font-bold">Total</td>
                <td className="py-3 text-white font-bold">{report?.totalReferrals}</td>
                <td className="py-3 text-cyan-400 font-bold">
                  ₹{report?.totalWagered.toLocaleString()}
                </td>
                <td className="py-3"></td>
                <td className="py-3 text-green-400 font-bold">
                  ₹{report?.totalCommission.toLocaleString()}
                </td>
                <td className="py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Monthly Comparison */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Monthly Comparison
        </h3>

        <div className="space-y-3">
          {report?.monthlyData.map((month: any, index: number) => (
            <MonthlyComparisonItem key={index} {...month} index={index} />
          ))}
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Key Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.insights.map((insight: any, index: number) => (
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
                    <TrendingDown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Activity className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium mb-1">{insight.title}</p>
                  <p className="text-gray-400 text-sm">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, change, trend, icon: Icon, color, index }: FinancialMetric & { index: number }) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    cyan: 'from-cyan-500 to-blue-600',
    amber: 'from-amber-500 to-orange-600'
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const isPositive = (color === 'green' && trend === 'up') || (color === 'red' && trend === 'down');

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
          
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">
            {label.includes('Margin') ? `${value}%` : `₹${value.toLocaleString()}`}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// Revenue Source Item
function RevenueSourceItem({ category, amount, percentage, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{category}</span>
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-medium">₹{amount.toLocaleString()}</span>
          <Badge variant="success">{percentage}%</Badge>
        </div>
      </div>
      <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
        />
      </div>
    </motion.div>
  );
}

// Expense Item
function ExpenseItem({ category, amount, percentage, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{category}</span>
        <div className="flex items-center gap-3">
          <span className="text-red-400 font-medium">₹{amount.toLocaleString()}</span>
          <Badge variant="destructive">{percentage}%</Badge>
        </div>
      </div>
      <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full"
        />
      </div>
    </motion.div>
  );
}

// Monthly Comparison Item
function MonthlyComparisonItem({ month, revenue, expenses, profit, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#0A0E27] rounded-lg p-4 border border-cyan-500/10"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">{month}</h4>
        <Badge variant={profit >= 0 ? 'success' : 'destructive'}>
          ₹{Math.abs(profit).toLocaleString()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400 mb-1">Revenue</p>
          <p className="text-green-400 font-bold">₹{revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Expenses</p>
          <p className="text-red-400 font-bold">₹{expenses.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Profit</p>
          <p className={`font-bold ${profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            ₹{profit.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}