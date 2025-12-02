/**
 * BettingStrip - Andar/Opening Card/Bahar betting interface
 *
 * Three-segment horizontal betting strip with Andar (left),
 * opening card (center), and Bahar (right) sections.
 */

import React, { useMemo } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { Bet } from '@/types';

interface BettingStripProps {
  selectedPosition: 'andar' | 'bahar' | null;
  selectedBetAmount: number;
  onPositionSelect: (position: 'andar' | 'bahar') => void;
  onPlaceBet: (position: 'andar' | 'bahar') => void;
  isPlacingBet: boolean;
  className?: string;
}

const BettingStrip: React.FC<BettingStripProps> = ({
  selectedPosition,
  selectedBetAmount,
  onPlaceBet,
  isPlacingBet,
  className = ''
}) => {
  const { gameState, currentRound, bets } = useGame();
  const { user, balance } = useAuth();
  
  const userBalance = typeof balance === 'number' ? balance : user?.mainBalance || 0;

  // Calculate bet totals per side and round
  const betTotals = useMemo(() => {
    const typedBets = (bets || []) as Bet[];
    const round1Bets = typedBets.filter((b: Bet) => b.roundId === currentRound?.id && currentRound?.roundNumber === 1);
    const round2Bets = typedBets.filter((b: Bet) => b.roundId === currentRound?.id && currentRound?.roundNumber === 2);
    
    return {
      r1Andar: round1Bets.filter((b: Bet) => b.side === 'andar').reduce((sum: number, b: Bet) => sum + b.amount, 0),
      r1Bahar: round1Bets.filter((b: Bet) => b.side === 'bahar').reduce((sum: number, b: Bet) => sum + b.amount, 0),
      r2Andar: round2Bets.filter((b: Bet) => b.side === 'andar').reduce((sum: number, b: Bet) => sum + b.amount, 0),
      r2Bahar: round2Bets.filter((b: Bet) => b.side === 'bahar').reduce((sum: number, b: Bet) => sum + b.amount, 0)
    };
  }, [bets, currentRound]);

  const handleBetClick = (position: 'andar' | 'bahar') => {
    if (isPlacingBet || currentRound?.status !== 'betting') {
      alert('Betting is not open right now');
      return;
    }

    if (selectedBetAmount === 0) {
      alert('Please select a chip first');
      return;
    }

    if (userBalance < selectedBetAmount) {
      alert('Insufficient balance for this bet');
      return;
    }

    onPlaceBet(position);
  };

  const isBettingDisabled = isPlacingBet || currentRound?.status !== 'betting';

  return (
    <div className={`flex flex-col gap-3 w-full overflow-hidden ${className}`}>
      {/* Main Betting Strip */}
      <div className="flex gap-2 w-full min-w-0">
        {/* Andar Section */}
        <button
          onClick={() => handleBetClick('andar')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          disabled={isBettingDisabled}
          className={`
            flex-1 min-w-0 bg-gradient-to-b from-red-900 to-red-950 rounded-lg p-1
            border-2 transition-all duration-200 active:scale-95 relative
            touch-manipulation select-none
            ${selectedPosition === 'andar'
              ? 'border-gold shadow-lg shadow-gold/50'
              : 'border-red-800/50'
            }
            ${isBettingDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-gold/50 hover:shadow-lg'
            }
          `}
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <div className="flex items-center justify-between h-full px-2 py-1">
            <div className="flex-1 text-left">
              <div className="text-white font-bold text-lg">ANDAR</div>
              <div className="space-y-0.5 mt-1">
                <div className="text-yellow-200 text-xs font-medium">
                  R1: ₹{betTotals.r1Andar.toLocaleString('en-IN')}
                </div>
                {(currentRound?.roundNumber || 1) >= 2 && (
                  <div className="text-yellow-300 text-xs font-medium">
                    R2: ₹{betTotals.r2Andar.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Opening Card Section - Center */}
        <div className="w-16 flex-shrink-0 bg-gradient-to-b from-gold/40 to-gold/60 rounded-lg px-1 py-2 border-2 border-gold/50 flex flex-col justify-center items-center shadow-lg shadow-gold/20">
          {gameState.jokerCard ? (
            <div className="relative flex flex-col items-center justify-center gap-0.5">
              <div className="text-2xl font-bold text-gold transform transition-all duration-300 hover:scale-110 drop-shadow-lg">
                {gameState.jokerCard}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-gold/50 text-2xl font-bold">?</div>
              <div className="text-gold/40 text-[10px] font-semibold">JOKER</div>
            </div>
          )}
        </div>

        {/* Bahar Section */}
        <button
          onClick={() => handleBetClick('bahar')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          disabled={isBettingDisabled}
          className={`
            flex-1 min-w-0 bg-gradient-to-b from-blue-900 to-blue-950 rounded-lg p-1
            border-2 transition-all duration-200 active:scale-95 relative
            touch-manipulation select-none
            ${selectedPosition === 'bahar'
              ? 'border-gold shadow-lg shadow-gold/50'
              : 'border-blue-700/50'
            }
            ${isBettingDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-gold/50 hover:shadow-lg'
            }
          `}
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <div className="flex items-center justify-between h-full px-2 py-1">
            <div className="flex-1 text-right">
              <div className="text-white font-bold text-lg">BAHAR</div>
              <div className="space-y-0.5 mt-1">
                <div className="text-yellow-200 text-xs font-medium">
                  R1: ₹{betTotals.r1Bahar.toLocaleString('en-IN')}
                </div>
                {(currentRound?.roundNumber || 1) >= 2 && (
                  <div className="text-yellow-300 text-xs font-medium">
                    R2: ₹{betTotals.r2Bahar.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default React.memo(BettingStrip);