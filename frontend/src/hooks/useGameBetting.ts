import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { websocketService } from '@/lib/websocket';
import { toast } from 'sonner';

/**
 * Hook for placing bets in the game
 * Implements the legacy game flow with optimistic updates
 */
export function useGameBetting() {
  const { user } = useAuthStore();
  const {
    gameId,
    roundNumber,
    bettingLocked,
    betting,
    round1Bets,
    round2Bets,
    globalStats,
    timeRemaining,
    roundPhase,
    placeBet: localPlaceBet,
    undoBet: localUndoBet,
    updateRoundBets,
    clearBets,
    doubleBets,
    rebetLastRound,
    selectChip,
    selectSide,
  } = useGameStore();

  // Get current round bets
  const currentRoundBets = roundNumber === 1 ? round1Bets : round2Bets;

  // Calculate user's total bet for current round
  const userTotalBet = useMemo(() => {
    return currentRoundBets.andar + currentRoundBets.bahar;
  }, [currentRoundBets]);

  // Check if user can place a bet
  const canBet = useMemo(() => {
    if (!gameId) return false;
    if (bettingLocked) return false;
    if (roundPhase !== 'betting') return false;
    if (timeRemaining <= 0) return false;
    return betting.canPlaceBet;
  }, [gameId, bettingLocked, roundPhase, timeRemaining, betting.canPlaceBet]);

  // Place bet with optimistic update
  const placeBet = useCallback(
    (side: 'andar' | 'bahar', amount?: number) => {
      const betAmount = amount || betting.selectedChip;

      if (!canBet) {
        toast.error('Betting is currently locked');
        return;
      }

      if (!gameId) {
        toast.error('No active game');
        return;
      }

      if (!user) {
        toast.error('Please login to place bets');
        return;
      }

      const userBalance = user.mainBalance || 0;
      if (userBalance < betAmount) {
        toast.error('Insufficient balance');
        return;
      }

      // 1. Optimistic update - update local state immediately
      localPlaceBet(side, betAmount);

      // 2. Send bet to server via WebSocket
      const tempBetId = websocketService.placeBet(gameId, side, betAmount, roundNumber);

      // 3. Update round bets locally (will be confirmed by server)
      updateRoundBets(roundNumber, side, betAmount, tempBetId);

      toast.success(`Bet ₹${betAmount.toLocaleString()} on ${side.toUpperCase()}`);
    },
    [canBet, gameId, user, betting.selectedChip, roundNumber, localPlaceBet, updateRoundBets]
  );

  // Undo last bet
  const undoBet = useCallback(() => {
    if (!canBet) {
      toast.error('Cannot undo - betting is locked');
      return;
    }

    if (!gameId) {
      toast.error('No active game');
      return;
    }

    // 1. Optimistic update
    localUndoBet();

    // 2. Send undo request to server
    websocketService.undoLastBet(gameId, roundNumber);

    toast.info('Bet undone');
  }, [canBet, gameId, roundNumber, localUndoBet]);

  // Double current bets
  const doubleBet = useCallback(() => {
    if (!canBet) {
      toast.error('Cannot double - betting is locked');
      return;
    }

    const currentTotal = betting.totalBetAmount;
    const userBalance = user?.mainBalance || 0;

    if (userBalance < currentTotal) {
      toast.error('Insufficient balance to double');
      return;
    }

    doubleBets();
    toast.success('Bets doubled!');
  }, [canBet, betting.totalBetAmount, user?.mainBalance, doubleBets]);

  // Rebet from last round
  const rebet = useCallback(() => {
    if (!canBet) {
      toast.error('Cannot rebet - betting is locked');
      return;
    }

    rebetLastRound();
    toast.success('Previous bets restored!');
  }, [canBet, rebetLastRound]);

  // Clear all bets
  const clearAllBets = useCallback(() => {
    if (!canBet) {
      toast.error('Cannot clear - betting is locked');
      return;
    }

    clearBets();
    toast.info('Bets cleared');
  }, [canBet, clearBets]);

  return {
    // State
    canBet,
    selectedChip: betting.selectedChip,
    selectedSide: betting.selectedSide,
    currentBets: betting.currentBets,
    totalBetAmount: betting.totalBetAmount,
    userTotalBet,
    currentRoundBets,
    globalStats,
    roundNumber,
    timeRemaining,
    bettingLocked,
    roundPhase,

    // Actions
    placeBet,
    undoBet,
    doubleBet,
    rebet,
    clearAllBets,
    selectChip,
    selectSide,
  };
}

/**
 * Hook for game state selectors
 */
export function useGameState() {
  const {
    gameId,
    roundNumber,
    openingCardDisplay,
    andarCards,
    baharCards,
    winningCard,
    timeRemaining,
    timerDuration,
    roundPhase,
    isConnected,
    isStreamLive,
    showWinnerCelebration,
    showNoWinnerNotification,
    winnerData,
    globalStats,
  } = useGameStore();

  return {
    gameId,
    roundNumber,
    openingCard: openingCardDisplay,
    andarCards,
    baharCards,
    winningCard,
    timeRemaining,
    timerDuration,
    roundPhase,
    isConnected,
    isStreamLive,
    showWinnerCelebration,
    showNoWinnerNotification,
    winnerData,
    globalStats,

    // Derived state
    isGameActive: !!gameId && roundPhase !== 'idle',
    isBettingPhase: roundPhase === 'betting',
    isDealingPhase: roundPhase === 'dealing',
    isCompletePhase: roundPhase === 'complete' || roundPhase === 'no_winner',
    timerProgress: timerDuration > 0 ? (timeRemaining / timerDuration) * 100 : 0,
  };
}

/**
 * Hook for winner celebration
 */
export function useWinnerCelebration() {
  const { showWinnerCelebration, winnerData, hideWinner, showNoWinnerNotification, hideNoWinner } =
    useGameStore();

  return {
    isVisible: showWinnerCelebration,
    winnerData,
    showNoWinner: showNoWinnerNotification,
    hideWinner,
    hideNoWinner,
  };
}
