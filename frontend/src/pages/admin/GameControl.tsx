import { useState } from 'react';
import { Play, Square, RefreshCw, Users, DollarSign, Clock, Trophy, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStateQuery } from '@/hooks/queries/useGameStateQuery';
import { useStartRoundMutation } from '@/hooks/mutations/useStartRoundMutation';
import { useStopRoundMutation } from '@/hooks/mutations/useStopRoundMutation';
import { useDeclareWinnerMutation } from '@/hooks/mutations/useDeclareWinnerMutation';
import { useEmergencyStopMutation } from '@/hooks/mutations/useEmergencyStopMutation';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ManualWinnerDialog {
  show: boolean;
  winner: 'andar' | 'bahar' | '';
  jokerCard: string;
}

export default function GameControl() {
  const [manualWinner, setManualWinner] = useState<ManualWinnerDialog>({
    show: false,
    winner: '',
    jokerCard: '',
  });
  const [showEmergencyStop, setShowEmergencyStop] = useState(false);

  const { data: gameState, isLoading, refetch } = useGameStateQuery();
  const startRoundMutation = useStartRoundMutation();
  const stopRoundMutation = useStopRoundMutation();
  const declareWinnerMutation = useDeclareWinnerMutation();
  const emergencyStopMutation = useEmergencyStopMutation();

  const handleStartRound = async () => {
    try {
      await startRoundMutation.mutateAsync();
      toast.success('Round started successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start round');
    }
  };

  const handleStopBetting = async () => {
    try {
      await stopRoundMutation.mutateAsync();
      toast.success('Betting stopped, waiting for result');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop betting');
    }
  };

  const handleDeclareWinner = async () => {
    if (!manualWinner.winner || !manualWinner.jokerCard) {
      toast.error('Please select winner and joker card');
      return;
    }

    try {
      await declareWinnerMutation.mutateAsync({
        winner: manualWinner.winner,
        jokerCard: manualWinner.jokerCard,
      });
      toast.success('Winner declared successfully');
      setManualWinner({ show: false, winner: '', jokerCard: '' });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to declare winner');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await emergencyStopMutation.mutateAsync();
      toast.success('Emergency stop executed, all bets refunded');
      setShowEmergencyStop(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute emergency stop');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      idle: 'default',
      betting: 'warning',
      playing: 'success',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];

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
            <h1 className="text-3xl font-bold text-white mb-2">Live Game Control</h1>
            <p className="text-gray-400">Manage the current game round in real-time</p>
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
              onClick={() => setShowEmergencyStop(true)}
              variant="outline"
              size="sm"
              className="border-red-500/20 text-red-400"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-white">
                Round #{gameState?.currentRound?.round_number || '-'}
              </div>
              {getStatusBadge(gameState?.status || 'idle')}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>
                {gameState?.currentRound?.started_at
                  ? format(new Date(gameState.currentRound.started_at), 'HH:mm:ss')
                  : 'Not started'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: 'Active Players',
                value: gameState?.stats?.active_players || 0,
                icon: Users,
                color: 'cyan',
              },
              {
                label: 'Total Bets',
                value: gameState?.stats?.total_bets || 0,
                icon: DollarSign,
                color: 'green',
              },
              {
                label: 'Andar Bets',
                value: `₹${(gameState?.stats?.andar_amount || 0).toFixed(2)}`,
                icon: Trophy,
                color: 'amber',
              },
              {
                label: 'Bahar Bets',
                value: `₹${(gameState?.stats?.bahar_amount || 0).toFixed(2)}`,
                icon: Trophy,
                color: 'blue',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div className={`text-2xl font-bold text-${stat.color}-400`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-2 gap-6">
          {/* Game Actions */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Game Actions</h3>
            <div className="space-y-3">
              {gameState?.status === 'idle' && (
                <Button
                  onClick={handleStartRound}
                  disabled={startRoundMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start New Round
                </Button>
              )}

              {gameState?.status === 'betting' && (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Betting in Progress</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Players are placing their bets. Stop betting when ready.
                    </div>
                  </div>
                  <Button
                    onClick={handleStopBetting}
                    disabled={stopRoundMutation.isPending}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Betting
                  </Button>
                </>
              )}

              {gameState?.status === 'playing' && (
                <>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">Game in Progress</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Round is active. Declare winner manually or wait for automatic result.
                    </div>
                  </div>
                  <Button
                    onClick={() => setManualWinner({ show: true, winner: '', jokerCard: '' })}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Declare Winner Manually
                  </Button>
                </>
              )}

              {gameState?.status === 'completed' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Round Completed</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Winner: <span className="text-white font-medium">{gameState?.currentRound?.winner?.toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Start a new round when ready.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Live Activity Feed</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {gameState?.recentBets?.length > 0 ? (
                gameState.recentBets.map((bet: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">
                            {bet.user?.phone?.slice(-4) || 'User'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(bet.created_at), 'HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          bet.side === 'andar' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {bet.side.toUpperCase()}
                        </div>
                        <div className="text-xs text-cyan-400">₹{bet.amount}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Round Statistics</h3>
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Round Duration', value: gameState?.stats?.duration || '0:00' },
              { label: 'Bet Count', value: gameState?.stats?.total_bets || 0 },
              { label: 'Total Amount', value: `₹${(gameState?.stats?.total_amount || 0).toFixed(2)}` },
              { label: 'Andar %', value: `${gameState?.stats?.andar_percentage || 0}%` },
              { label: 'Bahar %', value: `${gameState?.stats?.bahar_percentage || 0}%` },
              { label: 'Payout', value: `₹${(gameState?.stats?.total_payout || 0).toFixed(2)}` },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
                <div className="text-white text-xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Winner Dialog */}
        {manualWinner.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setManualWinner({ show: false, winner: '', jokerCard: '' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0E27] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Declare Winner Manually</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Winner Side *</label>
                  <Select value={manualWinner.winner} onValueChange={(v) => setManualWinner({ ...manualWinner, winner: v as 'andar' | 'bahar' })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="andar">Andar</SelectItem>
                      <SelectItem value="bahar">Bahar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Joker Card *</label>
                  <Select value={manualWinner.jokerCard} onValueChange={(v) => setManualWinner({ ...manualWinner, jokerCard: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select joker card" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map(card => suits.map(suit => (
                        <SelectItem key={`${card}${suit}`} value={`${card}${suit}`}>
                          {card}{suit}
                        </SelectItem>
                      )))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setManualWinner({ show: false, winner: '', jokerCard: '' })}
                  variant="outline"
                  className="border-white/10 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeclareWinner}
                  disabled={!manualWinner.winner || !manualWinner.jokerCard || declareWinnerMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Declare Winner
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Emergency Stop Dialog */}
        {showEmergencyStop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowEmergencyStop(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0A0E27] border border-red-500/30 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-white">Emergency Stop</h3>
              </div>
              
              <p className="text-gray-400 mb-4">
                This will immediately stop the current round and refund all bets to players. 
                This action should only be used in case of technical issues or emergencies.
              </p>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="text-red-400 text-sm font-medium">
                  ⚠️ Warning: This action cannot be undone
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setShowEmergencyStop(false)}
                  variant="outline"
                  className="border-white/10 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmergencyStop}
                  disabled={emergencyStopMutation.isPending}
                  className="bg-gradient-to-r from-red-500 to-red-600"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Execute Emergency Stop
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}