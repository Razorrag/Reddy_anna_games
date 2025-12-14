import { Link, useLocation } from 'wouter';
import {
  Users,
  Gift,
  BarChart3,
  History,
  CreditCard,
  Settings,
  GamepadIcon,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Video,
  RefreshCw,
  Handshake,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '@/hooks/queries/admin/useAdminDashboard';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading, refetch } = useAdminDashboard();

  const stats = dashboard?.stats || {
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalGames: 0,
    netHouseProfit: 0,
    totalWinnings: 0,
    totalLosses: 0,
  };

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

  const netProfit = (stats.netHouseProfit || 0) >= 0 ? (stats.netHouseProfit || 0) : 0;
  const netLoss = (stats.netHouseProfit || 0) < 0 ? Math.abs(stats.netHouseProfit || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD100] to-yellow-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
              🎰 Admin Dashboard
            </h1>
            <p className="text-gray-400">Central management hub for your gaming platform</p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="border-[#FFD100]/30 text-[#FFD100] hover:bg-[#FFD100]/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-[#FFD100] mb-4">📊 Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Net Profit */}
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-200">
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
          <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-200">
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
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">Total Games</CardTitle>
              <GamepadIcon className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {isLoading ? '...' : (stats.totalGames || 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">Games completed today</p>
            </CardContent>
          </Card>

          {/* Deposit Requests */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Deposits</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {isLoading ? '...' : (stats.pendingDeposits || 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">Pending approval</p>
            </CardContent>
          </Card>

          {/* Withdrawal Requests */}
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Withdrawals</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {isLoading ? '...' : (stats.pendingWithdrawals || 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">Pending approval</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Management Cards */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#FFD100] mb-6">📊 Management Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stream Settings */}
          <Link href="/admin/stream-settings">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-center text-[#FFD100] text-xl mb-2">Stream Settings</CardTitle>
                <CardDescription className="text-center text-gray-400">
                  Configure global live stream URL
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Game Control */}
          <Link href="/admin/game-control">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <GamepadIcon className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">Game Control</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Control live games, deal cards, manage rounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-400">
                  Click to access game control panel
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* User Management */}
          <Link href="/admin/users">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">User Management</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Manage users, balances, and permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Bonus & Referral */}
          <Link href="/admin/bonuses">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Gift className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">Bonus & Referral</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Manage bonuses, referrals, and rewards
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">Analytics</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  View statistics, reports, and insights
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Game History */}
          <Link href="/admin/game-history">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <History className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">Game History</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  View complete game records and logs
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Payments D/W */}
          <Link href="/admin/deposits">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CreditCard className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">Payments D/W</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Manage deposits and withdrawals
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Settings */}
          <Link href="/admin/settings">
            <Card className="bg-black/40 border-[#FFD100]/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD100] to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Settings className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-white text-center text-xl">System Settings</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Configure system and game settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Partner Management */}
          <Link href="/admin/partners">
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-center text-xl">Partner Management</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Manage partner accounts
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}