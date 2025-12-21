import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface BetsOverviewProps {
  roundNumber: number;
  phase: 'idle' | 'betting' | 'dealing' | 'completed';
  totalBets: number;
  totalBetAmount: number;
  andarBets: {
    count: number;
    amount: number;
    percentage: number;
  };
  baharBets: {
    count: number;
    amount: number;
    percentage: number;
  };
  recentBets?: Array<{
    id: string;
    userId: string;
    userName?: string;
    side: 'andar' | 'bahar';
    amount: number;
    timestamp: string;
  }>;
}

function BetsOverview({
  roundNumber,
  phase,
  totalBets,
  totalBetAmount,
  andarBets,
  baharBets,
  recentBets = []
}: BetsOverviewProps) {
  // Determine which side has advantage
  const andarAdvantage = andarBets.amount > baharBets.amount;
  const difference = Math.abs(andarBets.amount - baharBets.amount);
  const differencePercentage = totalBetAmount > 0 
    ? ((difference / totalBetAmount) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-2">Betting Overview</h3>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
            Round {roundNumber}
          </Badge>
          <Badge variant="outline" className={`
            ${phase === 'betting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : ''}
            ${phase === 'dealing' ? 'bg-green-500/20 text-green-400 border-green-500/50' : ''}
            ${phase === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : ''}
            ${phase === 'idle' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' : ''}
          `}>
            {phase.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Total Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Total Bets</div>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">{totalBets}</div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Total Amount</div>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">₹{totalBetAmount.toFixed(2)}</div>
        </Card>
      </div>

      {/* Andar vs Bahar Comparison */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-4">Side Distribution</h4>
        
        {/* Andar Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-white font-medium">Andar</span>
              {andarAdvantage && (
                <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Leading
                </Badge>
              )}
            </div>
            <span className="text-gray-400 text-sm">{andarBets.count} bets</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/30 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${andarBets.percentage}%` }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
              />
            </div>
            <span className="text-amber-400 font-bold text-sm w-16 text-right">
              {andarBets.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-amber-400 font-bold text-lg mt-1">
            ₹{andarBets.amount.toFixed(2)}
          </div>
        </div>

        {/* Bahar Stats */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white font-medium">Bahar</span>
              {!andarAdvantage && difference > 0 && (
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Leading
                </Badge>
              )}
            </div>
            <span className="text-gray-400 text-sm">{baharBets.count} bets</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/30 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${baharBets.percentage}%` }}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
              />
            </div>
            <span className="text-blue-400 font-bold text-sm w-16 text-right">
              {baharBets.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-blue-400 font-bold text-lg mt-1">
            ₹{baharBets.amount.toFixed(2)}
          </div>
        </div>

        {/* Advantage Indicator */}
        {difference > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {andarAdvantage ? (
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-gray-400 text-sm">Advantage:</span>
              </div>
              <div className={`font-bold ${andarAdvantage ? 'text-amber-400' : 'text-blue-400'}`}>
                {andarAdvantage ? 'ANDAR' : 'BAHAR'} +₹{difference.toFixed(2)} ({differencePercentage}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bets Activity */}
      {recentBets.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {recentBets.slice(0, 10).map((bet, idx) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    bet.side === 'andar' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {bet.userName || `User ${bet.userId.slice(-4)}`}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(bet.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    bet.side === 'andar' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {bet.side.toUpperCase()}
                  </div>
                  <div className="text-cyan-400 text-xs">₹{bet.amount}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Payout Information */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-purple-400 mb-3">Round {roundNumber} Payout Rules</h4>
        {roundNumber === 1 && (
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Andar wins: <span className="text-amber-400 font-bold">1:1 (double)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Bahar wins: <span className="text-blue-400 font-bold">1:0 (refund only)</span></span>
            </div>
          </div>
        )}
        {roundNumber === 2 && (
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Andar wins: <span className="text-amber-400 font-bold">1:1 on all Andar bets (R1+R2)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Bahar wins: <span className="text-blue-400 font-bold">1:1 on R1 + 1:0 on R2</span></span>
            </div>
          </div>
        )}
        {roundNumber >= 3 && (
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Both sides: <span className="text-green-400 font-bold">1:1 on all bets</span></span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.7);
        }
      `}</style>
    </div>
  );
}

export { BetsOverview };
export default BetsOverview;