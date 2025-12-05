/**
 * ProgressBar - Bottom progress indicator
 *
 * Thin yellow progress bar at the bottom showing round progress
 * 1px height gold gradient bar
 * Timer-based smooth progress during betting phase
 */

import React from 'react';
import { useGame } from '@/hooks/useGame';
import { useGameStore } from '@/store/gameStore';

interface ProgressBarProps {
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ className = '' }) => {
  const { currentRound } = useGame();
  const { timeRemaining, roundPhase } = useGameStore();

  // Calculate progress based on round status and timer
  const progress = React.useMemo(() => {
    // During betting phase, use timer for smooth progress (0-60 seconds = 0-33%)
    if (roundPhase === 'betting' && timeRemaining > 0) {
      const maxTime = 60; // Assuming 60 seconds betting time
      const bettingProgress = ((maxTime - timeRemaining) / maxTime) * 33;
      return Math.min(33, Math.max(0, bettingProgress));
    }
    
    // For other phases, use status-based progress
    if (currentRound?.status === 'betting') return 33;
    if (currentRound?.status === 'dealing' || roundPhase === 'dealing') return 66;
    if (currentRound?.status === 'complete' || roundPhase === 'complete') return 100;
    
    return 0;
  }, [currentRound?.status, roundPhase, timeRemaining]);

  return (
    <div className={`bg-navy-light/50 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-gold to-gold/80 transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;