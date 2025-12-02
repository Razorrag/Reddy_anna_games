import { ReactNode } from 'react'

interface MobileGameLayoutProps {
  children: ReactNode
}

export function MobileGameLayout({ children }: MobileGameLayoutProps) {
  // Extract children components for mobile-optimized layout
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]">
      {/* Mobile-optimized vertical stack layout */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Connection Status - First child */}
        <div className="flex-shrink-0">
          {childrenArray[0]}
        </div>

        {/* Video Player - Takes significant space */}
        <div className="flex-shrink-0">
          {childrenArray[1]}
        </div>

        {/* Scrollable game content area */}
        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="p-4 space-y-4">
            {/* Game Table */}
            <div>
              {childrenArray[2]}
            </div>

            {/* Timer Overlay (absolute positioned over video) */}
            {childrenArray[3]}

            {/* Betting Panel */}
            <div>
              {childrenArray[4]}
            </div>

            {/* Chip Selector */}
            <div>
              {childrenArray[5]}
            </div>

            {/* Round History - Collapsible on mobile */}
            <details className="bg-black/40 backdrop-blur-sm rounded-lg border border-[#FFD700]/30 overflow-hidden">
              <summary className="p-4 cursor-pointer text-[#FFD700] font-semibold flex items-center justify-between">
                <span>Round History</span>
                <span className="text-sm text-gray-400">Tap to expand</span>
              </summary>
              <div className="p-4 pt-0">
                {childrenArray[6]}
              </div>
            </details>
          </div>
        </div>

        {/* Overlays - Winner Celebration & No Winner */}
        {childrenArray[7]}
        {childrenArray[8]}
      </div>

      {/* Mobile-specific styles */}
      <style>{`
        /* Safe area padding for notched devices */}
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Custom scrollbar for mobile */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 2px;
        }

        /* Touch-friendly details/summary */
        details summary::-webkit-details-marker {
          display: none;
        }

        details[open] summary {
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
          margin-bottom: 0;
        }

        /* Prevent zoom on input focus (iOS) */
        input[type="number"],
        input[type="tel"],
        input[type="text"],
        select,
        textarea {
          font-size: 16px !important;
        }

        /* Disable pull-to-refresh */
        body {
          overscroll-behavior-y: contain;
        }
      `}</style>
    </div>
  )
}