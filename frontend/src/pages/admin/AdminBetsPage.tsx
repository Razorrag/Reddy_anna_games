import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { websocketService } from '@/lib/websocket';

export function AdminBetsPage() {
  const [, setLocation] = useLocation();
  const { round1Bets, round2Bets, roundNumber, roundPhase, isConnected } = useGameStore();
  const [realtimeStats, setRealtimeStats] = useState<{
    roundId: string;
    totalAndarBets: string;
    totalBaharBets: string;
    totalBetAmount: string;
  } | null>(null);

  // Listen to real-time WebSocket updates (admin-only event)
  useEffect(() => {
    const handleAdminRoundStats = (event: CustomEvent) => {
      const data = event.detail;
      console.log('📊 [AdminBetsPage] Received real-time stats:', data);
      setRealtimeStats(data);
    };

    window.addEventListener('admin:round_stats', handleAdminRoundStats as EventListener);

    return () => {
      window.removeEventListener('admin:round_stats', handleAdminRoundStats as EventListener);
    };
  }, []);

  // Calculate cumulative bets (Round 1 + Round 2)
  const round1Andar = round1Bets.andar || 0;
  const round1Bahar = round1Bets.bahar || 0;
  const round2Andar = round2Bets.andar || 0;
  const round2Bahar = round2Bets.bahar || 0;
  
  const cumulativeAndar = round1Andar + round2Andar;
  const cumulativeBahar = round1Bahar + round2Bahar;
  const totalCumulativeBets = cumulativeAndar + cumulativeBahar;

  // Determine LOW BET side
  const lowSide = 
    totalCumulativeBets === 0 ? null :
    cumulativeAndar < cumulativeBahar ? 'andar' :
    cumulativeBahar < cumulativeAndar ? 'bahar' :
    'equal';

  const lowBetAmount = lowSide === 'andar' ? cumulativeAndar : lowSide === 'bahar' ? cumulativeBahar : 0;
  const betDifference = Math.abs(cumulativeAndar - cumulativeBahar);

  // Get phase display text
  const phaseText = roundPhase === 'betting' ? 'BETTING OPEN' :
                    roundPhase === 'dealing' ? 'DEALING CARDS' :
                    roundPhase === 'complete' ? 'ROUND COMPLETE' :
                    roundPhase === 'no_winner' ? 'NO WINNER' :
                    'IDLE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="bg-black/40 backdrop-blur-sm border-gold/30 shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation('/admin/game-control')}
                variant="outline"
                className="bg-slate-800 hover:bg-slate-700 border-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Control
              </Button>
              
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Live Betting Monitor</h1>
                <Badge variant={isConnected ? 'default' : 'destructive'} className="animate-pulse">
                  {isConnected ? '🟢 LIVE' : '🔴 DISCONNECTED'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-gold/10 border-gold/30 text-gold text-lg px-4 py-2">
                Round {roundNumber}
              </Badge>
              <Badge variant="outline" className="bg-purple-600/20 border-purple-500/40 text-purple-200 text-lg px-4 py-2">
                {phaseText}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Main LOW BET Display */}
        <Card className="mb-6 overflow-hidden">
          {totalCumulativeBets === 0 ? (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-16 text-center">
              <div className="text-8xl mb-6">⚖️</div>
              <h2 className="text-4xl font-bold text-gray-300 mb-4">No Bets Placed Yet</h2>
              <p className="text-gray-400 text-xl">Waiting for players to place bets...</p>
            </div>
          ) : lowSide === 'equal' ? (
            <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-4 border-yellow-500/50 p-16 text-center">
              <div className="text-8xl mb-6">⚖️</div>
              <h2 className="text-4xl font-bold text-yellow-300 mb-4">Both Sides Equal</h2>
              <p className="text-gray-300 text-2xl">
                ₹{cumulativeAndar.toLocaleString('en-IN')} each (Total Game)
              </p>
            </div>
          ) : (
            <div className={`relative bg-gradient-to-br p-16 border-4 ${
              lowSide === 'andar' 
                ? 'from-red-900/60 to-red-800/60 border-red-500' 
                : 'from-blue-900/60 to-blue-800/60 border-blue-500'
            }`}>
              {/* LOW BET Badge */}
              <div className="absolute top-6 right-6">
                <Badge className="bg-yellow-500/30 border-2 border-yellow-500 text-yellow-300 text-lg px-6 py-3 animate-pulse">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  LOW BET SIDE
                </Badge>
              </div>

              {/* Side Name */}
              <div className="text-center mb-8">
                <h2 className={`text-7xl font-black uppercase tracking-wider mb-4 ${
                  lowSide === 'andar' ? 'text-red-300' : 'text-blue-300'
                }`}>
                  {lowSide === 'andar' ? '🔴 ANDAR (RED)' : '🔵 BAHAR (BLUE)'}
                </h2>
                <div className={`h-2 w-48 mx-auto rounded-full ${
                  lowSide === 'andar' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
              </div>

              {/* Amount Display */}
              <div className="text-center">
                <p className={`text-lg uppercase tracking-wide mb-4 ${
                  lowSide === 'andar' ? 'text-red-200' : 'text-blue-200'
                }`}>
                  Total Game Bets (All Rounds Combined)
                </p>
                <div className={`text-9xl font-black mb-6 ${
                  lowSide === 'andar' ? 'text-red-300' : 'text-blue-300'
                }`}>
                  ₹{lowBetAmount.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-center gap-8 text-3xl mb-6">
                  <div className={lowSide === 'andar' ? 'text-red-100' : 'text-blue-100'}>
                    {((lowBetAmount / totalCumulativeBets) * 100).toFixed(1)}% of total
                  </div>
                  <div className={lowSide === 'andar' ? 'text-red-200/70' : 'text-blue-200/70'}>
                    {lowSide === 'andar' ? <TrendingDown className="w-10 h-10" /> : <TrendingDown className="w-10 h-10" />}
                  </div>
                </div>
                <div className={`text-xl pt-6 border-t ${
                  lowSide === 'andar' ? 'text-red-200/70 border-red-500/30' : 'text-blue-200/70 border-blue-500/30'
                }`}>
                  Round 1: ₹{(lowSide === 'andar' ? round1Andar : round1Bahar).toLocaleString('en-IN')} • 
                  Round 2: ₹{(lowSide === 'andar' ? round2Andar : round2Bahar).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Andar Total */}
          <Card className="bg-gradient-to-br from-red-900/40 to-red-800/40 border-red-500/30 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-sm text-gray-300 uppercase tracking-wide">Total Andar (All Rounds)</p>
            </div>
            <div className="text-6xl font-black text-red-300 mb-4">
              ₹{cumulativeAndar.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Round 1: ₹{round1Andar.toLocaleString('en-IN')}</p>
              <p>Round 2: ₹{round2Andar.toLocaleString('en-IN')}</p>
            </div>
            {totalCumulativeBets > 0 && (
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <p className="text-2xl font-bold text-red-200">
                  {((cumulativeAndar / totalCumulativeBets) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </Card>

          {/* Bahar Total */}
          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/30 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-sm text-gray-300 uppercase tracking-wide">Total Bahar (All Rounds)</p>
            </div>
            <div className="text-6xl font-black text-blue-300 mb-4">
              ₹{cumulativeBahar.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Round 1: ₹{round1Bahar.toLocaleString('en-IN')}</p>
              <p>Round 2: ₹{round2Bahar.toLocaleString('en-IN')}</p>
            </div>
            {totalCumulativeBets > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-2xl font-bold text-blue-200">
                  {((cumulativeBahar / totalCumulativeBets) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </Card>

          {/* Bet Difference */}
          <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-gold/30 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-gold" />
              <p className="text-sm text-gray-300 uppercase tracking-wide">Bet Difference</p>
            </div>
            <div className="text-6xl font-black text-gold mb-4">
              ₹{betDifference.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-400">(High Side - Low Side)</p>
            {totalCumulativeBets > 0 && (
              <div className="mt-4 pt-4 border-t border-gold/20">
                <p className="text-xl font-semibold text-gold">
                  {lowSide === 'andar' ? 'Bahar Leading' : lowSide === 'bahar' ? 'Andar Leading' : 'Balanced'}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-black/40 backdrop-blur-sm border-gold/30 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">About This Page</h3>
              <p className="text-gray-400 leading-relaxed">
                This page shows <strong className="text-gold">cumulative betting statistics</strong> across all game rounds (Round 1 + Round 2).
                The <strong className="text-yellow-300">LOW BET indicator</strong> highlights the side with fewer total bets, 
                helping you make strategic decisions for balanced gameplay and better user experience.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}