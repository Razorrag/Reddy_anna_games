import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NoWinnerNotification() {
  const { currentRound } = useGameStore()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show when round completes without a winner (all cards dealt, no match)
    if (currentRound?.status === 'complete' && !currentRound.winingSide) {
      setShow(true)
      
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 6000)

      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [currentRound])

  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] border-2 border-[#FFD700]/30 rounded-2xl p-8 shadow-2xl animate-scale-in">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-center text-[#FFD700] mb-4">
          No Winner This Round
        </h3>

        {/* Message */}
        <p className="text-white/80 text-center mb-6 text-lg">
          All cards were dealt but no matching card was found. All bets will be refunded.
        </p>

        {/* Refund Info */}
        <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-[#FFD700]">
            <RefreshCw className="w-5 h-5" />
            <span className="font-semibold">Full Refund Processing</span>
          </div>
          <p className="text-white/60 text-sm text-center mt-2">
            Your bets have been returned to your balance
          </p>
        </div>

        {/* Round Info */}
        {currentRound && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Round #{currentRound.roundNumber}
            </p>
            <p className="text-white/60 text-xs mt-1">
              Total Bets: ₹{((currentRound.totalAndarBets || 0) + (currentRound.totalBaharBets || 0)).toLocaleString()}
            </p>
          </div>
        )}

        {/* Close Button */}
        <Button
          onClick={() => setShow(false)}
          variant="gold"
          className="w-full mt-6"
        >
          Continue Playing
        </Button>

        {/* Next Round Message */}
        <p className="text-white/60 text-sm text-center mt-4">
          New round starting soon...
        </p>
      </div>
    </div>
  )
}