import { useGameStore } from '../store/gameStore';
import { useCurrentRound, useCurrentGame } from './queries/game';
import { usePlaceBet, useCancelBet } from './mutations/game';

/**
 * Consolidated game hook for easier access to game state and actions
 */
export const useGame = () => {
  // Store state
  const {
    currentRound,
    gameState,
    bets,
    addBet,
    removeBet,
    clearBets,
    setGameState,
  } = useGameStore();

  // Query hooks
  const { data: currentRoundData, isLoading: isLoadingRound } = useCurrentRound();
  const { data: currentGameData, isLoading: isLoadingGame } = useCurrentGame();

  // Mutation hooks
  const placeBetMutation = usePlaceBet();
  const cancelBetMutation = useCancelBet();

  return {
    // State
    currentRound: currentRoundData || currentRound,
    gameState: currentGameData?.state || gameState,
    bets,
    
    // Loading states
    isLoading: isLoadingRound || isLoadingGame,
    isPlacingBet: placeBetMutation.isPending,
    isCancellingBet: cancelBetMutation.isPending,
    
    // Actions
    placeBet: placeBetMutation.mutate,
    cancelBet: cancelBetMutation.mutate,
    addBet,
    removeBet,
    clearBets,
    setGameState,
  };
};