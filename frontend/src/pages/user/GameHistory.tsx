import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  History,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Circle,
  IndianRupee,
  Calendar,
  Clock,
  Award,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserGameHistory } from '@/hooks/queries/game/useUserGameHistory';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

type OutcomeFilter = 'all' | 'win' | 'loss' | 'refund';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function GameHistory() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const { data: gameHistory, isLoading } = useUserGameHistory(user?.id || '', {
    outcome: outcomeFilter === 'all' ? undefined : outcomeFilter,
    period: dateFilter === 'all' ? undefined : dateFilter,
  });

  const getOutcomeBadge = (outcome: string, payout: number) => {
    if (outcome === 'win') {
      return (
        <Badge variant="success" className="gap-1">
          <TrendingUp className="w-3 h-3" />
          Won
        </Badge>
      );
    } else if (outcome === 'loss') {
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingDown className="w-3 h-3" />
          Lost
        </Badge>
      );
    } else if (outcome === 'refund') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Circle className="w-3 h-3" />
          Refund
        </Badge>
      );
    }
    return <Badge variant="secondary">{outcome}</Badge>;
  };

  const getSideColor = (side: string) => {
    return side === 'andar' ? 'text-red-500' : 'text-blue-500';
  };

  const handleExportCSV = () => {
    if (!gameHistory || gameHistory.games.length === 0) return;

    const headers = ['Date', 'Time', 'Round ID', 'Bet Side', 'Bet Amount', 'Outcome', 'Payout', 'Net Profit/Loss'];
    const rows = gameHistory.games.map((game: any) => [
      format(new Date(game.createdAt), 'yyyy-MM-dd'),
      format(new Date(game.createdAt), 'HH:mm:ss'),
      game.roundId,
      game.betSide,
      game.betAmount,
      game.outcome,
      game.payout,
      game.payout - game.betAmount,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading game history...</div>
      </div>
    );
  }

  const games = gameHistory?.games || [];
  const stats = gameHistory?.stats || {
    totalGames: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalWagered: 0,
    totalWinnings: 0,
    netProfit: 0,
  };

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/game')}
                className="text-white hover:text-[#FFD700]"
              >
                ← Back
              </Button>
              <History className="w-8 h-8 text-[#FFD700]" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Game History</h1>
            </div>
            <Button
              variant="gold"
              onClick={handleExportCSV}
              disabled={games.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFD700]/10 rounded-lg">
                  <Target className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Games</p>
                  <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Award className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalGames > 0
                      ? ((stats.gamesWon / stats.totalGames) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#00F5FF]/10 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-[#00F5FF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Wagered</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {stats.totalWagered.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stats.netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {stats.netProfit >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Net Profit/Loss</p>
                  <p className={`text-2xl font-bold flex items-center gap-1 ${
                    stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <IndianRupee className="w-5 h-5" />
                    {stats.netProfit >= 0 ? '+' : ''}
                    {stats.netProfit.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Outcome</label>
                <Select value={outcomeFilter} onValueChange={(value: any) => setOutcomeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="win">Wins Only</SelectItem>
                    <SelectItem value="loss">Losses Only</SelectItem>
                    <SelectItem value="refund">Refunds Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Games Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 overflow-hidden">
            {games.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No games played yet</p>
                <p className="text-gray-500 text-sm mb-6">
                  {outcomeFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start playing to see your game history'}
                </p>
                <Button variant="gold" onClick={() => navigate('/game')} className="gap-2">
                  <Target className="w-4 h-4" />
                  Play Now
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#FFD700]/20 hover:bg-[#2a2f4a]/50">
                      <TableHead className="text-[#FFD700]">Date & Time</TableHead>
                      <TableHead className="text-[#FFD700]">Round ID</TableHead>
                      <TableHead className="text-[#FFD700]">Bet Side</TableHead>
                      <TableHead className="text-[#FFD700]">Bet Amount</TableHead>
                      <TableHead className="text-[#FFD700]">Winner</TableHead>
                      <TableHead className="text-[#FFD700]">Outcome</TableHead>
                      <TableHead className="text-[#FFD700]">Payout</TableHead>
                      <TableHead className="text-[#FFD700]">Profit/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game: any) => {
                      const profitLoss = game.payout - game.betAmount;
                      return (
                        <TableRow
                          key={game.id}
                          className="border-[#FFD700]/10 hover:bg-[#2a2f4a]/50"
                        >
                          <TableCell className="text-white">
                            <div className="flex flex-col">
                              <span>{format(new Date(game.createdAt), 'MMM dd, yyyy')}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(game.createdAt), 'hh:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 font-mono text-sm">
                            #{game.roundId.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getSideColor(game.betSide)}>
                              {game.betSide.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-semibold">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {game.betAmount.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {game.winner ? (
                              <Badge className={getSideColor(game.winner)}>
                                {game.winner.toUpperCase()}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getOutcomeBadge(game.outcome, game.payout)}</TableCell>
                          <TableCell className="text-white font-semibold">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {game.payout.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 font-semibold ${
                              profitLoss > 0 ? 'text-green-500' : profitLoss < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              <IndianRupee className="w-4 h-4" />
                              {profitLoss > 0 ? '+' : ''}
                              {profitLoss.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Additional Stats */}
        {games.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Win/Loss Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Games Won</span>
                  </div>
                  <span className="text-white font-semibold">{stats.gamesWon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-gray-400">Games Lost</span>
                  </div>
                  <span className="text-white font-semibold">{stats.gamesLost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Refunds</span>
                  </div>
                  <span className="text-white font-semibold">
                    {stats.totalGames - stats.gamesWon - stats.gamesLost}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Financial Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Wagered</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {stats.totalWagered.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Winnings</span>
                  <span className="text-green-500 font-semibold flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {stats.totalWinnings.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-t border-[#FFD700]/20 pt-3 flex items-center justify-between">
                  <span className="text-white font-semibold">Net Result</span>
                  <span className={`font-bold text-xl flex items-center gap-1 ${
                    stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <IndianRupee className="w-5 h-5" />
                    {stats.netProfit >= 0 ? '+' : ''}
                    {stats.netProfit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}