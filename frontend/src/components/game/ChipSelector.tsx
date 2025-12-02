import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'

// 8 chip denominations from legacy system
const CHIP_AMOUNTS = [
  2500,
  5000,
  10000,
  25000,
  50000,
  75000,
  100000,
  200000,
]

// Chip colors for visual distinction
const CHIP_COLORS = {
  2500: 'from-gray-400 to-gray-600',
  5000: 'from-red-400 to-red-600',
  10000: 'from-blue-400 to-blue-600',
  25000: 'from-green-400 to-green-600',
  50000: 'from-purple-400 to-purple-600',
  75000: 'from-orange-400 to-orange-600',
  100000: 'from-pink-400 to-pink-600',
  200000: 'from-yellow-400 to-yellow-600',
}

export function ChipSelector() {
  const { selectedChip, setSelectedChip } = useGameStore()

  // Load saved chip from localStorage on mount
  useEffect(() => {
    const savedChip = localStorage.getItem('selectedChip')
    if (savedChip) {
      const chipAmount = parseInt(savedChip, 10)
      if (CHIP_AMOUNTS.includes(chipAmount)) {
        setSelectedChip(chipAmount)
      }
    } else {
      // Default to 5000
      setSelectedChip(5000)
    }
  }, [setSelectedChip])

  const handleChipSelect = (amount: number) => {
    setSelectedChip(amount)
    localStorage.setItem('selectedChip', amount.toString())
  }

  const formatAmount = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`
    }
    return `₹${amount}`
  }

  return (
    <Card className="bg-black/40 border-[#FFD700]/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#FFD700] flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Select Chip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {CHIP_AMOUNTS.map((amount) => {
            const isSelected = selectedChip === amount
            const colorClass = CHIP_COLORS[amount as keyof typeof CHIP_COLORS]

            return (
              <button
                key={amount}
                onClick={() => handleChipSelect(amount)}
                className={`
                  relative group
                  ${isSelected
                    ? 'ring-4 ring-[#FFD700] scale-105'
                    : 'hover:scale-105'
                  }
                  transition-all duration-200
                `}
              >
                {/* Chip Visual */}
                <div
                  className={`
                    w-full aspect-square rounded-full
                    bg-gradient-to-br ${colorClass}
                    shadow-lg
                    flex flex-col items-center justify-center
                    border-4 border-white/20
                    ${isSelected ? 'shadow-[#FFD700]/50' : 'shadow-black/50'}
                  `}
                >
                  {/* Inner circle */}
                  <div className="w-3/4 h-3/4 rounded-full border-2 border-white/30 border-dashed flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">
                        {formatAmount(amount)}
                      </div>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center border-2 border-[#0A0E27]">
                      <span className="text-[#0A0E27] text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>

                {/* Amount label */}
                <div className="mt-1 text-center">
                  <span className={`text-xs ${isSelected ? 'text-[#FFD700] font-bold' : 'text-gray-400'}`}>
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected chip info */}
        {selectedChip && (
          <div className="mt-4 p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
            <p className="text-center text-[#FFD700] text-sm">
              Selected: <span className="font-bold">₹{selectedChip.toLocaleString()}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}