import { useState } from 'react';
import { Search, Download, RefreshCw, Eye, Trophy, Users, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameHistoryQuery } from '@/hooks/queries/useGameHistoryQuery';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GameFilters {
  search: string;
  winner: 'all' | 'andar' | 'bahar';
  dateFrom: string;
  dateTo: string;
  sortBy: 'created_desc' | 'created_asc' | 'players_desc' | 'bets_desc';
  page: number;
  limit: number;
}

interface RoundDetailsDialog {
  show: boolean;
  round: any;
}

export default function GameHistory() {
  const [filters, setFilters] = useState<GameFilters>({
    search: '',
    winner: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_desc',
    page: 1,
    limit: 20,
  });
  const [detailsDialog, setDetailsDialog] = useState<RoundDetailsDialog>({
    show: false,
    round: null,
  });

  const { data, isLoading, refetch } = useGameHistoryQuery(filters);

  const rounds = data?.rounds || [];
  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  const handleFilterChange = (key: keyof GameFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    const csv = [
      ['Round', 'Winner', 'Joker Card', 'Players', 'Total Bets', 'Total Amount', 'Payout', 'Started', 'Duration'].join(','),
      ...rounds.map((r: any) => [
        r.round_number,
        r.winner,
        r.joker_card,
        r.player_count,
        r.total_bets,
        r.total_amount,
        r.total_payout,
        format(new Date(r.started_at), 'yyyy-MM-dd HH:mm'),
        r.duration || '-',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWinnerBadge = (winner: string) => {
    return winner === 'andar' ? (
      <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
        ANDAR
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
        BAHAR
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game History</h1>
            <p className="text-gray-400">Complete history of all game rounds</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Rounds', value: data?.total || 0, icon: Trophy, color: 'cyan' },
            { label: 'Andar Wins', value: data?.stats?.andar_wins || 0, icon: Trophy, color: 'amber' },
            { label: 'Bahar Wins', value: data?.stats?.bahar_wins || 0, icon: Trophy, color: 'blue' },
            { label: 'Total Players', value: data?.stats?.total_players || 0, icon: Users, color: 'green' },
            { label: 'Total Wagered', value: `₹${(data?.stats?.total_wagered || 0).toFixed(2)}`, icon: DollarSign, color: 'purple' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by round number or joker card..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Select value={filters.winner} onValueChange={(v) => handleFilterChange('winner', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Winners</SelectItem>
                <SelectItem value="andar">Andar</SelectItem>
                <SelectItem value="bahar">Bahar</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="From Date"
            />

            <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="players_desc">Most Players</SelectItem>
                <SelectItem value="bets_desc">Highest Bets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rounds Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
            </div>
          ) : rounds.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-400 mb-2">No game history found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Round</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Winner</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joker</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Players</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Bets</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Payout</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Started</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Duration</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rounds.map((round: any) => (
                    <tr key={round.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white font-bold">#{round.round_number}</div>
                      </td>
                      <td className="px-4 py-3">{getWinnerBadge(round.winner)}</td>
                      <td className="px-4 py-3">
                        <span className="text-white font-mono text-lg">{round.joker_card}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-cyan-400 font-medium">
                        {round.player_count}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        {round.total_bets}
                      </td>
                      <td className="px-4 py-3 text-right text-green-400 font-bold">
                        ₹{round.total_amount?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-400 font-bold">
                        ₹{round.total_payout?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {format(new Date(round.started_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {round.duration || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => setDetailsDialog({ show: true, round })}
                          size="sm"
                          variant="ghost"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data?.total || 0)} of {data?.total || 0} rounds
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={filters.page === 1}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => setFilters(prev => ({ ...prev, page }))}
                    variant={filters.page === page ? 'default' : 'outline'}
                    size="sm"
                    className={filters.page === page
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'border-white/10 text-white'
                    }
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page === totalPages}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Round Details Dialog */}
        {detailsDialog.show && detailsDialog.round && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDetailsDialog({ show: false, round: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0E27] border border-white/10 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Round #{detailsDialog.round.round_number} Details
                </h3>
                <Button
                  onClick={() => setDetailsDialog({ show: false, round: null })}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  ✕
                </Button>
              </div>

              {/* Round Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Winner</div>
                  {getWinnerBadge(detailsDialog.round.winner)}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Joker Card</div>
                  <div className="text-white text-2xl font-mono">{detailsDialog.round.joker_card}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Players</div>
                  <div className="text-cyan-400 text-xl font-bold">{detailsDialog.round.player_count}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Bets</div>
                  <div className="text-white text-xl font-bold">{detailsDialog.round.total_bets}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Amount</div>
                  <div className="text-green-400 text-xl font-bold">
                    ₹{detailsDialog.round.total_amount?.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Payout</div>
                  <div className="text-amber-400 text-xl font-bold">
                    ₹{detailsDialog.round.total_payout?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Bet Distribution */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">Bet Distribution</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="text-amber-400 text-sm mb-2">Andar Bets</div>
                    <div className="text-white text-2xl font-bold">
                      ₹{detailsDialog.round.andar_amount?.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {detailsDialog.round.andar_bets} bets ({detailsDialog.round.andar_percentage}%)
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="text-blue-400 text-sm mb-2">Bahar Bets</div>
                    <div className="text-white text-2xl font-bold">
                      ₹{detailsDialog.round.bahar_amount?.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {detailsDialog.round.bahar_bets} bets ({detailsDialog.round.bahar_percentage}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Started:</span>
                    <span className="text-white">
                      {format(new Date(detailsDialog.round.started_at), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                  {detailsDialog.round.completed_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Completed:</span>
                      <span className="text-white">
                        {format(new Date(detailsDialog.round.completed_at), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{detailsDialog.round.duration || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}