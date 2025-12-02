import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  UserCheck,
  GamepadIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '@/hooks/queries/admin/useAdminDashboard';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  const stats = dashboard?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activeGames: 0,
    totalGames: 0,
  };

  const recentActivity = dashboard?.recentActivity || [];
  const pendingActions = dashboard?.pendingActions || [];

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="w-8 h-8 text-[#FFD700]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">System overview and management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-[#0A0E27]" />
                <Badge className="bg-[#0A0E27]/20 text-[#0A0E27]">Total</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#0A0E27]/70 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-[#0A0E27]">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-[#0A0E27]/60">
                  {stats.activeUsers} active today
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <IndianRupee className="w-8 h-8 text-white" />
                <Badge className="bg-white/20 text-white">Revenue</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white flex items-center gap-1">
                  <IndianRupee className="w-6 h-6" />
                  {stats.totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-white/60">
                  ₹{stats.todayRevenue.toLocaleString('en-IN')} today
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Pending Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#00F5FF] to-[#00D4E5] border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-[#0A0E27]" />
                <Badge className="bg-[#0A0E27]/20 text-[#0A0E27]">Pending</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#0A0E27]/70 font-medium">Pending Actions</p>
                <p className="text-3xl font-bold text-[#0A0E27]">
                  {stats.pendingDeposits + stats.pendingWithdrawals}
                </p>
                <p className="text-xs text-[#0A0E27]/60">
                  {stats.pendingDeposits} deposits, {stats.pendingWithdrawals} withdrawals
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Active Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-[#FFD700]/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <GamepadIcon className="w-8 h-8 text-[#FFD700]" />
                <Badge variant="neon">Live</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400 font-medium">Active Games</p>
                <p className="text-3xl font-bold text-white">{stats.activeGames}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalGames} total games today
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#FFD700]" />
                  Pending Actions
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/admin/payments')}
                  className="text-[#FFD700] hover:text-[#FFD700]"
                >
                  View All →
                </Button>
              </div>

              {pendingActions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-400">No pending actions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingActions.slice(0, 5).map((action: any) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 bg-[#2a2f4a] rounded-lg hover:bg-[#2a2f4a]/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/${action.type}s/${action.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          action.type === 'deposit'
                            ? 'bg-green-500/10'
                            : 'bg-red-500/10'
                        }`}>
                          {action.type === 'deposit' ? (
                            <TrendingDown className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {action.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Request
                          </p>
                          <p className="text-xs text-gray-400">
                            {action.userName} - ₹{action.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(action.createdAt), 'HH:mm')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#FFD700]" />
                  Recent Activity
                </h3>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 6).map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-[#2a2f4a] rounded-lg"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'user_signup'
                          ? 'bg-[#FFD700]/10'
                          : activity.type === 'payment_approved'
                          ? 'bg-green-500/10'
                          : activity.type === 'game_completed'
                          ? 'bg-[#00F5FF]/10'
                          : 'bg-gray-500/10'
                      }`}>
                        {activity.type === 'user_signup' ? (
                          <UserCheck className="w-4 h-4 text-[#FFD700]" />
                        ) : activity.type === 'payment_approved' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : activity.type === 'game_completed' ? (
                          <GamepadIcon className="w-4 h-4 text-[#00F5FF]" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/users')}
                className="flex-col h-auto py-4 border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                <Users className="w-6 h-6 text-[#FFD700] mb-2" />
                <span className="text-sm">Users</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/deposits')}
                className="flex-col h-auto py-4 border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                <TrendingDown className="w-6 h-6 text-green-500 mb-2" />
                <span className="text-sm">Deposits</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/withdrawals')}
                className="flex-col h-auto py-4 border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                <TrendingUp className="w-6 h-6 text-red-500 mb-2" />
                <span className="text-sm">Withdrawals</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/games')}
                className="flex-col h-auto py-4 border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                <GamepadIcon className="w-6 h-6 text-[#00F5FF] mb-2" />
                <span className="text-sm">Games</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/partners')}
                className="flex-col h-auto py-4 border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                <UserCheck className="w-6 h-6 text-[#FFD700] mb-2" />
                <span className="text-sm">Partners</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/analytics')}
                className="flex-col h-auto py-4 border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                <Activity className="w-6 h-6 text-[#FFD700] mb-2" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}