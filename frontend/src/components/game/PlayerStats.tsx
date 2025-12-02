import { useAuthStore } from '@/store/authStore'
import { useUserStatistics } from '@/hooks/queries/user/useUserStatistics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Target, TrendingUp, Flame, Award } from 'lucide-react'

export function PlayerStats() {
  const { user } = useAuthStore()
  const { data: stats, isLoading } = useUserStatistics(user?.id)

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-[#FFD700]/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#FFD700]">Your Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const winRate = stats.totalGamesPlayed > 0
    ? ((stats.totalWins / stats.totalGamesPlayed) * 100).toFixed(1)
    : '0.0'

  const netProfit = (stats.totalAmountWon || 0) - (stats.totalAmountLost || 0)
  const isProfitable = netProfit > 0

  return (
    <Card className="bg-black/40 border-[#FFD700]/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#FFD700] flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Win Rate */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <Target className="w-4 h-4" />
              Win Rate
            </span>
            <span className="text-green-400 font-bold text-xl">{winRate}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* Games Played */}
        <div className="bg-black/30 border border-[#FFD700]/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Award className="w-4 h-4" />
              Games Played
            </span>
            <span className="text-white font-bold">{stats.totalGamesPlayed}</span>
          </div>
        </div>

        {/* Wins & Losses */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
            <p className="text-green-400 text-xs mb-1">Wins</p>
            <p className="text-green-400 font-bold text-lg">{stats.totalWins}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            <p className="text-red-400 text-xs mb-1">Losses</p>
            <p className="text-red-400 font-bold text-lg">{stats.totalLosses}</p>
          </div>
        </div>

        {/* Current Streak */}
        {stats.currentStreak !== 0 && (
          <div className={`${
            stats.currentStreak > 0
              ? 'bg-orange-500/20 border-orange-500/30'
              : 'bg-blue-500/20 border-blue-500/30'
          } border rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <span className={`${
                stats.currentStreak > 0 ? 'text-orange-400' : 'text-blue-400'
              } text-sm flex items-center gap-1`}>
                <Flame className="w-4 h-4" />
                Current Streak
              </span>
              <span className={`${
                stats.currentStreak > 0 ? 'text-orange-400' : 'text-blue-400'
              } font-bold text-lg`}>
                {Math.abs(stats.currentStreak)} {stats.currentStreak > 0 ? 'W' : 'L'}
              </span>
            </div>
          </div>
        )}

        {/* Net Profit/Loss */}
        <div className={`${
          isProfitable
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        } border rounded-lg p-3`}>
          <div className="flex items-center justify-between">
            <span className={`${
              isProfitable ? 'text-green-400' : 'text-red-400'
            } text-sm flex items-center gap-1`}>
              <TrendingUp className="w-4 h-4" />
              Net {isProfitable ? 'Profit' : 'Loss'}
            </span>
            <span className={`${
              isProfitable ? 'text-green-400' : 'text-red-400'
            } font-bold text-lg`}>
              {isProfitable ? '+' : ''}₹{Math.abs(netProfit).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Best Streak */}
        {stats.longestWinStreak > 0 && (
          <div className="text-center pt-2 border-t border-[#FFD700]/20">
            <p className="text-gray-400 text-xs">Best Win Streak</p>
            <p className="text-[#FFD700] font-bold">🏆 {stats.longestWinStreak} games</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}