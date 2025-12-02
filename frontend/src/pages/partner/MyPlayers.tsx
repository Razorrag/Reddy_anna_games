import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  Activity,
  Calendar,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyPlayersQuery } from '@/hooks/queries/useMyPlayersQuery';
import { Link } from 'wouter';

type FilterType = 'all' | 'active' | 'inactive' | 'verified' | 'unverified';
type SortType = 'recent' | 'wagered' | 'earnings' | 'games';

export default function MyPlayers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');
  const [page, setPage] = useState(1);
  
  const { data: players, isLoading } = useMyPlayersQuery({ search, filter, sort, page });

  const exportData = () => {
    if (!players?.players) return;
    
    const csvData = [
      ['Name', 'Phone', 'Status', 'Joined Date', 'Total Wagered', 'Games Played', 'Commission Earned'],
      ...players.players.map((player: any) => [
        player.name,
        player.phone,
        player.status,
        player.joinedDate,
        player.totalWagered,
        player.gamesPlayed,
        player.commissionEarned
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-players-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading players...</p>
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
            My Players
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and track your referred players
          </p>
        </div>

        <Button
          onClick={exportData}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Players"
          value={players?.stats.total.toString() || '0'}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Active Players"
          value={players?.stats.active.toString() || '0'}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Total Wagered"
          value={`₹${(players?.stats.totalWagered || 0).toLocaleString()}`}
          icon={DollarSign}
          color="gold"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${(players?.stats.totalEarnings || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0A0E27] border-cyan-500/30"
            />
          </div>

          <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <SelectTrigger className="bg-[#0A0E27] border-cyan-500/30">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Players</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => setSort(value as SortType)}>
            <SelectTrigger className="bg-[#0A0E27] border-cyan-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Joined</SelectItem>
              <SelectItem value="wagered">Highest Wagered</SelectItem>
              <SelectItem value="earnings">Highest Earnings</SelectItem>
              <SelectItem value="games">Most Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Players List */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left text-gray-400 font-medium pb-4">Player</th>
                <th className="text-left text-gray-400 font-medium pb-4">Status</th>
                <th className="text-left text-gray-400 font-medium pb-4">Joined</th>
                <th className="text-left text-gray-400 font-medium pb-4">Total Wagered</th>
                <th className="text-left text-gray-400 font-medium pb-4">Games</th>
                <th className="text-left text-gray-400 font-medium pb-4">Commission</th>
                <th className="text-left text-gray-400 font-medium pb-4">Last Active</th>
                <th className="text-left text-gray-400 font-medium pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players?.players.map((player: any, index: number) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-cyan-500/10 hover:bg-[#0A0E27] transition-colors"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {player.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{player.name}</p>
                        <p className="text-gray-400 text-sm">{player.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge variant={player.status === 'active' ? 'success' : 'default'}>
                      {player.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {player.joinedDate}
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-cyan-400 font-bold">
                      ₹{player.totalWagered.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="text-white">{player.gamesPlayed}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-green-400 font-bold">
                      ₹{player.commissionEarned.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${
                        player.lastActive === 'Online' ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <span className="text-gray-400 text-sm">{player.lastActive}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:text-cyan-300"
                      asChild
                    >
                      <Link href={`/partner/players/${player.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {(!players?.players || players.players.length === 0) && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg mb-2">No players found</p>
              <p className="text-gray-500 text-sm">
                {search ? 'Try adjusting your search or filters' : 'Start referring players to see them here'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {players?.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-cyan-500/20">
            <p className="text-gray-400 text-sm">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, players.total)} of {players.total} players
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="border-cyan-500/30"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, players.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={page === pageNum ? 'bg-cyan-500' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === players.totalPages}
                className="border-cyan-500/30"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Top Performers */}
      <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Top Performers This Month
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {players?.topPerformers.map((player: any, index: number) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0A0E27] rounded-lg p-6 border border-cyan-500/20 relative"
            >
              {index === 0 && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  🏆
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {player.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold">{player.name}</p>
                  <p className="text-gray-400 text-sm">{player.phone}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Wagered</span>
                  <span className="text-cyan-400 font-bold">
                    ₹{player.wagered.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Games</span>
                  <span className="text-white font-bold">{player.games}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Your Earnings</span>
                  <span className="text-green-400 font-bold">
                    ₹{player.earnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  color: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    gold: 'from-amber-500 to-yellow-600',
    amber: 'from-amber-500 to-orange-600'
  };

  return (
    <Card className="bg-[#1a1f3a] border-cyan-500/30 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
}