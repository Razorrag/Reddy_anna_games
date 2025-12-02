/**
 * ProgressBar - Bottom progress indicator
 * 
 * Thin yellow progress bar at the bottom showing round progress
 * 1px height gold gradient bar
 */

import React from 'react';
import { useGame } from '@/hooks/useGame';

interface ProgressBarProps {
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ className = '' }) => {
  const { currentRound } = useGame();

  // Calculate progress based on round status
  const progress = currentRound?.status === 'betting'
    ? 33
    : currentRound?.status === 'dealing'
      ? 66
      : currentRound?.status === 'complete'
        ? 100
        : 0;

  return (
    <div className={`bg-navy-light/50 ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-gold to-gold/80 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;