import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Game, GameRound, Bet, Card } from '../types';

interface BettingState {
  selectedChip: number;
  selectedSide: 'andar' | 'bahar' | null;
  currentBets: Record<string, number>; // { 'andar': 5000, 'bahar': 0 }
  totalBetAmount: number;
  canPlaceBet: boolean;
  betHistory: Bet[];
}

interface GameState {
  // Current game data
  currentGame: Game | null;
  currentRound: GameRound | null;
  
  // Betting state
  betting: BettingState;
  myBets: Bet[]; // User's bets for current round
  dealtCards: Array<{ side: 'andar' | 'bahar'; card: Card }>; // Cards dealt in current round
  
  // Cards
  jokerCard: Card | null;
  andarCards: Card[];
  baharCards: Card[];
  
  // Timer
  timeRemaining: number;
  roundPhase: 'waiting' | 'betting' | 'dealing' | 'complete';
  
  // UI state
  isStreamLive: boolean;
  showWinnerCelebration: boolean;
  showFlash: boolean;
  winnerData: {
    side: 'andar' | 'bahar';
    winAmount: number;
  } | null;
  isConnected: boolean;
  
  // Chip selection
  selectedChip: number;
  setSelectedChip: (amount: number) => void;
  
  // Actions
  setCurrentGame: (game: Game | null) => void;
  setCurrentRound: (round: GameRound | null) => void;
  
  // Betting actions
  selectChip: (amount: number) => void;
  selectSide: (side: 'andar' | 'bahar') => void;
  placeBet: (side: 'andar' | 'bahar', amount: number) => void;
  undoBet: () => void;
  clearBets: () => void;
  rebetLastRound: () => void;
  doubleBets: () => void;
  addMyBet: (bet: Bet) => void;
  
  // Card actions
  setJokerCard: (card: Card) => void;
  addAndarCard: (card: Card) => void;
  addBaharCard: (card: Card) => void;
  addDealtCard: (cardData: { side: 'andar' | 'bahar'; card: Card }) => void;
  clearCards: () => void;
  clearDealtCards: () => void;
  
  // Timer actions
  setTimeRemaining: (seconds: number) => void;
  decrementTimer: () => void;
  setRoundPhase: (phase: GameState['roundPhase']) => void;
  
  // Stream actions
  setStreamLive: (isLive: boolean) => void;
  
  // Connection actions
  setConnectionStatus: (connected: boolean) => void;
  
  // Betting control
  setBetting: (canBet: boolean) => void;
  
  // Flash screen
  setShowFlash: (show: boolean) => void;
  
  // Winner actions
  showWinner: (side: 'andar' | 'bahar', winAmount: number) => void;
  hideWinner: () => void;
  
  // Reset
  resetGame: () => void;
}

const initialBettingState: BettingState = {
  selectedChip: 2500,
  selectedSide: null,
  currentBets: {},
  totalBetAmount: 0,
  canPlaceBet: false,
  betHistory: [],
};

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentGame: null,
      currentRound: null,
      betting: initialBettingState,
      myBets: [],
      dealtCards: [],
      jokerCard: null,
      andarCards: [],
      baharCards: [],
      timeRemaining: 0,
      roundPhase: 'waiting',
      isStreamLive: false,
      showWinnerCelebration: false,
      showFlash: true,
      winnerData: null,
      selectedChip: 2500,
      isConnected: false,

      // Basic setters
      setCurrentGame: (game) => set({ currentGame: game }),
      setCurrentRound: (round) => {
        set({ currentRound: round });
        if (round) {
          set({
            roundPhase: round.status === 'betting' ? 'betting' : round.status === 'dealing' ? 'dealing' : 'complete',
            betting: { ...get().betting, canPlaceBet: round.status === 'betting' },
          });
        }
      },

      // Betting actions
      selectChip: (amount) =>
        set((state) => ({
          betting: { ...state.betting, selectedChip: amount },
        })),

      selectSide: (side) =>
        set((state) => ({
          betting: { ...state.betting, selectedSide: side },
        })),

      placeBet: (side, amount) =>
        set((state) => {
          const currentBets = { ...state.betting.currentBets };
          currentBets[side] = (currentBets[side] || 0) + amount;
          const totalBetAmount = Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);

          return {
            betting: {
              ...state.betting,
              currentBets,
              totalBetAmount,
            },
          };
        }),

      undoBet: () =>
        set((state) => {
          const betHistory = [...state.betting.betHistory];
          const lastBet = betHistory.pop();

          if (!lastBet) return state;

          const currentBets = { ...state.betting.currentBets };
          const side = lastBet.side as 'andar' | 'bahar';
          currentBets[side] = Math.max(0, (currentBets[side] || 0) - lastBet.amount);
          const totalBetAmount = Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);

          return {
            betting: {
              ...state.betting,
              currentBets,
              totalBetAmount,
              betHistory,
            },
          };
        }),

      clearBets: () =>
        set((state) => ({
          betting: {
            ...state.betting,
            currentBets: {},
            totalBetAmount: 0,
            betHistory: [],
          },
          myBets: [],
        })),

      addMyBet: (bet) =>
        set((state) => ({
          myBets: [...state.myBets, bet],
        })),

      rebetLastRound: () => {
        // This will be populated from the last round's bets
        // Implementation depends on storing last round data
      },

      doubleBets: () =>
        set((state) => {
          const currentBets = { ...state.betting.currentBets };
          Object.keys(currentBets).forEach((key) => {
            currentBets[key] *= 2;
          });
          const totalBetAmount = state.betting.totalBetAmount * 2;

          return {
            betting: {
              ...state.betting,
              currentBets,
              totalBetAmount,
            },
          };
        }),

      // Card actions
      setJokerCard: (card) => set({ jokerCard: card }),
      addAndarCard: (card) =>
        set((state) => ({
          andarCards: [...state.andarCards, card],
        })),
      addBaharCard: (card) =>
        set((state) => ({
          baharCards: [...state.baharCards, card],
        })),
      addDealtCard: (cardData) =>
        set((state) => ({
          dealtCards: [...state.dealtCards, cardData],
        })),

      clearCards: () =>
        set({
          jokerCard: null,
          andarCards: [],
          baharCards: [],
        }),

      clearDealtCards: () =>
        set({
          dealtCards: [],
        }),

      // Timer actions
      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
      decrementTimer: () =>
        set((state) => ({
          timeRemaining: Math.max(0, state.timeRemaining - 1),
        })),
      setRoundPhase: (phase) => set({ roundPhase: phase }),

      // Stream actions
      setStreamLive: (isLive) => set({ isStreamLive: isLive }),

      // Connection actions
      setConnectionStatus: (connected) => set({ isConnected: connected }),

      // Betting control
      setBetting: (canBet) =>
        set((state) => ({
          betting: { ...state.betting, canPlaceBet: canBet },
        })),

      // Flash screen
      setShowFlash: (show) => set({ showFlash: show }),

      // Winner actions
      showWinner: (side, winAmount) =>
        set({
          showWinnerCelebration: true,
          winnerData: { side, winAmount },
        }),
      hideWinner: () =>
        set({
          showWinnerCelebration: false,
          winnerData: null,
        }),

      // Chip selection
      setSelectedChip: (amount) => set({ selectedChip: amount }),

      // Reset
      resetGame: () =>
        set({
          betting: initialBettingState,
          myBets: [],
          dealtCards: [],
          jokerCard: null,
          andarCards: [],
          baharCards: [],
          timeRemaining: 0,
          roundPhase: 'waiting',
          showWinnerCelebration: false,
          winnerData: null,
        }),
    }),
    { name: 'GameStore' }
  )
);