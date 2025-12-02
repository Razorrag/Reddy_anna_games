import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useAuthStore } from '@/store/authStore'
import { useGameStore } from '@/store/gameStore'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { usePlaceBet } from '@/hooks/mutations/game/usePlaceBet'
import { VideoPlayer } from '@/components/game/VideoPlayer'
import { BettingPanel } from '@/components/game/BettingPanel'
import { GameTable } from '@/components/game/GameTable'
import { ChipSelector } from '@/components/game/ChipSelector'
import { PlayerStats } from '@/components/game/PlayerStats'
import { RoundHistory } from '@/components/game/RoundHistory'
import { GameHeader } from '@/components/game/GameHeader'
import { TimerOverlay } from '@/components/game/TimerOverlay'
import { WinnerCelebration } from '@/components/game/WinnerCelebration'
import { NoWinnerNotification } from '@/components/game/NoWinnerNotification'
import { FlashScreen } from '@/components/game/FlashScreen'
import { ConnectionStatus } from '@/components/game/ConnectionStatus'
import MobileGameLayout from '@/components/game/mobile/MobileGameLayout'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function GameRoom() {
  const [, setLocation] = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const { currentRound, betting } = useGameStore()
  const { isConnected } = useWebSocket()
  const placeBetMutation = usePlaceBet()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Local betting state for mobile
  const [selectedBetAmount, setSelectedBetAmount] = useState(2500)
  const [selectedPosition, setSelectedPosition] = useState<'andar' | 'bahar' | null>(null)
  const [betHistory, setBetHistory] = useState<Array<{ position: 'andar' | 'bahar'; amount: number }>>([])
  
  // Available chip amounts
  const betAmounts = [2500, 5000, 10000, 20000, 30000, 40000, 50000, 100000]

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth/login')
    }
  }, [isAuthenticated, setLocation])

  // Don't render anything until authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Betting handlers for mobile
  const handlePositionSelect = (position: 'andar' | 'bahar') => {
    setSelectedPosition(position)
  }

  const handlePlaceBet = async (position: 'andar' | 'bahar') => {
    if (!currentRound || placeBetMutation.isPending || selectedBetAmount <= 0) return
    
    try {
      await placeBetMutation.mutateAsync({
        roundId: currentRound.id,
        side: position,
        amount: selectedBetAmount,
      })
      
      // Add to bet history for undo/rebet functionality
      setBetHistory([...betHistory, { position, amount: selectedBetAmount }])
      setSelectedPosition(null)
    } catch (error) {
      console.error('Failed to place bet:', error)
    }
  }

  const handleChipSelect = (amount: number) => {
    setSelectedBetAmount(amount)
  }

  const handleUndoBet = () => {
    if (betHistory.length > 0) {
      const lastBet = betHistory[betHistory.length - 1]
      setBetHistory(betHistory.slice(0, -1))
      // TODO: Call API to undo the last bet
      console.log('Undo bet:', lastBet)
    }
  }

  const handleRebet = () => {
    if (betHistory.length > 0) {
      const lastBet = betHistory[betHistory.length - 1]
      handlePlaceBet(lastBet.position)
    }
  }

  const handleWalletClick = () => {
    setLocation('/dashboard/wallet')
  }

  const handleHistoryClick = () => {
    setLocation('/dashboard/game-history')
  }

  const handleProfileClick = () => {
    setLocation('/dashboard/profile')
  }

  const handleBonusClick = () => {
    setLocation('/dashboard/bonuses')
  }

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <ConnectionStatus />
        <MobileGameLayout
          selectedBetAmount={selectedBetAmount}
          selectedPosition={selectedPosition}
          betAmounts={betAmounts}
          onPositionSelect={handlePositionSelect}
          onPlaceBet={handlePlaceBet}
          onChipSelect={handleChipSelect}
          onUndoBet={handleUndoBet}
          onRebet={handleRebet}
          onWalletClick={handleWalletClick}
          onHistoryClick={handleHistoryClick}
          onProfileClick={handleProfileClick}
          onBonusClick={handleBonusClick}
          isPlacingBet={placeBetMutation.isPending}
        />
      </>
    )
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]">
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* Game Header */}
      <GameHeader />

      {/* Main Game Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Player Stats & History */}
          <div className="col-span-3 space-y-6">
            <PlayerStats />
            <RoundHistory />
          </div>

          {/* Center - Video & Game Table */}
          <div className="col-span-6 space-y-6">
            {/* Video Player */}
            <div className="relative">
              <VideoPlayer />
              <TimerOverlay />
            </div>

            {/* Game Table with Cards */}
            <GameTable />

            {/* Betting Panel */}
            <BettingPanel />
          </div>

          {/* Right Sidebar - Chip Selector & Recent Bets */}
          <div className="col-span-3 space-y-6">
            <ChipSelector />
            {/* Additional components can go here */}
          </div>
        </div>
      </div>

      {/* Overlays */}
      <WinnerCelebration />
      <NoWinnerNotification />

      {/* Account Status Warning */}
      {user.isActive === false && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-500/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
            <p className="text-[#0A0E27] font-semibold">
              ⚠️ Account suspended. You can view but cannot place bets.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}