/**
 * VideoPlayer - Complete OvenMediaEngine streaming system
 * 
 * Features (from legacy VideoArea.tsx):
 * - HLS.js with ultra-low latency (sub-1-second)
 * - Loop video system (/shared/uhd_30fps.mp4)
 * - Frozen frame on pause (no black screen)
 * - Seamless OBS stream integration
 * - WebSocket pause/resume sync
 * - Circular timer overlay with multi-layer glow
 * - Stream health monitoring and auto-recovery
 * - Debug overlay (5 clicks on top-left)
 * - Fake viewer count system
 * - LIVE badge and viewer count display
 * - Page visibility handling
 * - Cache-busting for fresh streams
 */

import { useEffect, useState, useRef, useCallback, memo } from 'react'
import { useGameStore } from '@/store/gameStore'
import Hls from 'hls.js'

interface VideoPlayerProps {
  className?: string
}

interface StreamConfig {
  streamUrl: string
  streamType: 'video' | 'iframe'
  isActive: boolean
  isPaused: boolean
  loopMode: boolean
  loopNextGameDate?: string
  loopNextGameTime?: string
  muted: boolean
  minViewers: number
  maxViewers: number
}

interface DebugStats {
  latency: number
  buffer: number
  dropped: number
  bandwidth: number
}

export const VideoPlayer = memo(({ className = '' }: VideoPlayerProps) => {
  const { timeRemaining, roundPhase } = useGameStore()

  // Stream configuration from backend
  const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null)
  const [streamLoading, setStreamLoading] = useState(true)

  // Displayed viewer count - always fake based on configured range
  const [displayedViewerCount, setDisplayedViewerCount] = useState<number>(0)

  // Refs for direct stream control
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Canvas ref for capturing frozen frame when paused
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null)
  const [isPausedState, setIsPausedState] = useState(false)

  // Track if we're waiting for video to load during paused state
  const [waitingForVideoOnPause, setWaitingForVideoOnPause] = useState(false)

  // HLS reload trigger - increment to force HLS instance recreation
  const [hlsReloadTrigger, setHlsReloadTrigger] = useState(0)
  const previousPausedState = useRef(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  // Loading and buffering states for better UX
  const [isBuffering, setIsBuffering] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)

  // Debounce buffering popup to prevent flashing
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debug Overlay State
  const [showDebug, setShowDebug] = useState(false)
  const [debugStats, setDebugStats] = useState<DebugStats>({ latency: 0, buffer: 0, dropped: 0, bandwidth: 0 })
  const debugClickCount = useRef(0)
  const debugTimer = useRef<NodeJS.Timeout | null>(null)

  // Timer state
  const [isPulsing, setIsPulsing] = useState(false)

  // Helper: Show buffering with delay to prevent flashing
  const showBuffering = useCallback(() => {
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current)
    }
    bufferingTimeoutRef.current = setTimeout(() => {
      setIsBuffering(true)
    }, 800)
  }, [])

  // Helper: Hide buffering immediately
  const hideBuffering = useCallback(() => {
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current)
      bufferingTimeoutRef.current = null
    }
    setIsBuffering(false)
  }, [])

  // Load stream config from API
  const loadStreamConfig = useCallback(async () => {
    try {
      console.log('🔍 VideoPlayer: Fetching stream config from /api/stream/config...')
      const response = await fetch('/api/stream/config')
      const data = await response.json()
      console.log('🔍 VideoPlayer: API Response:', data)

      if (data.success && data.data) {
        let streamUrl = data.data.streamUrl

        if (streamUrl) {
          // Convert Google Drive URLs to embed format
          if (streamUrl.includes('drive.google.com')) {
            console.log('🔍 Detected Google Drive URL, converting to embed format...')
            let fileId = null
            const fileMatch = streamUrl.match(/\/file\/d\/([^\/]+)/)
            if (fileMatch) fileId = fileMatch[1]
            const idMatch = streamUrl.match(/[?&]id=([^&]+)/)
            if (idMatch) fileId = idMatch[1]

            if (fileId) {
              streamUrl = `https://drive.google.com/file/d/${fileId}/preview`
              console.log('✅ Converted Google Drive URL to:', streamUrl)
            }
          }

          // Handle mixed content
          const currentProtocol = window.location.protocol
          if (currentProtocol === 'http:' && streamUrl.startsWith('https://')) {
            console.log('⚠️ Site is HTTP but stream URL is HTTPS, downgrading to HTTP...')
            streamUrl = streamUrl.replace('https://', 'http://')
          } else if (currentProtocol === 'https:' && streamUrl.startsWith('http://')) {
            const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(new URL(streamUrl).hostname)
            if (!isIpAddress) {
              console.log('⚠️ Site is HTTPS but stream URL is HTTP, attempting to upgrade...')
              streamUrl = streamUrl.replace('http://', 'https://')
            }
          }
        }

        const config: StreamConfig = {
          ...data.data,
          streamUrl
        }
        setStreamConfig(config)
        setIsPausedState(config.isPaused || false)

        console.log('🎥 VideoPlayer: Stream config loaded:', {
          streamUrl,
          streamType: config.streamType,
          isActive: config.isActive,
          isPaused: config.isPaused
        })
      }
    } catch (error) {
      console.error('❌ Failed to load stream config:', error)
    } finally {
      setStreamLoading(false)
    }
  }, [])

  // Load stream config on mount
  useEffect(() => {
    console.log('🔄 VideoPlayer mounted - loading stream config...')
    loadStreamConfig()

    // Handle page visibility changes with full stream refresh
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📴 Page hidden - stream will continue buffering')
      } else {
        console.log('👁️ Page visible again - FORCING FRESH STREAM...')
        const videoElement = videoRef.current
        const hls = hlsRef.current

        if (videoElement && hls && !isPausedState) {
          console.log('🔄 Destroying HLS instance for fresh stream...')
          try {
            hls.destroy()
          } catch (error) {
            console.error('Error destroying HLS on visibility:', error)
          }
          hlsRef.current = null
          setHlsReloadTrigger(prev => prev + 1)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current)
      }
    }
  }, [loadStreamConfig, isPausedState])

  // Fake viewer count logic
  useEffect(() => {
    const updateDisplayedCount = () => {
      const minViewers = streamConfig?.minViewers || 1000
      const maxViewers = streamConfig?.maxViewers || 1100
      const fakeCount = Math.floor(Math.random() * (maxViewers - minViewers + 1)) + minViewers
      setDisplayedViewerCount(fakeCount)
    }

    updateDisplayedCount()
    const interval = setInterval(updateDisplayedCount, 2000)
    return () => clearInterval(interval)
  }, [streamConfig?.minViewers, streamConfig?.maxViewers])

  // WebSocket stream status handler
  useEffect(() => {
    const handleStreamStatusUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent
      const { isPaused: newPauseState } = customEvent.detail || {}

      console.log('⚡ [WS] Stream status update received!', { newPauseState })

      if (typeof newPauseState === 'boolean') {
        console.log(`🎬 Setting pause state to: ${newPauseState}`)
        setIsPausedState(newPauseState)
      }

      loadStreamConfig()
    }

    window.addEventListener('stream_status_updated', handleStreamStatusUpdate)
    return () => window.removeEventListener('stream_status_updated', handleStreamStatusUpdate)
  }, [loadStreamConfig])

  // HLS.js Setup with Ultra-Low Latency
  useEffect(() => {
    const videoElement = videoRef.current
    const streamUrl = streamConfig?.streamUrl

    if (!videoElement || !streamUrl) return

    // Check if URL is HLS (.m3u8)
    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        console.log('🎥 Setting up HLS.js with ULTRA-LOW LATENCY config...')

        if (hlsRef.current) {
          hlsRef.current.destroy()
        }

        // Ultra-low latency HLS configuration (sub-1-second)
        const hls = new Hls({
          // Core latency settings
          lowLatencyMode: true,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 3,
          liveDurationInfinity: true,

          // Buffer settings - minimal but stable
          maxBufferLength: 2,
          maxMaxBufferLength: 4,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferHole: 0.3,

          // Fast catch-up
          maxLiveSyncPlaybackRate: 1.05,

          // Monitoring
          highBufferWatchdogPeriod: 1,
          nudgeMaxRetry: 3,
          nudgeOffset: 0.1,

          // Performance
          enableWorker: true,
          backBufferLength: 5,

          // Network resilience
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 6,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 6000,
          fragLoadingMaxRetry: 4,
          fragLoadingRetryDelay: 500,

          // Quality selection
          startLevel: -1,
          abrEwmaDefaultEstimate: 5000000,
          testBandwidth: true,
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.9,
          capLevelToPlayerSize: false,

          // Disable metadata for performance
          enableDateRangeMetadataCues: false,
          enableEmsgMetadataCues: false,
          enableID3MetadataCues: false,
        })

        hls.loadSource(streamUrl)
        hls.attachMedia(videoElement)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest loaded, starting playback...')
          videoElement.play().catch(err => {
            console.error('❌ HLS initial play failed:', err)
            videoElement.muted = true
            videoElement.play().catch(e => console.error('❌ HLS muted play failed:', e))
          })
        })

        // Seek to live when first fragment loads
        hls.on(Hls.Events.FRAG_LOADED, () => {
          if (hls.liveSyncPosition && isFinite(hls.liveSyncPosition) && videoElement.currentTime === 0) {
            videoElement.currentTime = hls.liveSyncPosition
            console.log(`📍 Initial seek to live: ${hls.liveSyncPosition.toFixed(2)}s`)
          }
        })

        // Debug stats update
        const debugInterval = setInterval(() => {
          if (hls && videoElement) {
            const latency = hls.latency || 0
            const buffer = videoElement.buffered.length > 0
              ? videoElement.buffered.end(videoElement.buffered.length - 1) - videoElement.currentTime
              : 0

            setDebugStats({
              latency,
              buffer,
              dropped: videoElement.getVideoPlaybackQuality ? videoElement.getVideoPlaybackQuality().droppedVideoFrames : 0,
              bandwidth: hls.bandwidthEstimate || 0
            })
          }
        }, 500)

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('❌ Fatal HLS error:', data)

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('🔄 Network error, attempting recovery...')
                setIsReconnecting(true)
                hls.startLoad()
                setTimeout(() => {
                  if (hls && videoElement && videoElement.paused && !isPausedState) {
                    console.log('🔄 Recovery failed, forcing complete HLS reload...')
                    setHlsReloadTrigger(prev => prev + 1)
                  }
                }, 3000)
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('🔄 Media error, attempting recovery...')
                setIsReconnecting(true)
                hls.recoverMediaError()
                break
              default:
                console.log('🔄 Unrecoverable error, destroying HLS...')
                setIsReconnecting(true)
                hls.destroy()
                setTimeout(() => {
                  setHlsReloadTrigger(prev => prev + 1)
                }, 1000)
                break
            }
          }
        })

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsReconnecting(false)
        })

        hlsRef.current = hls

        return () => {
          clearInterval(debugInterval)
          if (hlsRef.current) {
            console.log('🧹 Cleaning up HLS instance...')
            try {
              hlsRef.current.destroy()
            } catch (error) {
              console.error('❌ Error destroying HLS:', error)
            } finally {
              hlsRef.current = null
            }
          }
        }
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('🎥 Using native HLS support (Safari)...')
        videoElement.src = streamUrl
        videoElement.play().catch(err => console.error('❌ Native HLS play failed:', err))
      }
    }
  }, [streamConfig?.streamUrl, hlsReloadTrigger, isPausedState])

  // Capture frozen frame when paused
  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return false

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const ctx = canvas.getContext('2d', { willReadFrequently: false })
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const frameData = canvas.toDataURL('image/jpeg', 0.95)
          setFrozenFrame(frameData)
          setWaitingForVideoOnPause(false)
          console.log(`📸 Captured HLS frame: ${canvas.width}x${canvas.height}`)
          return true
        } catch (error) {
          console.error('❌ Frame capture failed:', error)
          return false
        }
      }
    }
    return false
  }, [])

  // Retry frame capture when video becomes ready
  useEffect(() => {
    if (waitingForVideoOnPause && isPausedState) {
      const video = videoRef.current
      if (!video) return

      const handleCanPlay = () => {
        console.log('✅ Video ready during pause - capturing frame now')
        const success = captureCurrentFrame()
        if (success) video.pause()
      }

      if (video.readyState >= 2) {
        handleCanPlay()
      } else {
        video.addEventListener('canplay', handleCanPlay, { once: true })
        const timeout = setTimeout(() => {
          if (video.readyState >= 2) {
            captureCurrentFrame()
            video.pause()
          }
        }, 1000)

        return () => {
          video.removeEventListener('canplay', handleCanPlay)
          clearTimeout(timeout)
        }
      }
    }
  }, [waitingForVideoOnPause, isPausedState, captureCurrentFrame])

  // Handle pause/resume with forced stream refresh
  useEffect(() => {
    const videoElement = videoRef.current
    const iframeElement = iframeRef.current

    const wasJustPaused = previousPausedState.current === false && isPausedState === true
    const wasJustResumed = previousPausedState.current === true && isPausedState === false

    if (isPausedState && wasJustPaused) {
      if (videoElement && streamConfig?.streamUrl?.includes('.m3u8')) {
        const captured = captureCurrentFrame()

        if (!captured) {
          console.log('⏳ Video not ready for capture - will wait for it to load')
          setWaitingForVideoOnPause(true)
          previousPausedState.current = isPausedState
          return
        }

        videoElement.pause()

        if (hlsRef.current) {
          console.log('🛑 Pausing stream (buffer preserved for instant resume)...')
          hlsRef.current.stopLoad()
        }
      } else if (videoElement) {
        const captured = captureCurrentFrame()
        if (captured) videoElement.pause()
      }
    } else if (!isPausedState && wasJustResumed) {
      if (videoElement && streamConfig?.streamUrl?.includes('.m3u8')) {
        console.log('▶️ RESUMING - FORCING FRESH STREAM...')
        console.log('🖼️ Keeping frozen frame visible to prevent black screen')

        if (hlsRef.current) {
          console.log('🔄 Destroying HLS instance for fresh stream...')
          try {
            hlsRef.current.destroy()
          } catch (error) {
            console.error('Error destroying HLS on resume:', error)
          }
          hlsRef.current = null
        }

        // Add cache-busting
        const originalUrl = streamConfig.streamUrl
        const cacheBuster = `_t=${Date.now()}`
        const separator = originalUrl.includes('?') ? '&' : '?'
        const freshUrl = `${originalUrl}${separator}${cacheBuster}`

        setStreamConfig((prev: any) => ({
          ...prev,
          streamUrl: freshUrl
        }))

        setHlsReloadTrigger(prev => prev + 1)

        setTimeout(() => {
          setStreamConfig((prev: any) => ({
            ...prev,
            streamUrl: originalUrl
          }))
        }, 1000)
      }

      if (iframeElement && streamConfig?.streamUrl && !streamConfig.streamUrl.includes('.m3u8')) {
        setFrozenFrame(null)
        iframeElement.src = iframeElement.src
      }
    }

    previousPausedState.current = isPausedState
  }, [isPausedState, streamConfig?.streamUrl, captureCurrentFrame])

  // Handle pulse effect when less than 5 seconds
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      setIsPulsing(true)
    } else {
      setIsPulsing(false)
    }
  }, [timeRemaining])

  // Get timer color based on phase
  const getTimerColor = () => {
    switch (roundPhase) {
      case 'betting':
        return timeRemaining <= 5 ? '#EF4444' : '#FFD100'
      case 'dealing':
        return '#10B981'
      case 'complete':
        return '#8B5CF6'
      default:
        return '#6B7280'
    }
  }

  // Calculate timer progress
  const getTimerProgress = () => {
    if (roundPhase !== 'betting') return 0
    const maxTime = 30
    return Math.max(0, (maxTime - timeRemaining) / maxTime)
  }

  // Auto-detect stream type
  const url = streamConfig?.streamUrl?.toLowerCase() || ''
  const isVideoFile = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.endsWith('.m3u8')
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  const shouldUseVideo = streamConfig?.streamType === 'video' || (isVideoFile && !isYouTube)

  // Render stream
  const renderStream = () => {
    if (streamLoading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading stream...</p>
          </div>
        </div>
      )
    }

    // Loop Mode
    if (streamConfig?.loopMode) {
      return (
        <div className="relative w-full h-full bg-black">
          <video
            key="loop-video"
            src="/shared/uhd_30fps.mp4"
            className="w-full h-full"
            autoPlay
            loop
            muted
            playsInline
            style={{ position: 'absolute', inset: 0, zIndex: 1, objectFit: 'cover' }}
            onLoadedData={(e) => {
              const video = e.currentTarget
              video.play().catch(err => {
                video.muted = true
                video.play()
              })
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center space-y-4 px-6">
              {streamConfig?.loopNextGameDate && (
                <p
                  className="text-4xl md:text-5xl font-bold text-white"
                  style={{ textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.8)' }}
                >
                  {streamConfig.loopNextGameDate}
                </p>
              )}
              {streamConfig?.loopNextGameTime && (
                <p
                  className="text-6xl md:text-7xl font-bold text-[#FFD700]"
                  style={{ textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.8)' }}
                >
                  {streamConfig.loopNextGameTime}
                </p>
              )}
              {(!streamConfig?.loopNextGameDate && !streamConfig?.loopNextGameTime) && (
                <p
                  className="text-4xl md:text-5xl font-bold text-white"
                  style={{ textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.8)' }}
                >
                  Game will resume shortly
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (!streamConfig?.streamUrl) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="text-center px-6">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-gray-400 text-lg">No stream configured</p>
            <p className="text-gray-600 text-sm mt-2">Please add a stream URL in admin settings</p>
          </div>
        </div>
      )
    }

    if (shouldUseVideo) {
      return (
        <video
          ref={videoRef}
          className="w-full h-full"
          autoPlay
          muted={true}
          controls={false}
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            filter: 'contrast(1.05) saturate(1.1) brightness(1.02)',
          }}
          onPlaying={() => {
            hideBuffering()
            setStreamError(null)
            setIsReconnecting(false)
            if (frozenFrame) {
              console.log('🎬 Video playing - clearing frozen frame')
              setFrozenFrame(null)
            }
          }}
          onCanPlay={() => hideBuffering()}
        />
      )
    } else {
      return (
        <iframe
          ref={iframeRef}
          src={streamConfig.streamUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            zIndex: 1
          }}
          title="Live Game Stream"
        />
      )
    }
  }

  const isLive = !!(streamConfig && !streamConfig.loopMode && streamConfig.streamUrl)

  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Frozen Frame Overlay */}
      {frozenFrame && (
        <div className="absolute inset-0 z-50 bg-black">
          <img
            src={frozenFrame}
            alt="Stream paused"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Reconnecting Overlay */}
      {isReconnecting && frozenFrame && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-black/90 backdrop-blur-sm px-8 py-6 rounded-xl flex flex-col items-center gap-4 shadow-2xl border border-[#FFD700]/30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-[#FFD700]"></div>
            <span className="text-white text-base font-semibold">Reconnecting to stream...</span>
          </div>
        </div>
      )}

      {/* Buffering Overlay */}
      {isBuffering && !isPausedState && !frozenFrame && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFD700]"></div>
            <span className="text-white text-sm font-medium">Loading stream...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {streamError && !isPausedState && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-red-900/80 backdrop-blur-sm px-6 py-4 rounded-xl flex flex-col items-center gap-3 max-w-xs">
            <div className="text-4xl">⚠️</div>
            <span className="text-white text-sm font-medium text-center">{streamError}</span>
          </div>
        </div>
      )}

      {/* Video Stream */}
      <div className="absolute inset-0">
        {renderStream()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" style={{ zIndex: 2 }} />
      </div>

      {/* LIVE Badge */}
      {isLive && (
        <div className="absolute top-3 left-3 z-[55]">
          <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white font-bold text-xs uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      )}

      {/* Viewer Count */}
      {isLive && (
        <div className="absolute top-3 right-3 z-[55]">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-red-400 text-[10px]">👁</span>
            <span className="text-white text-xs font-medium">
              {displayedViewerCount > 0 ? displayedViewerCount.toLocaleString() : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Debug Overlay */}
      {showDebug && (
        <div className="absolute top-12 left-3 z-50 bg-black/80 text-green-400 p-2 rounded text-xs font-mono pointer-events-none">
          <div>Latency: {debugStats.latency.toFixed(2)}s</div>
          <div>Buffer: {debugStats.buffer.toFixed(2)}s</div>
          <div>Dropped: {debugStats.dropped}</div>
          <div>BW: {(debugStats.bandwidth / 1000 / 1000).toFixed(2)} Mbps</div>
        </div>
      )}

      {/* Debug Toggle Area */}
      <div
        className="absolute top-0 left-0 w-20 h-20 z-50 cursor-default"
        onClick={() => {
          debugClickCount.current += 1
          if (debugTimer.current) clearTimeout(debugTimer.current)
          debugTimer.current = setTimeout(() => { debugClickCount.current = 0 }, 1000)

          if (debugClickCount.current >= 5) {
            setShowDebug(prev => !prev)
            debugClickCount.current = 0
          }
        }}
      />

      {/* Circular Timer Overlay */}
      {roundPhase === 'betting' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none">
          <div className={`relative transition-all duration-300 ${roundPhase === 'betting' && isPulsing ? 'animate-pulse scale-110' : 'scale-100'}`}>
            <div className="relative w-36 h-36 md:w-40 md:h-40 flex items-center justify-center">
              {/* Multi-layer atmospheric glow */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${getTimerColor()}40 0%, ${getTimerColor()}25 30%, transparent 70%)`,
                  filter: 'blur(35px)',
                  transform: 'scale(1.6)',
                  animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <div
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${getTimerColor()}50 0%, ${getTimerColor()}30 40%, transparent 65%)`,
                  filter: 'blur(25px)',
                  transform: 'scale(1.3)'
                }}
              />
              <div
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${getTimerColor()}60 0%, ${getTimerColor()}35 35%, transparent 60%)`,
                  filter: 'blur(15px)',
                  transform: 'scale(1.15)'
                }}
              />
              <div
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${getTimerColor()}70 0%, transparent 45%)`,
                  filter: 'blur(8px)',
                  transform: 'scale(1.05)'
                }}
              />

              {/* SVG Circle */}
              <svg
                className="transform -rotate-90 w-full h-full absolute inset-0"
                viewBox="0 0 128 128"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
              >
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(31, 41, 55, 0.6)"
                  strokeWidth="4"
                  fill="rgba(17, 24, 39, 0.5)"
                  className="transition-all duration-300"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.6))' }}
                />

                {/* Multi-layer progress circle */}
                {roundPhase === 'betting' && timeRemaining > 0 && (
                  <>
                    {[18, 14, 10, 7, 3].map((width, i) => (
                      <circle
                        key={i}
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={getTimerColor()}
                        strokeWidth={width}
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - getTimerProgress())}`}
                        className="transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                        style={{
                          filter: `blur(${10 - i * 2}px)`,
                          opacity: 0.35 + i * 0.15
                        }}
                      />
                    ))}
                  </>
                )}
              </svg>

              {/* Timer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="mb-1 transition-all duration-300">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    style={{
                      color: getTimerColor(),
                      filter: `drop-shadow(0 0 6px ${getTimerColor()})`
                    }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>

                <div
                  className="text-white font-bold text-5xl md:text-6xl tabular-nums leading-none"
                  style={{
                    textShadow: `
                      0 0 15px ${getTimerColor()}FF,
                      0 0 25px ${getTimerColor()}DD,
                      0 0 35px ${getTimerColor()}99,
                      0 3px 6px rgba(0, 0, 0, 0.7)
                    `
                  }}
                >
                  {timeRemaining > 0 ? timeRemaining : '--'}
                </div>

                <div
                  className="text-[#FFD700] text-sm md:text-base font-semibold mt-1.5 tracking-wide"
                  style={{
                    textShadow: `
                      0 0 12px rgba(255, 209, 0, 0.9),
                      0 2px 4px rgba(0, 0, 0, 0.8)
                    `
                  }}
                >
                  Betting Time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className
})

VideoPlayer.displayName = 'VideoPlayer'