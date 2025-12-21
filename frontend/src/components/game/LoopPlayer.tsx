/**
 * LoopPlayer - Professional seamless loop video player
 * 
 * Features:
 * - Seamless loop with preloading
 * - Professional animated overlays
 * - No black screen transitions
 * - Proper error handling
 * - Page refresh support
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoopPlayerProps {
  videoUrl: string
  overlayText?: string
  overlaySubtext?: string
  onVideoError?: () => void
  className?: string
}

export const LoopPlayer = ({ 
  videoUrl, 
  overlayText, 
  overlaySubtext,
  onVideoError,
  className 
}: LoopPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      console.log('✅ Loop video ready')
      setIsLoaded(true)
      setHasError(false)
      
      video.play().catch(error => {
        console.error('Loop video play failed:', error)
        // Try with muted
        video.muted = true
        video.play().catch(err => {
          console.error('Muted play also failed:', err)
          setHasError(true)
          onVideoError?.()
        })
      })
    }

    const handleError = (e: Event) => {
      console.error('Loop video load error:', e)
      setHasError(true)
      onVideoError?.()
    }

    // Seamless loop - preload next iteration
    const handleTimeUpdate = () => {
      // Jump to start slightly before end to avoid black frame
      if (video.duration && video.currentTime >= video.duration - 0.1) {
        video.currentTime = 0
      }
    }

    const handleEnded = () => {
      // Immediate restart
      video.currentTime = 0
      video.play().catch(console.error)
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused && !hasError) {
        video.play().catch(console.error)
      }
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Force load
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [videoUrl, onVideoError, hasError])

  if (hasError) {
    return (
      <div className={`relative bg-black ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-white text-lg mb-2">Video Unavailable</p>
            <p className="text-gray-400 text-sm">Please check back later</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* Seamless loop video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1
        }}
      />

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FFD700] mx-auto mb-4"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Gradient overlay for better text visibility */}
      <div 
        className="absolute inset-0 pointer-events-none z-15"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)'
        }}
      />

      {/* Overlay text with professional animations */}
      <AnimatePresence>
        {isLoaded && (overlayText || overlaySubtext) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="text-center space-y-6 px-6 max-w-4xl">
              {overlayText && (
                <motion.h2
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: [0.9, 1, 0.98, 1],
                    opacity: 1
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    repeatDelay: 3,
                    ease: 'easeInOut'
                  }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shimmer 3s linear infinite',
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))'
                  }}
                >
                  {overlayText}
                </motion.h2>
              )}
              
              {overlaySubtext && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-snug"
                  style={{
                    textShadow: `
                      0 0 20px rgba(0, 0, 0, 0.95),
                      0 0 40px rgba(0, 0, 0, 0.8),
                      0 4px 12px rgba(0, 0, 0, 0.9),
                      0 0 60px rgba(255, 215, 0, 0.3)
                    `
                  }}
                >
                  {overlaySubtext}
                </motion.p>
              )}

              {/* Decorative animated dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="flex items-center justify-center gap-3 mt-8"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-3 h-3 rounded-full bg-[#FFD700]"
                    style={{
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  )
}