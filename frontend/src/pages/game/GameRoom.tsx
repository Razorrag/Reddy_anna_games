import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useAuthStore } from '@/store/authStore'
import { useGameStore } from '@/store/gameStore'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { usePlaceBet } from '@/hooks/mutations/game/usePlaceBet'
import { useCurrentRound } from '@/hooks/queries/game/useCurrentRound'
import { ConnectionStatus } from '@/components/game/ConnectionStatus'
import MobileGameLayout from '@/components/game/mobile/MobileGameLayout'
import { WalletModal } from '@/components/WalletModal'
import { websocketService } from '@/lib/websocket'
import { toast } from 'sonner'

export default function GameRoom() {
  const [, setLocation] = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const {
    currentRound,
    setGameId,
    setOpeningCard,
    setRoundNumber,
    setTimerDuration,
    setTimeRemaining,
    setRoundPhase,
    setBetting,
    addAndarCard,
    addBaharCard,
    setWinningCard,
    showWinnerCelebration,
    gameStats
  } = useGameStore()
  const placeBetMutation = usePlaceBet()
  
  // Fetch current round state on mount
  const { data: initialRound, isLoading: isLoadingRound } = useCurrentRound()
  
  // Local betting state
  const [selectedBetAmount, setSelectedBetAmount] = useState(2500)
  const [selectedPosition, setSelectedPosition] = useState<'andar' | 'bahar' | null>(null)
  const [betHistory, setBetHistory] = useState<Array<{ position: 'andar' | 'bahar'; amount: number }>>([])
  
  // Wallet modal state
  const [showWalletModal, setShowWalletModal] = useState(false)
  
  // Available chip amounts
  const betAmounts = [2500, 5000, 10000, 20000, 30000, 40000, 50000, 100000]

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth/login')
    }
  }, [isAuthenticated, setLocation])

  // Initialize game state from API on mount
  useEffect(() => {
    if (initialRound && !currentRound) {
      console.log('📥 Initializing game state from API:', initialRound)
      
      // Set game state in store
      setGameId(initialRound.gameId)
      setOpeningCard(initialRound.jokerCard || '')
      setRoundNumber(initialRound.roundNumber)
      
      // Set betting state based on round status
      if (initialRound.status === 'betting') {
        setBetting(true)
        setRoundPhase('betting')
        
        // Calculate remaining time
        if (initialRound.bettingEndTime) {
          const endTime = new Date(initialRound.bettingEndTime).getTime()
          const now = Date.now()
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
          
          setTimerDuration(remaining)
          setTimeRemaining(remaining)
        }
      } else if (initialRound.status === 'playing') {
        setBetting(false)
        setRoundPhase('dealing')
      } else if (initialRound.status === 'completed') {
        setBetting(false)
        setRoundPhase('completed')
      }
    }
  }, [initialRound, currentRound, setGameId, setOpeningCard, setRoundNumber, setTimerDuration, setTimeRemaining, setRoundPhase, setBetting])

  // Emit join event when user enters game room
  useEffect(() => {
    if (isAuthenticated && user && initialRound) {
      console.log('🎮 User joining game:', initialRound.gameId)
      websocketService.emit('game:join', {
        gameId: initialRound.gameId,
        userId: user.id,
      })
    }
  }, [isAuthenticated, user, initialRound])

  // WebSocket event listeners for real-time card dealing
  useEffect(() => {
    if (!isAuthenticated) return

    // Listen for card dealt events
    const handleCardDealt = (data: {
      card: string;
      side: 'andar' | 'bahar';
      position: number;
      isWinningCard: boolean;
      roundNumber: number;
      expectedNextSide?: string;
    }) => {
      console.log('🃏 Card dealt:', data)
      
      // Parse card format "KH" -> rank + suit
      const rank = data.card.slice(0, -1)
      const suit = data.card.slice(-1)
      const color = ['♥', '♦'].includes(suit) ? 'red' : 'black'
      
      const cardData = {
        rank,
        suit,
        display: data.card,
        color
      }
      
      // Add card to appropriate side
      if (data.side === 'andar') {
        addAndarCard(cardData)
      } else {
        addBaharCard(cardData)
      }
      
      // If winning card, store it
      if (data.isWinningCard) {
        setWinningCard(data.card)
        toast.success(`Winning card: ${data.card}`)
      }
    }

    // Listen for winner determined events
    const handleWinnerDetermined = (data: {
      winningSide: 'andar' | 'bahar';
      winningCard: string;
      winnerDisplayText: string;
      totalCards: number;
      roundNumber: number;
      userWon?: boolean;
      payout?: number;
    }) => {
      console.log('🏆 Winner determined:', data)
      
      // Update round phase
      setRoundPhase('completed')
      setBetting(false)
      
      // Show winner celebration (handled by WinnerCelebration component)
      showWinnerCelebration({
        winningSide: data.winningSide,
        winningCard: data.winningCard,
        winnerDisplayText: data.winnerDisplayText,
        userWon: data.userWon || false,
        payout: data.payout || 0
      })
      
      // Show toast notification
      toast.success(data.winnerDisplayText, {
        duration: 5000,
      })
    }

    // Listen for round progression (Round 1 -> 2 -> 3)
    const handleRoundProgression = (data: {
      currentRound: number;
      nextRound: number;
      message: string;
    }) => {
      console.log('🔄 Round progression:', data)
      
      // Update round number
      setRoundNumber(data.nextRound)
      
      // Show notification
      toast.info(data.message, {
        duration: 3000,
      })
      
      // Reset betting for new round
      setRoundPhase('betting')
      setBetting(true)
    }

    // Listen for betting closed event
    const handleBettingClosed = (data: { roundId: string }) => {
      console.log('🔒 Betting closed:', data)
      setBetting(false)
      setRoundPhase('dealing')
      toast.warning('Betting closed! Cards are being dealt...', {
        duration: 2000,
      })
    }

    // Listen for round created event (new game starting)
    const handleRoundCreated = (data: {
      round: any;
      openingCard: string;
      roundNumber: number;
    }) => {
      console.log('🆕 New round created:', data)
      
      setOpeningCard(data.openingCard)
      setRoundNumber(data.roundNumber)
      setBetting(true)
      setRoundPhase('betting')
      
      toast.success(`New round started! Opening card: ${data.openingCard}`, {
        duration: 3000,
      })
    }

    // Subscribe to WebSocket events
    websocketService.on('card:dealt', handleCardDealt)
    websocketService.on('winner:determined', handleWinnerDetermined)
    websocketService.on('round:progression', handleRoundProgression)
    websocketService.on('betting:closed', handleBettingClosed)
    websocketService.on('round:created', handleRoundCreated)

    // Cleanup subscriptions
    return () => {
      websocketService.off('card:dealt', handleCardDealt)
      websocketService.off('winner:determined', handleWinnerDetermined)
      websocketService.off('round:progression', handleRoundProgression)
      websocketService.off('betting:closed', handleBettingClosed)
      websocketService.off('round:created', handleRoundCreated)
    }
  }, [
    isAuthenticated,
    addAndarCard,
    addBaharCard,
    setWinningCard,
    showWinnerCelebration,
    setRoundPhase,
    setRoundNumber,
    setBetting,
    setOpeningCard
  ])

  // Don't render anything until authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Betting handlers
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
    setShowWalletModal(true)
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

  // Use mobile layout for ALL devices (mobile-first design)
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
      {/* Wallet Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
      
      {/* Account Status Warning - Show for suspended accounts */}
      {user.isActive === false && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-500/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
            <p className="text-[#0A0E27] font-semibold">
              ⚠️ Account suspended. You can view but cannot place bets.
            </p>
          </div>
        </div>
      )}
    </>
  )
}