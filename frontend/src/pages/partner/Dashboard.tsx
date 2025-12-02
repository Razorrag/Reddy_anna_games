import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Eye,
  Download,
  Share2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePartnerDashboardQuery } from '@/hooks/queries/usePartnerDashboardQuery';
import { Link } from 'wouter';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  trend: 'up' | 'down';
}

export default function PartnerDashboard() {
  const { data: dashboard, isLoading } = usePartnerDashboardQuery();

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${dashboard?.referralCode}`;
    navigator.clipboard.writeText(link);
  };

  const shareReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${dashboard?.referralCode}`;
    const text = `Join Reddy Anna and start playing! Use my referral code: ${dashboard?.referralCode}`;
    
    if (navigator.share) {
      navigator.share({ title: 'Reddy Anna Referral', text, url: link });
    } else {
      copyReferralLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      title: 'Total Earnings',
      value: `₹${(dashboard?.totalEarnings || 0).toLocaleString()}`,
      change: dashboard?.earningsChange || 0,
      icon: DollarSign,
      color: 'gold',
      trend: (dashboard?.earningsChange || 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Pending Earnings',
      value: `₹${(dashboard?.pendingEarnings || 0).toLocaleString()}`,
      change: dashboard?.pendingChange || 0,
      icon: Wallet,
      color: 'amber',
      trend: (dashboard?.pendingChange || 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Total Referrals',
      value: dashboard?.totalReferrals.toString() || '0',
      change: dashboard?.referralsChange || 0,
      icon: Users,
      color: 'cyan',
      trend: (dashboard?.referralsChange || 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Active Players',
      value: dashboard?.activePlayers.toString() || '0',
      change: dashboard?.activeChange || 0,
      icon: Activity,
      color: 'green',
      trend: (dashboard?.activeChange || 0) >= 0 ? 'up' : 'down'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Partner Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {dashboard?.partnerName || 'Partner'}!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-cyan-500/30 hover:border-cyan-500"
            asChild
          >
            <Link href="/partner/earnings">
              <Eye className="w-4 h-4 mr-2" />
              View Earnings
            </Link>
          </Button>

          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            asChild
          >
            <Link href="/partner/payout-requests">
              <Download className="w-4 h-4 mr-2" />
              Request Payout
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Referral Section */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              Your Referral Code
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Share your referral code and earn {dashboard?.commissionRate || 2}% commission on all referred player activity
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1f3a] border border-cyan-500/30 rounded-lg px-6 py-3">
                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-wider">
                  {dashboard?.referralCode}
                </p>
              </div>
              <Badge variant="gold" className="text-lg">
                {dashboard?.commissionRate || 2}% Commission
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={copyReferralLink}
              variant="outline"
              className="border-cyan-500/30 hover:border-cyan-500"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={shareReferralLink}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Recent Referrals
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/partner/players" className="text-cyan-400 hover:text-cyan-300">
                View All
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {dashboard?.recentReferrals.map((referral: any, index: number) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {referral.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{referral.name}</p>
                    <p className="text-gray-400 text-sm">{referral.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={referral.status === 'active' ? 'success' : 'default'}>
                    {referral.status}
                  </Badge>
                  <p className="text-gray-400 text-xs mt-1">{referral.joinedDate}</p>
                </div>
              </motion.div>
            ))}

            {(!dashboard?.recentReferrals || dashboard.recentReferrals.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No referrals yet. Start sharing your code!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Earnings Overview */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Earnings Overview
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/partner/earnings" className="text-cyan-400 hover:text-cyan-300">
                View Details
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0A0E27] rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">This Month</span>
                <Badge variant="success">+{dashboard?.monthlyGrowth || 0}%</Badge>
              </div>
              <p className="text-2xl font-bold text-green-400">
                ₹{(dashboard?.thisMonthEarnings || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-[#0A0E27] rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Last Month</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ₹{(dashboard?.lastMonthEarnings || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-[#0A0E27] rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Available for Withdrawal</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">
                ₹{(dashboard?.availableBalance || 0).toLocaleString()}
              </p>
              <Button
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                size="sm"
                asChild
              >
                <Link href="/partner/payout-requests">
                  <Download className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Performance Metrics
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-cyan-400 font-bold">{dashboard?.conversionRate || 0}%</span>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboard?.conversionRate || 0}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Active Rate</span>
                <span className="text-green-400 font-bold">{dashboard?.activeRate || 0}%</span>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboard?.activeRate || 0}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Retention Rate</span>
                <span className="text-amber-400 font-bold">{dashboard?.retentionRate || 0}%</span>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboard?.retentionRate || 0}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                />
              </div>
            </div>

            <div className="bg-[#0A0E27] rounded-lg p-4 border border-cyan-500/20 mt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-white font-medium">Performance Ranking</p>
                  <p className="text-gray-400 text-sm">
                    You're in the top {dashboard?.performanceRank || 10}% of partners!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Quick Stats
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-gray-400">Total Players</span>
              </div>
              <span className="text-white font-bold text-xl">{dashboard?.totalReferrals || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-400">Total Wagered</span>
              </div>
              <span className="text-white font-bold text-xl">
                ₹{(dashboard?.totalWagered || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-gray-400">Days Active</span>
              </div>
              <span className="text-white font-bold text-xl">{dashboard?.daysActive || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-400">Avg. Earnings/Day</span>
              </div>
              <span className="text-white font-bold text-xl">
                ₹{(dashboard?.avgEarningsPerDay || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, icon: Icon, color, trend, index }: StatCardProps & { index: number }) {
  const colorClasses = {
    gold: 'from-amber-500 to-yellow-600',
    amber: 'from-amber-500 to-orange-600',
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-green-500 to-emerald-600'
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