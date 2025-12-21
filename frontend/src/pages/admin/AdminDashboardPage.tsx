import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Users, Gift, BarChart3, History, CreditCard, Settings, 
  GamepadIcon, TrendingUp, RefreshCw, TrendingDown, Handshake,
  Video, DollarSign, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AdminStats {
  netHouseProfit: number;
  totalGamesToday: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalWinnings: number;
  totalLosses: number;
  activePlayersToday: number;
  totalBetsToday: number;
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: AdminStats }>('/admin/stats');
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const netProfit = (stats?.netHouseProfit || 0) >= 0 ? (stats?.netHouseProfit || 0) : 0;
  const netLoss = (stats?.netHouseProfit || 0) < 0 ? Math.abs(stats?.netHouseProfit || 0) : 0;

  const managementCards = [
    {
      title: 'Game Control',
      description: 'Control live games, deal cards, manage rounds',
      icon: GamepadIcon,
      href: '/admin/game-control',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'User Management',
      description: 'Manage users, balances, and permissions',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Stream Settings',
      description: 'Configure global live stream URL',
      icon: Video,
      href: '/admin/stream-settings',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Deposits',
      description: 'Process deposit requests',
      icon: TrendingUp,
      href: '/admin/deposits',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Withdrawals',
      description: 'Process withdrawal requests',
      icon: TrendingDown,
      href: '/admin/withdrawals',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      title: 'Bonuses',
      description: 'Manage bonuses and rewards',
      icon: Gift,
      href: '/admin/bonuses',
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      title: 'Partners',
      description: 'Manage partner accounts',
      icon: Handshake,
      href: '/admin/partners',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Analytics',
      description: 'View statistics and insights',
      icon: BarChart3,
      href: '/admin/analytics',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Game History',
      description: 'View complete game records',
      icon: History,
      href: '/admin/game-history',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Transactions',
      description: 'View all transactions',
      icon: CreditCard,
      href: '/admin/transactions',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      title: 'Reports',
      description: 'Generate financial reports',
      icon: DollarSign,
      href: '/admin/reports',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/admin/settings',
      gradient: 'from-gray-500 to-slate-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              🎰 Admin Dashboard
            </h1>
            <p className="text-gray-400">Central management hub for Reddy Anna Gaming Platform</p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="border-amber-500/20 text-amber-400"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-amber-400 mb-4">📊 Today's Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Net Profit */}
            <Card className="bg-white/5 border border-green-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {isLoading ? '...' : formatCurrency(netProfit)}
                </div>
                <p className="text-xs text-gray-400 mt-1">House profit</p>
              </CardContent>
            </Card>

            {/* Net Loss */}
            <Card className="bg-white/5 border border-red-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-400">Net Loss</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {isLoading ? '...' : formatCurrency(netLoss)}
                </div>
                <p className="text-xs text-gray-400 mt-1">House loss</p>
              </CardContent>
            </Card>

            {/* Total Games */}
            <Card className="bg-white/5 border border-purple-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Games Played</CardTitle>
                <GamepadIcon className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {isLoading ? '...' : (stats?.totalGamesToday || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">Completed today</p>
              </CardContent>
            </Card>

            {/* Pending Deposits */}
            <Card className="bg-white/5 border border-blue-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Deposits</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {isLoading ? '...' : (stats?.pendingDeposits || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">Pending approval</p>
              </CardContent>
            </Card>

            {/* Pending Withdrawals */}
            <Card className="bg-white/5 border border-orange-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Withdrawals</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">
                  {isLoading ? '...' : (stats?.pendingWithdrawals || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">Pending approval</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Features */}
        <div>
          <h2 className="text-2xl font-bold text-amber-400 mb-6">📊 Management Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Card className="bg-white/5 border border-white/10 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-200">
                    <CardHeader>
                      <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <card.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-center text-white text-xl mb-2">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-center text-gray-400">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}