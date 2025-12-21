/**
 * WebRTCPlayer - Ultra-low latency WebRTC streaming with OvenMediaEngine
 * 
 * Features:
 * - <500ms latency with WebRTC
 * - Pause/Resume support with frozen frame
 * - Auto-reconnection on network issues
 * - Proper cleanup on unmount
 * - Page refresh handling
 */

import { useEffect, useRef, useState, useCallback } from 'react'

interface WebRTCPlayerProps {
  streamUrl: string
  isPaused?: boolean
  onError?: (error: string) => void
  onConnected?: () => void
  onDisconnected?: () => void
  className?: string
}

export const WebRTCPlayer = ({ 
  streamUrl, 
  isPaused = false,
  onError, 
  onConnected,
  onDisconnected,
  className 
}: WebRTCPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed' | 'closed'>('connecting')
  const [latency, setLatency] = useState<number>(0)
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)

  // Capture current frame for pause
  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || video.readyState < 2) return false

    try {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frameData = canvas.toDataURL('image/jpeg', 0.95)
        setFrozenFrame(frameData)
        return true
      }
    } catch (error) {
      console.error('Frame capture error:', error)
    }
    return false
  }, [])

  // Close existing connection
  const closeConnection = useCallback(() => {
    if (pcRef.current) {
      try {
        pcRef.current.close()
      } catch (error) {
        console.error('Error closing peer connection:', error)
      }
      pcRef.current = null
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  // Connect to WebRTC stream
  const connectWebRTC = useCallback(async () => {
    if (!videoRef.current || isPaused) return

    try {
      setConnectionState('connecting')
      setIsReconnecting(false)

      // Close any existing connection
      closeConnection()

      // Create RTCPeerConnection with optimized config for low latency
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      })

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('📺 WebRTC track received')
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0]
          videoRef.current.play().catch(err => {
            console.error('Play error:', err)
            // Try muted autoplay
            videoRef.current!.muted = true
            videoRef.current!.play()
          })
        }
      }

      // Monitor connection state
      pc.oniceconnectionstatechange = () => {
        console.log('🔌 ICE connection state:', pc.iceConnectionState)
        
        switch (pc.iceConnectionState) {
          case 'connected':
          case 'completed':
            setConnectionState('connected')
            setIsReconnecting(false)
            onConnected?.()
            break
          case 'disconnected':
            setConnectionState('connecting')
            setIsReconnecting(true)
            // Try to reconnect after 2 seconds
            reconnectTimerRef.current = setTimeout(() => {
              if (!isPaused) connectWebRTC()
            }, 2000)
            break
          case 'failed':
            setConnectionState('failed')
            onError?.('WebRTC connection failed')
            onDisconnected?.()
            // Try to reconnect after 5 seconds
            reconnectTimerRef.current = setTimeout(() => {
              if (!isPaused) connectWebRTC()
            }, 5000)
            break
          case 'closed':
            setConnectionState('closed')
            onDisconnected?.()
            break
        }
      }

      // Add transceivers for receiving video/audio
      pc.addTransceiver('video', { direction: 'recvonly' })
      pc.addTransceiver('audio', { direction: 'recvonly' })

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      })

      await pc.setLocalDescription(offer)

      // Send offer to OME signaling server
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const answerSdp = await response.text()
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      })

      pcRef.current = pc

      // Monitor latency
      const latencyInterval = setInterval(() => {
        if (!pcRef.current) return
        
        pcRef.current.getStats().then(stats => {
          stats.forEach(stat => {
            if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
              const delay = stat.jitterBufferDelay && stat.jitterBufferEmittedCount
                ? (stat.jitterBufferDelay / stat.jitterBufferEmittedCount) * 1000
                : 0
              setLatency(delay || 0)
            }
          })
        })
      }, 1000)

      return () => {
        clearInterval(latencyInterval)
      }

    } catch (error) {
      console.error('WebRTC connection error:', error)
      setConnectionState('failed')
      onError?.(error instanceof Error ? error.message : 'Connection failed')
      
      // Retry connection after delay
      reconnectTimerRef.current = setTimeout(() => {
        if (!isPaused) connectWebRTC()
      }, 5000)
    }
  }, [streamUrl, isPaused, onError, onConnected, onDisconnected, closeConnection])

  // Handle pause state changes
  useEffect(() => {
    if (isPaused) {
      // Capture frame before pausing
      captureFrame()
      // Close connection
      closeConnection()
      setConnectionState('closed')
    } else {
      // Resume - clear frozen frame and reconnect
      setFrozenFrame(null)
      connectWebRTC()
    }
  }, [isPaused, captureFrame, closeConnection, connectWebRTC])

  // Initial connection
  useEffect(() => {
    if (!isPaused) {
      const cleanup = connectWebRTC()
      return () => {
        cleanup?.then(fn => fn?.())
      }
    }
  }, []) // Only on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeConnection()
    }
  }, [closeConnection])

  // Handle page visibility (refresh, tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - capture frame
        captureFrame()
      } else if (!isPaused) {
        // Page visible again - reconnect
        setFrozenFrame(null)
        connectWebRTC()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isPaused, captureFrame, connectWebRTC])

  return (
    <div className={`relative ${className}`}>
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: frozenFrame ? 0 : 1
        }}
      />

      {/* Frozen frame overlay (when paused) */}
      {frozenFrame && (
        <div className="absolute inset-0 z-10">
          <img
            src={frozenFrame}
            alt="Stream paused"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Connection status indicators */}
      {connectionState === 'connecting' && !frozenFrame && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
            <p className="text-white text-sm">Connecting to stream...</p>
          </div>
        </div>
      )}

      {isReconnecting && frozenFrame && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-black/90 px-6 py-4 rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFD700] mx-auto mb-3"></div>
            <p className="text-white text-sm">Reconnecting...</p>
          </div>
        </div>
      )}
      
      {connectionState === 'connected' && !isPaused && (
        <div className="absolute top-2 left-2 bg-green-500/90 px-3 py-1 rounded-full text-xs text-white font-medium z-30 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          WebRTC • {latency.toFixed(0)}ms
        </div>
      )}

      {connectionState === 'failed' && !isReconnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-red-900/90 px-6 py-4 rounded-lg text-center max-w-xs">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-white text-sm font-medium">Connection Failed</p>
            <p className="text-white/70 text-xs mt-2">Retrying...</p>
          </div>
        </div>
      )}
    </div>
  )
}