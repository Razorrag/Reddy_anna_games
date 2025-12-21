import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Trophy, Sparkles, X } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/hooks/useWindowSize'
import { motion, AnimatePresence } from 'framer-motion'

export function WinnerCelebration() {
  const {
    showWinnerCelebration,
    winnerData,
    hideWinner,
    roundNumber
  } = useGameStore()
  const { width, height } = useWindowSize()

  // Auto-hide after 8 seconds
  useEffect(() => {
    if (showWinnerCelebration) {
      const timer = setTimeout(() => {
        hideWinner()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [showWinnerCelebration, hideWinner])

  if (!showWinnerCelebration || !winnerData) {
    return null
  }

  // Get payout rule text based on round
  const getPayoutRuleText = () => {
    if (roundNumber === 1) {
      return 'Andar: 1:1 (double) | Bahar: 1:0 (refund)';
    } else if (roundNumber === 2) {
      return 'Andar: 1:1 all bets | Bahar: 1:1 R1 + 1:0 R2';
    } else {
      return 'Both sides: 1:1 on total bets';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Confetti Effect */}
        {winnerData.userWon && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#FFD700', '#FFA500', '#FF8C00', '#00F5FF', '#FF69B4', '#7B68EE']}
          />
        )}

        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gradient-to-br from-gold/20 to-gold/40 p-8 rounded-2xl border-4 border-gold max-w-md w-full relative"
          >
            {/* Close Button */}
            <button
              onClick={hideWinner}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Trophy Icon */}
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full flex items-center justify-center shadow-2xl shadow-[#FFD700]/50">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            {/* Winner Text from Backend */}
            <h1 className="text-4xl font-bold text-gold mb-4 text-center animate-pulse">
              {winnerData.winnerDisplayText}
            </h1>

            {/* Winning Card */}
            <div className="text-center mb-4">
              <div className="text-sm text-gray-300 mb-2">Winning Card:</div>
              <div className="text-5xl font-bold text-white">
                {winnerData.winningCard}
              </div>
            </div>

            {/* User Result */}
            {winnerData.userWon ? (
              <div className="text-center mb-4">
                <div className="text-2xl text-green-400 font-bold mb-2">
                  🎉 YOU WON! 🎉
                </div>
                <div className="text-4xl text-gold font-bold mb-1">
                  ₹{winnerData.winAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-300">
                  Net Profit: ₹{winnerData.netProfit.toLocaleString('en-IN')}
                </div>
              </div>
            ) : (
              <div className="text-center mb-4">
                <div className="text-xl text-red-400 font-bold">
                  Better Luck Next Time
                </div>
                {winnerData.totalBetAmount > 0 && (
                  <div className="text-sm text-gray-400 mt-1">
                    Bet Amount: ₹{winnerData.totalBetAmount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            )}

            {/* Payout Breakdown Tooltip */}
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <div className="text-gray-300 text-xs mb-1 text-center">
                Round {roundNumber} Payout Rules:
              </div>
              <div className="text-gray-400 text-xs text-center">
                {getPayoutRuleText()}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={hideWinner}
              className="w-full bg-gradient-to-r from-gold to-gold/80 text-black py-3 rounded-lg font-bold hover:from-gold/90 hover:to-gold/70 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Continue Playing
            </button>

            {/* Next Round Message */}
            <p className="text-white/60 text-sm mt-4 text-center">
              Next round starting soon...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}