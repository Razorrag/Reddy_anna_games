import { useQuery } from '@tanstack/react-query';
import { 
  Wallet, 
  TrendingUp, 
  Gift, 
  Users, 
  PlayCircle,
  ArrowUpRight,
  ArrowDownRight,
  Trophy
} from 'lucide-react';
import { Link } from 'wouter';

export function DashboardPage() {
  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await fetch('/api/users/me/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Fetch recent games
  const { data: recentGames } = useQuery({
    queryKey: ['recent-games'],
    queryFn: async () => {
      const response = await fetch('/api/games/history?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
  });

  // Fetch active bonuses
  const { data: bonuses } = useQuery({
    queryKey: ['active-bonuses'],
    queryFn: async () => {
      const response = await fetch('/api/bonuses/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bonuses');
      return response.json();
    },
  });

  const statsCards = [
    {
      title: 'Total Balance',
      value: `₹${stats?.balance || '0.00'}`,
      change: '+12.5%',
      icon: Wallet,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Bonus Balance',
      value: `₹${stats?.bonusBalance || '0.00'}`,
      change: `${stats?.activeBonuses || 0} active`,
      icon: Gift,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Games Played',
      value: stats?.totalGames || '0',
      change: `${stats?.todayGames || 0} today`,
      icon: PlayCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Win Rate',
      value: `${stats?.winRate || '0'}%`,
      change: stats?.totalWins ? `${stats.totalWins} wins` : 'No wins yet',
      icon: Trophy,
      color: 'text-[#FFD700]',
      bgColor: 'bg-[#1A1F3A]/60',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A1F3A] to-[#0A0E27] border border-[#FFD700]/20 p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={120} className="text-[#FFD700]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] mb-2 drop-shadow-sm">
            Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Welcome back! Here's your royal overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-6 hover:border-[#FFD700]/50 hover:bg-[#1A1F3A]/80 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.bgColor} shadow-inner`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-[#0A0E27]/50 ${card.color.replace('text-', 'text-')}`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{card.title}</h3>
              <p className={`text-2xl font-bold ${card.color} drop-shadow-sm`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/game">
          <a className="block bg-premium-gold border border-[#FFD700]/50 rounded-2xl p-6 shadow-glow-gold hover:shadow-gold-glow-strong hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <PlayCircle className="w-12 h-12 text-[#0A0E27] mb-4 group-hover:scale-110 transition-transform drop-shadow-sm" />
            <h3 className="text-2xl font-bold text-[#0A0E27] mb-1">Play Game</h3>
            <p className="text-[#0A0E27]/80 text-sm font-medium">Join the live Andar Bahar game</p>
          </a>
        </Link>

        <Link href="/deposit">
          <a className="block bg-premium-royal border border-green-500/30 rounded-2xl p-6 hover:border-green-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all group">
            <ArrowDownRight className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform drop-shadow-md" />
            <h3 className="text-xl font-bold text-green-400 mb-2">Deposit</h3>
            <p className="text-green-400/70 text-sm">Add funds to your wallet</p>
          </a>
        </Link>

        <Link href="/withdraw">
          <a className="block bg-premium-royal border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all group">
            <ArrowUpRight className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform drop-shadow-md" />
            <h3 className="text-xl font-bold text-blue-400 mb-2">Withdraw</h3>
            <p className="text-blue-400/70 text-sm">Withdraw your winnings</p>
          </a>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Games */}
        <div className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-[#FFD700]" />
              Recent Games
            </h2>
            <Link href="/history">
              <a className="text-[#FFD700] hover:text-[#FFA500] text-sm font-medium hover:underline">View All →</a>
            </Link>
          </div>
          <div className="space-y-3">
            {recentGames?.games?.slice(0, 5).map((game: any) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 bg-[#0A0E27]/50 rounded-xl border border-[#FFD700]/10 hover:border-[#FFD700]/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${
                    game.result === 'win' ? 'bg-green-500 text-green-500' : 
                    game.result === 'loss' ? 'bg-red-500 text-red-500' : 'bg-gray-500 text-gray-500'
                  }`} />
                  <div>
                    <p className="text-white font-bold">Round #{game.roundNumber}</p>
                    <p className="text-gray-400 text-xs">{new Date(game.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    game.result === 'win' ? 'text-green-400' : 
                    game.result === 'loss' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {game.result === 'win' ? '+' : game.result === 'loss' ? '-' : ''}₹{game.amount}
                  </p>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{game.result}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-12 text-gray-500 bg-[#0A0E27]/30 rounded-xl border border-dashed border-gray-700">
                <p className="mb-2">No recent games played</p>
                <Link href="/game">
                  <a className="text-[#FFD700] hover:text-[#FFA500] text-sm font-bold uppercase tracking-wide border-b border-[#FFD700] pb-0.5">
                    Start your first game
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Bonuses */}
        <div className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Active Bonuses
            </h2>
            <Link href="/bonuses">
              <a className="text-[#FFD700] hover:text-[#FFA500] text-sm font-medium hover:underline">View All →</a>
            </Link>
          </div>
          <div className="space-y-3">
            {bonuses?.bonuses?.slice(0, 5).map((bonus: any) => (
              <div
                key={bonus.id}
                className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Gift className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white font-bold capitalize">
                      {bonus.bonusType} Bonus
                    </span>
                  </div>
                  <span className="text-purple-400 font-bold text-lg">₹{bonus.amount}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400">Wagering Progress</span>
                    <span className="text-purple-300">
                      {bonus.wageringCompleted} / {bonus.wageringRequirement}
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0E27] rounded-full h-2 border border-purple-500/10">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          (parseFloat(bonus.wageringCompleted) / parseFloat(bonus.wageringRequirement)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-12 text-gray-500 bg-[#0A0E27]/30 rounded-xl border border-dashed border-gray-700">
                <p className="mb-2">No active bonuses</p>
                <Link href="/deposit">
                  <a className="text-[#FFD700] hover:text-[#FFA500] text-sm font-bold uppercase tracking-wide border-b border-[#FFD700] pb-0.5">
                    Deposit to claim bonus
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FFD700]/10 via-[#1A1F3A] to-[#1A1F3A] border border-[#FFD700]/30 rounded-2xl p-8 shadow-2xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl group-hover:bg-[#FFD700]/10 transition-all"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-[#FFD700] mb-2 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Invite Friends & Earn Rewards
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Get <span className="text-[#FFD700] font-bold">5%</span> of your friends' first deposit as an instant bonus. Build your royal circle!
            </p>
            <Link href="/referral">
              <a className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0E27] rounded-xl font-bold shadow-lg hover:shadow-[#FFD700]/30 hover:scale-105 transition-all">
                <Users className="w-5 h-5" />
                View Referral Program
              </a>
            </Link>
          </div>
          <div className="hidden lg:block transform rotate-[-10deg] group-hover:rotate-0 transition-transform duration-500">
            <Users className="w-32 h-32 text-[#FFD700]/20 drop-shadow-[0_0_15px_rgba(255,215,0,0.1)]" />
          </div>
        </div>
      </div>
    </div>
  );
}