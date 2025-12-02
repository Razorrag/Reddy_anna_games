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
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gold mb-2">Dashboard</h1>
        <p className="text-gold/70">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-royal-medium border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <h3 className="text-gold/70 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gold mb-2">{card.value}</p>
              <p className="text-sm text-gold/50">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/game">
          <a className="block bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 rounded-xl p-6 hover:border-gold/50 transition-all group">
            <PlayCircle className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gold mb-2">Play Game</h3>
            <p className="text-gold/70 text-sm">Join the live Andar Bahar game</p>
          </a>
        </Link>

        <Link href="/deposit">
          <a className="block bg-royal-medium border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all group">
            <ArrowDownRight className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gold mb-2">Deposit</h3>
            <p className="text-gold/70 text-sm">Add funds to your wallet</p>
          </a>
        </Link>

        <Link href="/withdraw">
          <a className="block bg-royal-medium border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all group">
            <ArrowUpRight className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gold mb-2">Withdraw</h3>
            <p className="text-gold/70 text-sm">Withdraw your winnings</p>
          </a>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Games */}
        <div className="bg-royal-medium border border-gold/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gold">Recent Games</h2>
            <Link href="/history">
              <a className="text-gold/70 hover:text-gold text-sm">View All →</a>
            </Link>
          </div>
          <div className="space-y-3">
            {recentGames?.games?.slice(0, 5).map((game: any) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 bg-royal-dark/50 rounded-lg border border-gold/10"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    game.result === 'win' ? 'bg-green-400' : 
                    game.result === 'loss' ? 'bg-red-400' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="text-gold font-medium">Round #{game.roundNumber}</p>
                    <p className="text-gold/50 text-sm">{new Date(game.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    game.result === 'win' ? 'text-green-400' : 
                    game.result === 'loss' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {game.result === 'win' ? '+' : game.result === 'loss' ? '-' : ''}₹{game.amount}
                  </p>
                  <p className="text-gold/50 text-sm capitalize">{game.result}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gold/50">
                <p>No recent games</p>
                <Link href="/game">
                  <a className="text-gold hover:text-gold/80 text-sm mt-2 inline-block">
                    Start playing →
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Bonuses */}
        <div className="bg-royal-medium border border-gold/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gold">Active Bonuses</h2>
            <Link href="/bonuses">
              <a className="text-gold/70 hover:text-gold text-sm">View All →</a>
            </Link>
          </div>
          <div className="space-y-3">
            {bonuses?.bonuses?.slice(0, 5).map((bonus: any) => (
              <div
                key={bonus.id}
                className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <span className="text-gold font-medium capitalize">
                      {bonus.bonusType} Bonus
                    </span>
                  </div>
                  <span className="text-purple-400 font-bold">₹{bonus.amount}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gold/70">Wagering Progress</span>
                    <span className="text-gold">
                      {bonus.wageringCompleted} / {bonus.wageringRequirement}
                    </span>
                  </div>
                  <div className="w-full bg-royal-dark rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
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
              <div className="text-center py-8 text-gold/50">
                <p>No active bonuses</p>
                <Link href="/deposit">
                  <a className="text-gold hover:text-gold/80 text-sm mt-2 inline-block">
                    Make a deposit to earn bonus →
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-gradient-to-r from-gold/10 via-royal-medium to-royal-medium border border-gold/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gold mb-2">Invite Friends & Earn</h2>
            <p className="text-gold/70 mb-4">
              Get 5% of your friends' first deposit as bonus
            </p>
            <Link href="/referral">
              <a className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-royal-dark rounded-lg font-semibold hover:bg-gold/90 transition-all">
                <Users className="w-5 h-5" />
                View Referral Program
              </a>
            </Link>
          </div>
          <div className="hidden lg:block">
            <Users className="w-24 h-24 text-gold/20" />
          </div>
        </div>
      </div>
    </div>
  );
}