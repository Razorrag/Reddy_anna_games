import { useWebSocket } from '@/contexts/WebSocketContext'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

export function ConnectionStatus() {
  const { isConnected, isConnecting, error } = useWebSocket()

  // Don't show anything if connected normally
  if (isConnected && !error) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md shadow-lg border-2
          ${isConnecting
            ? 'bg-yellow-500/90 border-yellow-300'
            : error
            ? 'bg-red-500/90 border-red-300'
            : 'bg-gray-500/90 border-gray-300'
          }
        `}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <div>
              <p className="text-white font-semibold text-sm">Connecting...</p>
              <p className="text-white/80 text-xs">Please wait</p>
            </div>
          </>
        ) : error ? (
          <>
            <WifiOff className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-semibold text-sm">Connection Lost</p>
              <p className="text-white/80 text-xs">Reconnecting...</p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-semibold text-sm">Disconnected</p>
              <p className="text-white/80 text-xs">Check your internet</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}