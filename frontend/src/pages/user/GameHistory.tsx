import { useState } from 'react';
import { useLocation } from 'wouter';
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
  const [, setLocation] = useLocation();
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
    <div className="min-h-screen bg-[#0A0E27] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1E40AF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="bg-[#1A1F3A]/80 backdrop-blur-md border-b border-[#FFD700]/20 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/game')}
                className="text-white hover:text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                ← Back
              </Button>
              <History className="w-8 h-8 text-[#FFD700]" />
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] drop-shadow-sm">
                Game History
              </h1>
            </div>
            <Button
              variant="premium-gold"
              onClick={handleExportCSV}
              disabled={games.length === 0}
              className="gap-2 shadow-glow-gold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all hover:-translate-y-1 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FFD700]/10 rounded-xl border border-[#FFD700]/20 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                  <Target className="w-8 h-8 text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Games</p>
                  <p className="text-3xl font-black text-white">{stats.totalGames}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all hover:-translate-y-1 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <Award className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Win Rate</p>
                  <p className="text-3xl font-black text-white">
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
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all hover:-translate-y-1 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#00F5FF]/10 rounded-xl border border-[#00F5FF]/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                  <IndianRupee className="w-8 h-8 text-[#00F5FF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Wagered</p>
                  <p className="text-3xl font-black text-white flex items-center gap-1">
                    <span className="text-lg text-gray-500">₹</span>
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
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 hover:bg-[#1A1F3A]/80 transition-all hover:-translate-y-1 shadow-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border shadow-[0_0_15px_rgba(0,0,0,0.1)] ${stats.netProfit >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  {stats.netProfit >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Net P/L</p>
                  <p className={`text-3xl font-black flex items-center gap-1 ${
                    stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <span className="text-lg opacity-70">₹</span>
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
          <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6 border-b border-[#FFD700]/10 pb-4">
              <Filter className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Filter History</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-[#FFD700] font-bold mb-2 block uppercase tracking-wide">Outcome</label>
                <Select value={outcomeFilter} onValueChange={(value: any) => setOutcomeFilter(value)}>
                  <SelectTrigger className="bg-[#0A0E27] border-[#FFD700]/30 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F3A] border-[#FFD700]/30 text-white">
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="win">Wins Only</SelectItem>
                    <SelectItem value="loss">Losses Only</SelectItem>
                    <SelectItem value="refund">Refunds Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[#FFD700] font-bold mb-2 block uppercase tracking-wide">Date Range</label>
                <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                  <SelectTrigger className="bg-[#0A0E27] border-[#FFD700]/30 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F3A] border-[#FFD700]/30 text-white">
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
          <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 overflow-hidden shadow-2xl">
            {games.length === 0 ? (
              <div className="p-16 text-center bg-[#0A0E27]/30">
                <div className="w-24 h-24 rounded-full bg-[#FFD700]/5 flex items-center justify-center mx-auto mb-6 border border-[#FFD700]/10">
                  <History className="w-12 h-12 text-[#FFD700]/30" />
                </div>
                <p className="text-gray-300 text-xl font-bold mb-2">No games played yet</p>
                <p className="text-gray-500 text-sm mb-8">
                  {outcomeFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start playing to see your game history'}
                </p>
                <Button variant="premium-gold" onClick={() => setLocation('/game')} className="gap-2 shadow-lg">
                  <Target className="w-4 h-4" />
                  Play Now
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#0A0E27]/80">
                    <TableRow className="border-[#FFD700]/20 hover:bg-transparent">
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Date & Time</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Round ID</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Bet Side</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Bet Amount</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Winner</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Outcome</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider">Payout</TableHead>
                      <TableHead className="text-[#FFD700] font-bold uppercase tracking-wider text-right">P/L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game: any) => {
                      const profitLoss = game.payout - game.betAmount;
                      return (
                        <TableRow
                          key={game.id}
                          className="border-[#FFD700]/10 hover:bg-[#FFD700]/5 transition-colors"
                        >
                          <TableCell className="text-white">
                            <div className="flex flex-col">
                              <span className="font-bold">{format(new Date(game.createdAt), 'MMM dd, yyyy')}</span>
                              <span className="text-xs text-gray-400 font-mono">
                                {format(new Date(game.createdAt), 'hh:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 font-mono text-xs">
                            #{game.roundId.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getSideColor(game.betSide)} bg-opacity-10 border border-opacity-20 font-bold`}>
                              {game.betSide.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-bold">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3 text-gray-500" />
                              {game.betAmount.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {game.winner ? (
                              <Badge className={`${getSideColor(game.winner)} bg-opacity-10 border border-opacity-20 font-bold`}>
                                {game.winner.toUpperCase()}
                              </Badge>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getOutcomeBadge(game.outcome, game.payout)}</TableCell>
                          <TableCell className="text-white font-bold">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3 text-gray-500" />
                              {game.payout.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 font-bold text-lg ${
                              profitLoss > 0 ? 'text-green-400' : profitLoss < 0 ? 'text-red-400' : 'text-gray-500'
                            }`}>
                              <span className="text-xs opacity-70">₹</span>
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
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 shadow-lg">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FFD700]" />
                Win/Loss Breakdown
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#0A0E27]/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-gray-300">Games Won</span>
                  </div>
                  <span className="text-white font-bold text-lg">{stats.gamesWon}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A0E27]/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-full">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-gray-300">Games Lost</span>
                  </div>
                  <span className="text-white font-bold text-lg">{stats.gamesLost}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A0E27]/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-500/10 rounded-full">
                      <Circle className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-gray-300">Refunds</span>
                  </div>
                  <span className="text-white font-bold text-lg">
                    {stats.totalGames - stats.gamesWon - stats.gamesLost}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 p-6 shadow-lg">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#FFD700]" />
                Financial Summary
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2">
                  <span className="text-gray-400">Total Wagered</span>
                  <span className="text-white font-bold text-lg flex items-center gap-1">
                    <span className="text-sm text-gray-600">₹</span>
                    {stats.totalWagered.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-gray-400">Total Winnings</span>
                  <span className="text-green-400 font-bold text-lg flex items-center gap-1">
                    <span className="text-sm text-green-400/50">₹</span>
                    {stats.totalWinnings.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-t border-[#FFD700]/20 pt-4 mt-2 flex items-center justify-between">
                  <span className="text-white font-bold uppercase tracking-wide">Net Result</span>
                  <span className={`font-black text-2xl flex items-center gap-1 ${
                    stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span className="text-base opacity-70">₹</span>
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