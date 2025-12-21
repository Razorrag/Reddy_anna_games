import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Wallet, DollarSign, TrendingUp, TrendingDown, BarChart3, 
  History, LogOut, RefreshCw, Users, Trophy, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface PartnerStats {
  wallet_balance: string;
  total_earned: string;
  total_withdrawn: string;
  earnings_today: string;
  earnings_this_month: string;
  total_games: number;
  active_players: number;
  commission_rate: string;
}

export function PartnerDashboardPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['partner-stats'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: PartnerStats }>('/partner/stats');
      return response.data.data;
    },
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleLogout = () => {
    logout();
    setLocation('/partner/login');
  };

  const metricCards = [
    {
      title: 'Wallet Balance',
      value: formatCurrency(stats?.wallet_balance || '0'),
      icon: Wallet,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Total Earned',
      value: formatCurrency(stats?.total_earned || '0'),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Earnings Today',
      value: formatCurrency(stats?.earnings_today || '0'),
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'This Month',
      value: formatCurrency(stats?.earnings_this_month || '0'),
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Total Games',
      value: stats?.total_games?.toLocaleString() || '0',
      icon: Trophy,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Active Players',
      value: stats?.active_players?.toLocaleString() || '0',
      icon: Users,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
    },
  ];

  const quickActions = [
    {
      title: 'My Players',
      description: 'View and manage your referred players',
      icon: Users,
      href: '/partner/players',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Withdrawals',
      description: 'Request and track withdrawals',
      icon: TrendingDown,
      href: '/partner/withdrawals',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Commissions',
      description: 'View your commission history',
      icon: DollarSign,
      href: '/partner/commissions',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Game History',
      description: 'View complete game records',
      icon: History,
      href: '/partner/history',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Partner Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.username || 'Partner'}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet Balance Display */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg px-6 py-3">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Wallet Balance</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(stats?.wallet_balance || '0')}
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-purple-500/20 text-purple-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              className="border-purple-500/20 text-purple-400"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-purple-400 mb-4">📊 Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricCards.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-white/5 border ${metric.borderColor} backdrop-blur-sm`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${metric.color}`}>
                      {metric.title}
                    </CardTitle>
                    <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${metric.color}`}>
                      {isLoading ? '...' : metric.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Commission Info */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-500/20 rounded-full">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Your Commission Rate</h3>
                  <p className="text-gray-400 text-sm">You earn from every game your players participate in</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-400">
                  {stats?.commission_rate || '10'}%
                </div>
                <p className="text-gray-400 text-sm mt-1">Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-purple-400 mb-6">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setLocation(action.href)}
              >
                <Card className="bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-200">
                  <CardHeader>
                    <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-center text-white text-lg mb-2">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-center text-gray-400 text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your latest earnings and player activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p>Activity history will be displayed here</p>
              <p className="text-sm mt-1">Check the Commissions tab for detailed history</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
