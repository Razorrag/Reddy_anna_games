import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Trophy, Sparkles } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/hooks/useWindowSize'

export function WinnerCelebration() {
  const { currentRound } = useGameStore()
  const { width, height } = useWindowSize()
  const [show, setShow] = useState(false)
  const [myPayout, setMyPayout] = useState(0)

  useEffect(() => {
    if (currentRound?.status === 'complete' && currentRound.winingSide) {
      // Check if user won
      // This would come from WebSocket or bet results
      // For now, show celebration when round completes
      setShow(true)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [currentRound])

  if (!show || !currentRound?.winingSide) {
    return null
  }

  const winningSide = currentRound.winingSide
  const winningCard = currentRound.winningCard 
    ? JSON.parse(currentRound.winningCard)
    : null

  return (
    <>
      {/* Confetti Effect */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
        colors={['#FFD700', '#FFA500', '#FF8C00', '#00F5FF', '#FF69B4', '#7B68EE']}
      />

      {/* Winner Announcement Overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="text-center animate-scale-in">
          {/* Trophy Icon */}
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full flex items-center justify-center shadow-2xl shadow-[#FFD700]/50 animate-bounce">
            <Trophy className="w-16 h-16 text-white" />
          </div>

          {/* Winner Announcement */}
          <h2 className="text-6xl font-bold mb-4 text-[#FFD700] animate-pulse">
            {winningSide === 'andar' ? 'ANDAR' : 'BAHAR'} WINS!
          </h2>

          {/* Winning Card */}
          {winningCard && (
            <div className="mb-6">
              <p className="text-white text-xl mb-3">Winning Card</p>
              <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-2xl">
                <span className={`text-5xl font-bold ${
                  winningCard.suit === 'hearts' || winningCard.suit === 'diamonds' 
                    ? 'text-red-600' 
                    : 'text-black'
                }`}>
                  {winningCard.value}
                </span>
                <span className={`text-5xl ${
                  winningCard.suit === 'hearts' || winningCard.suit === 'diamonds'
                    ? 'text-red-600'
                    : 'text-black'
                }`}>
                  {winningCard.suit === 'hearts' && '♥'}
                  {winningCard.suit === 'diamonds' && '♦'}
                  {winningCard.suit === 'clubs' && '♣'}
                  {winningCard.suit === 'spades' && '♠'}
                </span>
              </div>
            </div>
          )}

          {/* User's Payout (if won) */}
          {myPayout > 0 && (
            <div className="mb-6">
              <div className="inline-block bg-green-500 px-8 py-4 rounded-xl shadow-2xl animate-pulse">
                <p className="text-white text-lg mb-1">You Won!</p>
                <p className="text-white text-4xl font-bold">
                  +₹{myPayout.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Total Payout */}
          <div className="bg-black/40 backdrop-blur-sm px-8 py-4 rounded-xl border border-[#FFD700]/30 inline-block">
            <p className="text-gray-300 text-sm mb-1">Total Payout</p>
            <p className="text-[#FFD700] text-3xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              ₹{(currentRound.totalPayout || 0).toLocaleString()}
            </p>
          </div>

          {/* Next Round Message */}
          <p className="text-white/80 text-lg mt-6">
            Next round starting soon...
          </p>
        </div>
      </div>
    </>
  )
}