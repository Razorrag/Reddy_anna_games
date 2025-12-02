import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Sparkles } from 'lucide-react'

export function FlashScreen() {
  const { setShowFlash } = useGameStore()

  useEffect(() => {
    // Auto-hide flash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowFlash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [setShowFlash])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] animate-fade-in">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-[#00F5FF]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center animate-scale-in">
        {/* Logo/Icon */}
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full flex items-center justify-center shadow-2xl shadow-[#FFD700]/50 animate-pulse">
          <Sparkles className="w-16 h-16 text-[#0A0E27]" />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent animate-shimmer">
          ANDAR BAHAR
        </h1>

        {/* Subtitle */}
        <p className="text-2xl text-gray-300 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Get Ready to Play
        </p>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Decorative cards animation */}
      <div className="absolute bottom-10 left-10 w-20 h-28 bg-white rounded-lg shadow-xl transform -rotate-12 animate-float"></div>
      <div className="absolute top-20 right-20 w-20 h-28 bg-white rounded-lg shadow-xl transform rotate-12 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 right-32 w-16 h-24 bg-white rounded-lg shadow-xl transform rotate-6 animate-float" style={{ animationDelay: '1s' }}></div>
    </div>
  )
}