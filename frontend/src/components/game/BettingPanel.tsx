import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { usePlaceBet } from '@/hooks/mutations/game/usePlaceBet'
import { Button } from '@/components/ui/button'
import { Undo2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function BettingPanel() {
  const { user } = useAuthStore()
  const { currentRound, selectedChip, myBets } = useGameStore()
  const placeBetMutation = usePlaceBet()
  const [pendingBet, setPendingBet] = useState<{ side: 'andar' | 'bahar'; amount: number } | null>(null)

  const isBettingPhase = currentRound?.status === 'betting'
  const canBet = isBettingPhase && user?.isActive !== false
  const totalAndarBets = myBets.filter(b => b.side === 'andar').reduce((sum, b) => sum + b.amount, 0)
  const totalBaharBets = myBets.filter(b => b.side === 'bahar').reduce((sum, b) => sum + b.amount, 0)
  const totalBetAmount = totalAndarBets + totalBaharBets
  const hasBalance = (user?.mainBalance || 0) + (user?.bonusBalance || 0) >= selectedChip

  const handleBet = async (side: 'andar' | 'bahar') => {
    if (!canBet) {
      if (!isBettingPhase) {
        toast.error('Betting is closed for this round')
      } else if (user?.isActive === false) {
        toast.error('Your account is suspended')
      }
      return
    }

    if (!selectedChip) {
      toast.error('Please select a chip amount')
      return
    }

    if (!hasBalance) {
      toast.error('Insufficient balance')
      return
    }

    if (!currentRound?.id) {
      toast.error('No active round')
      return
    }

    // Optimistic UI update
    setPendingBet({ side, amount: selectedChip })

    try {
      await placeBetMutation.mutateAsync({
        roundId: currentRound.id,
        side,
        amount: selectedChip,
      })
      
      setPendingBet(null)
      
      // Success feedback
      toast.success(`₹${selectedChip.toLocaleString()} bet placed on ${side === 'andar' ? 'Andar' : 'Bahar'}!`)
    } catch (error: any) {
      setPendingBet(null)
      
      // Error already handled by mutation
      if (error.message?.includes('balance')) {
        toast.error('Insufficient balance')
      } else if (error.message?.includes('betting closed')) {
        toast.error('Betting time has ended')
      }
    }
  }

  const handleUndo = () => {
    if (myBets.length === 0) {
      toast.info('No bets to undo')
      return
    }
    
    // Show undo confirmation
    toast.info('Undo feature coming soon')
    // TODO: Implement undo last bet
  }

  return (
    <div className="w-full">
      {/* Betting Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Andar Button */}
        <Button
          onClick={() => handleBet('andar')}
          disabled={!canBet || placeBetMutation.isPending || !hasBalance}
          className={`
            h-32 text-2xl font-bold relative overflow-hidden group transition-all duration-300
            ${canBet && hasBalance
              ? 'bg-andar-gradient hover:shadow-andar-glow hover:scale-[1.02]'
              : 'bg-gray-600 cursor-not-allowed grayscale'
            }
            border-2 border-andar shadow-lg
            ${pendingBet?.side === 'andar' ? 'ring-4 ring-andar animate-pulse' : ''}
          `}
        >
          {/* Glow effect */}
          {canBet && hasBalance && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          )}
          
          <div className="relative z-10">
            <div className="text-white mb-1 drop-shadow-md">ANDAR</div>
            {totalAndarBets > 0 && (
              <div className="text-white/90 text-sm font-normal">
                ₹{totalAndarBets.toLocaleString()}
              </div>
            )}
          </div>

          {placeBetMutation.isPending && pendingBet?.side === 'andar' && (
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 animate-spin" />
          )}
        </Button>

        {/* Bahar Button */}
        <Button
          onClick={() => handleBet('bahar')}
          disabled={!canBet || placeBetMutation.isPending || !hasBalance}
          className={`
            h-32 text-2xl font-bold relative overflow-hidden group transition-all duration-300
            ${canBet && hasBalance
              ? 'bg-bahar-gradient hover:shadow-bahar-glow hover:scale-[1.02]'
              : 'bg-gray-600 cursor-not-allowed grayscale'
            }
            border-2 border-bahar shadow-lg
            ${pendingBet?.side === 'bahar' ? 'ring-4 ring-bahar animate-pulse' : ''}
          `}
        >
          {/* Glow effect */}
          {canBet && hasBalance && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          )}
          
          <div className="relative z-10">
            <div className="text-white mb-1 drop-shadow-md">BAHAR</div>
            {totalBaharBets > 0 && (
              <div className="text-white/90 text-sm font-normal">
                ₹{totalBaharBets.toLocaleString()}
              </div>
            )}
          </div>

          {placeBetMutation.isPending && pendingBet?.side === 'bahar' && (
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 animate-spin" />
          )}
        </Button>
      </div>

      {/* Bet Summary & Undo */}
      <div className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-[#FFD700]/20">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-gray-400 text-sm">Total Bet</p>
            <p className="text-[#FFD700] text-xl font-bold">
              ₹{totalBetAmount.toLocaleString()}
            </p>
          </div>
          
          {myBets.length > 0 && (
            <div className="text-gray-400 text-sm">
              ({myBets.length} bet{myBets.length > 1 ? 's' : ''})
            </div>
          )}
        </div>

        {/* Undo Button */}
        {isBettingPhase && myBets.length > 0 && (
          <Button
            onClick={handleUndo}
            variant="outline"
            size="sm"
            className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo Last
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {!isBettingPhase && (
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-sm">
            {currentRound?.status === 'dealing' && '🎴 Cards are being dealt...'}
            {currentRound?.status === 'complete' && '✅ Round complete. Next round starting soon...'}
            {!currentRound && '⏸️ Waiting for next round...'}
          </p>
        </div>
      )}

      {!hasBalance && isBettingPhase && (
        <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm text-center">
            ⚠️ Insufficient balance. Please add funds to continue playing.
          </p>
        </div>
      )}

      {user?.isActive === false && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm text-center">
            🚫 Account suspended. Contact support to resume playing.
          </p>
        </div>
      )}
    </div>
  )
}