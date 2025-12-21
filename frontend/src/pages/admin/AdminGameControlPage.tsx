import { useState, useEffect } from 'react';
import { RefreshCw, Users, DollarSign, Trophy, AlertTriangle, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useGameStore } from '@/store/gameStore';
import { OpeningCardSelector } from '@/components/admin/OpeningCardSelector';
import { CardDealingPanel } from '@/components/admin/CardDealingPanel';
import { BetsOverview } from '@/components/admin/BetsOverview';
import { toast } from 'sonner';

interface Card {
  rank: string;
  suit: string;
  display: string;
  color: 'red' | 'black';
}

export function AdminGameControlPage() {
  const { emit, isConnected } = useWebSocket();
  const { 
    currentRound, 
    gameId,
    roundPhase,
    roundNumber,
    openingCard,
    timeRemaining,
    isBetting,
    gameStats 
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'control' | 'bets' | 'history'>('control');
  const [usedCards, setUsedCards] = useState<Card[]>([]);
  const [andarCards, setAndarCards] = useState<Card[]>([]);
  const [baharCards, setBaharCards] = useState<Card[]>([]);
  const [showEmergencyStop, setShowEmergencyStop] = useState(false);

  // Initialize game state from store or fetch
  useEffect(() => {
    // Listen for WebSocket events to update card state
    // This would be connected via WebSocket context
  }, []);

  const handleEmergencyStop = async () => {
    try {
      emit('admin:emergency_stop', { gameId });
      toast.success('Emergency stop executed, all bets will be refunded');
      setShowEmergencyStop(false);
      
      // Reset card states
      setUsedCards([]);
      setAndarCards([]);
      setBaharCards([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute emergency stop');
    }
  };

  const handleResetGame = () => {
    // Reset all card states for new game
    setUsedCards([]);
    setAndarCards([]);
    setBaharCards([]);
  };

  const getPhaseDisplay = () => {
    switch (roundPhase) {
      case 'idle':
        return { text: 'IDLE', color: 'bg-gray-500', textColor: 'text-gray-400' };
      case 'betting':
        return { text: 'BETTING', color: 'bg-amber-500', textColor: 'text-amber-400' };
      case 'dealing':
        return { text: 'DEALING', color: 'bg-green-500', textColor: 'text-green-400' };
      case 'completed':
        return { text: 'COMPLETED', color: 'bg-blue-500', textColor: 'text-blue-400' };
      default:
        return { text: 'UNKNOWN', color: 'bg-gray-500', textColor: 'text-gray-400' };
    }
  };

  const phaseDisplay = getPhaseDisplay();

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
            <h1 className="text-3xl font-bold text-white mb-2">Live Game Administration</h1>
            <p className="text-gray-400">Control the real-time Andar Bahar game with stream cards</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              isConnected 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <Button
              onClick={() => window.location.reload()}
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

        {/* Current Game Status */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Current Round Status</CardTitle>
              <Badge className={`${phaseDisplay.color} text-white`}>
                {phaseDisplay.text}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">Current Round</div>
                <div className="text-2xl font-bold text-cyan-400">
                  #{roundNumber || 1}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">Opening Card</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {openingCard || '--'}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">Time Remaining</div>
                <div className="text-2xl font-bold text-green-400">
                  {timeRemaining > 0 ? `${timeRemaining}s` : '--'}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">Total Players</div>
                <div className="text-2xl font-bold text-blue-400">
                  {gameStats?.playerCount || 0}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">Total Bets</div>
                <div className="text-2xl font-bold text-purple-400">
                  ₹{gameStats?.totalBetAmount || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab System */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="control" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Zap className="w-4 h-4 mr-2" />
              Game Control
            </TabsTrigger>
            <TabsTrigger value="bets" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <DollarSign className="w-4 h-4 mr-2" />
              Bets Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Clock className="w-4 h-4 mr-2" />
              Game History
            </TabsTrigger>
          </TabsList>

          {/* GAME CONTROL TAB */}
          <TabsContent value="control" className="space-y-6">
            {/* Phase-based rendering */}
            {roundPhase === 'idle' && (
              <div className="space-y-6">
                {/* Opening Card Selection */}
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      Start New Round - Select Opening Card
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      Choose the opening card from the live stream to start a new betting round
                    </p>
                  </CardHeader>
                  <CardContent>
                    <OpeningCardSelector
                      gameId={gameId || 'default-game-id'}
                      usedCards={usedCards}
                      onCardUsed={(card) => setUsedCards(prev => [...prev, card])}
                      onGameStarted={handleResetGame}
                    />
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="bg-amber-500/10 border border-amber-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="text-amber-400 font-semibold">Game Flow Instructions:</h4>
                        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                          <li>Select the opening card shown in the live stream</li>
                          <li>Set betting duration (default: 30 seconds)</li>
                          <li>Click "Start Round" to begin betting phase</li>
                          <li>Wait for betting timer to complete</li>
                          <li>Deal cards from stream in the correct sequence (Bahar → Andar → Bahar...)</li>
                          <li>System automatically detects winner when matching card is dealt</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(roundPhase === 'betting' || roundPhase === 'dealing') && (
              <div className="grid grid-cols-3 gap-6">
                {/* Left: Card Dealing Panel (2 columns) */}
                <div className="col-span-2">
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        Card Dealing from Live Stream
                      </CardTitle>
                      <p className="text-gray-400 text-sm">
                        Input the actual cards as they appear in the live stream. System will auto-detect winner.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <CardDealingPanel
                        roundId={currentRound?.id || ''}
                        gameId={gameId || 'default-game-id'}
                        roundNumber={roundNumber || 1}
                        openingCard={openingCard || ''}
                        phase={roundPhase}
                        usedCards={usedCards}
                        andarCards={andarCards}
                        baharCards={baharCards}
                        onCardDealt={(card, side) => {
                          setUsedCards(prev => [...prev, card]);
                          if (side === 'andar') {
                            setAndarCards(prev => [...prev, card]);
                          } else {
                            setBaharCards(prev => [...prev, card]);
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Betting Info (1 column) */}
                <div>
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Betting Timer */}
                      {isBetting && timeRemaining > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-amber-400 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Betting Active</span>
                          </div>
                          <div className="text-3xl font-bold text-amber-400">
                            {timeRemaining}s
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Players can place bets
                          </div>
                        </div>
                      )}

                      {/* Dealing Phase */}
                      {roundPhase === 'dealing' && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-400 mb-2">
                            <Zap className="w-5 h-5" />
                            <span className="font-medium">Dealing Phase</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            Deal cards from stream until winner is found
                          </div>
                        </div>
                      )}

                      {/* Cards Dealt */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Andar Cards:</span>
                          <span className="text-amber-400 font-bold">{andarCards.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Bahar Cards:</span>
                          <span className="text-blue-400 font-bold">{baharCards.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Cards:</span>
                          <span className="text-cyan-400 font-bold">{andarCards.length + baharCards.length}</span>
                        </div>
                      </div>

                      {/* Next Expected Side */}
                      {roundPhase === 'dealing' && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Next Expected Side:</div>
                          <div className={`text-lg font-bold ${
                            (andarCards.length + baharCards.length) % 2 === 0 
                              ? 'text-blue-400' 
                              : 'text-amber-400'
                          }`}>
                            {(andarCards.length + baharCards.length) % 2 === 0 ? 'BAHAR' : 'ANDAR'}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {roundPhase === 'completed' && (
              <div className="space-y-6">
                {/* Winner Display */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl p-8 text-center"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                    Round Complete!
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Winner has been determined and payouts have been processed
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={handleResetGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      Start New Round
                    </Button>
                  </div>
                </motion.div>

                {/* Round Summary */}
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Round Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Cards Dealt</div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {andarCards.length + baharCards.length}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Total Bets</div>
                        <div className="text-2xl font-bold text-green-400">
                          ₹{gameStats?.totalBetAmount || 0}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Andar Bets</div>
                        <div className="text-2xl font-bold text-amber-400">
                          ₹{gameStats?.andarBets || 0}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Bahar Bets</div>
                        <div className="text-2xl font-bold text-blue-400">
                          ₹{gameStats?.baharBets || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* BETS OVERVIEW TAB */}
          <TabsContent value="bets" className="space-y-6">
            <BetsOverview
              roundId={currentRound?.id || ''}
              roundNumber={roundNumber || 1}
              phase={roundPhase}
            />
          </TabsContent>

          {/* GAME HISTORY TAB */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Game History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-400">
                  Game history will be displayed here. This feature is coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
