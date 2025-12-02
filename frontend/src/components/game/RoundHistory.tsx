import { useGameRounds } from '@/hooks/queries/game/useGameRounds'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { History, Circle } from 'lucide-react'

export function RoundHistory() {
  const { data: rounds, isLoading } = useGameRounds({ limit: 20 })

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-[#FFD700]/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#FFD700]">Round History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const recentRounds = rounds?.items || []

  return (
    <Card className="bg-black/40 border-[#FFD700]/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#FFD700] flex items-center gap-2">
          <History className="w-5 h-5" />
          Round History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentRounds.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No rounds yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {recentRounds.map((round) => {
              const winningSide = round.winingSide
              const hasWinner = !!winningSide

              return (
                <div
                  key={round.id}
                  className={`
                    p-3 rounded-lg border transition-all hover:scale-[1.02]
                    ${hasWinner
                      ? winningSide === 'andar'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-gray-500/10 border-gray-500/30'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs font-semibold">
                      Round #{round.roundNumber}
                    </span>
                    {hasWinner ? (
                      <Badge
                        variant={winningSide === 'andar' ? 'destructive' : 'default'}
                        className={`${
                          winningSide === 'andar'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        } text-white`}
                      >
                        {winningSide?.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-500 text-white">
                        NO WINNER
                      </Badge>
                    )}
                  </div>

                  {/* Bet Totals */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                      <span className="text-gray-400">Andar:</span>
                      <span className="text-white font-semibold">
                        ₹{(round.totalAndarBets || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                      <span className="text-gray-400">Bahar:</span>
                      <span className="text-white font-semibold">
                        ₹{(round.totalBaharBets || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payout */}
                  {hasWinner && round.totalPayout > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Payout:</span>
                        <span className="text-green-400 font-semibold">
                          ₹{round.totalPayout.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(round.startedAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pattern Summary */}
        {recentRounds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#FFD700]/20">
            <p className="text-gray-400 text-xs mb-2">Last 10 Rounds:</p>
            <div className="flex flex-wrap gap-1">
              {recentRounds.slice(0, 10).map((round) => (
                <div
                  key={round.id}
                  className={`
                    w-8 h-8 rounded flex items-center justify-center text-xs font-bold
                    ${round.winingSide === 'andar'
                      ? 'bg-red-500 text-white'
                      : round.winingSide === 'bahar'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-500 text-white'
                    }
                  `}
                  title={`Round #${round.roundNumber} - ${
                    round.winingSide ? round.winingSide.toUpperCase() : 'NO WINNER'
                  }`}
                >
                  {round.winingSide === 'andar' ? 'A' : round.winingSide === 'bahar' ? 'B' : '-'}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}