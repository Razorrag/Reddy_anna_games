import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Clock } from 'lucide-react'

const BETTING_TIME = 30 // 30 seconds betting time

export function TimerOverlay() {
  const { currentRound } = useGameStore()
  const [timeLeft, setTimeLeft] = useState(BETTING_TIME)

  useEffect(() => {
    if (!currentRound || currentRound.status !== 'betting') {
      setTimeLeft(BETTING_TIME)
      return
    }

    // Calculate time left based on round start time
    const startTime = new Date(currentRound.startedAt).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - startTime) / 1000)
    const remaining = Math.max(0, BETTING_TIME - elapsed)
    
    setTimeLeft(remaining)

    // Update timer every second
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearInterval(interval)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentRound])

  // Don't show timer if not in betting phase
  if (!currentRound || currentRound.status !== 'betting') {
    return null
  }

  const percentage = (timeLeft / BETTING_TIME) * 100
  const isUrgent = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className={`
        px-6 py-3 rounded-full backdrop-blur-md
        ${isCritical
          ? 'bg-red-500/90 animate-pulse'
          : isUrgent
          ? 'bg-yellow-500/90'
          : 'bg-black/70'
        }
        border-2
        ${isCritical
          ? 'border-red-300'
          : isUrgent
          ? 'border-yellow-300'
          : 'border-[#FFD700]/50'
        }
        shadow-2xl
      `}>
        <div className="flex items-center gap-3">
          <Clock className={`
            w-6 h-6
            ${isCritical || isUrgent ? 'text-white' : 'text-[#FFD700]'}
            ${isCritical ? 'animate-bounce' : ''}
          `} />
          
          <div>
            <div className={`
              text-2xl font-bold tabular-nums
              ${isCritical || isUrgent ? 'text-white' : 'text-[#FFD700]'}
            `}>
              {timeLeft}s
            </div>
            
            {/* Progress bar */}
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
              <div
                className={`
                  h-full transition-all duration-1000 ease-linear rounded-full
                  ${isCritical
                    ? 'bg-white'
                    : isUrgent
                    ? 'bg-white'
                    : 'bg-[#FFD700]'
                  }
                `}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Urgent warning */}
      {isUrgent && (
        <div className="text-center mt-2">
          <span className={`
            text-xs font-semibold px-3 py-1 rounded-full
            ${isCritical
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-yellow-500 text-[#0A0E27]'
            }
          `}>
            {isCritical ? '⚠️ HURRY UP!' : '⏰ Time Running Out'}
          </span>
        </div>
      )}
    </div>
  )
}