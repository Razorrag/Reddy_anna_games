/**
 * MobileGameLayout - Main Mobile Game Layout Component
 *
 * Mobile-first layout matching the legacy implementation exactly
 * with 7-component vertical stack and royal theme
 */

import React, { useState } from 'react';
import MobileTopBar from './MobileTopBar';
import BettingStrip from './BettingStrip';
import HorizontalChipSelector from './HorizontalChipSelector';
import ControlsRow from './ControlsRow';
import CardHistory from './CardHistory';
import ProgressBar from './ProgressBar';
import { VideoPlayer } from '../VideoPlayer';
import { WinnerCelebration } from '../WinnerCelebration';
import CardSequenceDisplay from './CardSequenceDisplay';
import RoundTransition from '../RoundTransition';
import { useAuth } from '@/hooks/useAuth';

interface MobileGameLayoutProps {
  selectedBetAmount: number;
  selectedPosition: 'andar' | 'bahar' | null;
  betAmounts: number[];
  onPositionSelect: (position: 'andar' | 'bahar') => void;
  onPlaceBet: (position: 'andar' | 'bahar') => void;
  onChipSelect: (amount: number) => void;
  onUndoBet: () => void;
  onRebet: () => void;
  onWalletClick: () => void;
  onHistoryClick: () => void;
  onProfileClick: () => void;
  onBonusClick: () => void;
  onGameClick?: (gameId: string) => void;
  isPlacingBet: boolean;
  className?: string;
}

const MobileGameLayout: React.FC<MobileGameLayoutProps> = ({
  selectedBetAmount,
  selectedPosition,
  betAmounts,
  onPositionSelect,
  onPlaceBet,
  onChipSelect,
  onUndoBet,
  onRebet,
  onWalletClick,
  onHistoryClick,
  onProfileClick,
  onBonusClick,
  onGameClick,
  isPlacingBet,
  className = ''
}) => {
  const { user, balance } = useAuth();
  const [showChipSelector, setShowChipSelector] = useState(false);
  
  const userBalance = typeof balance === 'number' ? balance : user?.mainBalance || 0;

  const handleShowChipSelector = () => {
    setShowChipSelector(!showChipSelector);
  };

  return (
    <div className={`game-container min-h-screen bg-black text-white overflow-hidden ${className}`}>
      {/* Main game container with responsive sizing */}
      <div className="max-w-md mx-auto h-screen flex flex-col relative">
        
        {/* Top Bar - Round, Profile, Bonus, Wallet */}
        <MobileTopBar 
          onWalletClick={onWalletClick}
          onProfileClick={onProfileClick}
          onBonusClick={onBonusClick}
        />

        {/* Video Area - 65-70% screen height with timer overlay */}
        <div className="flex-1 relative min-h-0">
          <VideoPlayer className="w-full h-full" />
          
          {/* Card Sequence Display Overlay - Shows dealt cards in real-time */}
          <div className="absolute bottom-0 left-0 right-0">
            <CardSequenceDisplay className="w-full" />
          </div>
        </div>

        {/* Betting Strip - Andar/Joker Card/Bahar */}
        <BettingStrip
          selectedPosition={selectedPosition}
          selectedBetAmount={selectedBetAmount}
          onPositionSelect={onPositionSelect}
          onPlaceBet={onPlaceBet}
          isPlacingBet={isPlacingBet}
          className="px-4 py-2"
        />

        {/* Horizontal Chip Selector - Toggleable swipeable chip selection */}
        <HorizontalChipSelector
          betAmounts={betAmounts}
          selectedAmount={selectedBetAmount}
          userBalance={userBalance}
          onChipSelect={onChipSelect}
          isVisible={showChipSelector}
        />

        {/* Controls Row - History, Undo, Select Chip, Rebet */}
        <ControlsRow
          selectedBetAmount={selectedBetAmount}
          isPlacingBet={isPlacingBet}
          onUndoBet={onUndoBet}
          onRebet={onRebet}
          onHistoryClick={onHistoryClick}
          onShowChipSelector={handleShowChipSelector}
          className="px-4 py-2"
        />

        {/* Card History Row - Recent results */}
        <CardHistory
          onHistoryClick={onHistoryClick}
          onGameClick={onGameClick}
          className="px-4 py-2"
        />

        {/* Progress Bar - Bottom phase indicator */}
        <ProgressBar className="h-1" />

        {/* Round Transition Notification */}
        <RoundTransition />

        {/* Winner Celebration - Overlays entire game layout */}
        <WinnerCelebration />
      </div>
    </div>
  );
};

export default MobileGameLayout;