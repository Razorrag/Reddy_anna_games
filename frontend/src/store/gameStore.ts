import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Game, GameRound, Bet, Card } from '../types';

// Per-round betting tracking (legacy parity)
interface RoundBets {
  andar: number;
  bahar: number;
  bets: Array<{ id: string; side: 'andar' | 'bahar'; amount: number }>;
}

interface BettingState {
  selectedChip: number;
  selectedSide: 'andar' | 'bahar' | null;
  currentBets: Record<string, number>; // { 'andar': 5000, 'bahar': 0 }
  totalBetAmount: number;
  canPlaceBet: boolean;
  betHistory: Bet[];
}

// Winner payout details
interface WinnerPayoutData {
  side: 'andar' | 'bahar';
  winningCard: string;
  userWon: boolean;
  winAmount: number;
  netProfit: number;
  totalBetAmount: number;
}

interface GameState {
  // Current game data
  currentGame: Game | null;
  currentRound: GameRound | null;
  gameId: string | null;
  
  // Round tracking (legacy: supports multiple rounds)
  roundNumber: number; // 1 or 2
  round1Bets: RoundBets;
  round2Bets: RoundBets;
  lastRoundBets: RoundBets | null; // For rebet functionality
  
  // Betting state
  betting: BettingState;
  bettingLocked: boolean; // Timer expired, no more bets
  myBets: Bet[]; // User's bets for current round
  dealtCards: Array<{ side: 'andar' | 'bahar'; card: Card }>; // Cards dealt in current round
  
  // Cards
  jokerCard: Card | null;
  openingCardDisplay: string | null; // "A♠" format for display
  andarCards: Card[];
  baharCards: Card[];
  winningCard: string | null;
  
  // Timer
  timeRemaining: number;
  timerDuration: number; // Default 30 seconds
  roundPhase: 'idle' | 'waiting' | 'betting' | 'dealing' | 'complete' | 'no_winner';
  
  // UI state
  isStreamLive: boolean;
  showWinnerCelebration: boolean;
  showNoWinnerNotification: boolean;
  showFlash: boolean;
  winnerData: WinnerPayoutData | null;
  isConnected: boolean;
  
  // Chip selection
  selectedChip: number;
  setSelectedChip: (amount: number) => void;
  
  // Actions
  setCurrentGame: (game: Game | null) => void;
  setCurrentRound: (round: GameRound | null) => void;
  setGameId: (gameId: string | null) => void;
  
  // Round actions
  setRoundNumber: (round: number) => void;
  updateRoundBets: (round: number, side: 'andar' | 'bahar', amount: number, betId: string) => void;
  clearRoundBets: (round: number) => void;
  saveLastRoundBets: () => void;
  
  // Betting actions
  selectChip: (amount: number) => void;
  selectSide: (side: 'andar' | 'bahar') => void;
  placeBet: (side: 'andar' | 'bahar', amount: number) => void;
  undoBet: () => void;
  clearBets: () => void;
  rebetLastRound: () => void;
  doubleBets: () => void;
  addMyBet: (bet: Bet) => void;
  setBettingLocked: (locked: boolean) => void;
  
  // Card actions
  setJokerCard: (card: Card) => void;
  setOpeningCard: (display: string) => void;
  addAndarCard: (card: Card) => void;
  addBaharCard: (card: Card) => void;
  addDealtCard: (cardData: { side: 'andar' | 'bahar'; card: Card }) => void;
  setWinningCard: (card: string) => void;
  clearCards: () => void;
  clearDealtCards: () => void;
  
  // Timer actions
  setTimeRemaining: (seconds: number) => void;
  setTimerDuration: (seconds: number) => void;
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
  showWinner: (data: WinnerPayoutData) => void;
  hideWinner: () => void;
  showNoWinner: () => void;
  hideNoWinner: () => void;
  
  // Reset
  resetGame: () => void;
  resetForNewRound: () => void;
}

const initialBettingState: BettingState = {
  selectedChip: 2500,
  selectedSide: null,
  currentBets: {},
  totalBetAmount: 0,
  canPlaceBet: false,
  betHistory: [],
};

const initialRoundBets: RoundBets = {
  andar: 0,
  bahar: 0,
  bets: [],
};

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentGame: null,
      currentRound: null,
      gameId: null,
      roundNumber: 1,
      round1Bets: { ...initialRoundBets },
      round2Bets: { ...initialRoundBets },
      lastRoundBets: null,
      betting: initialBettingState,
      bettingLocked: false,
      myBets: [],
      dealtCards: [],
      jokerCard: null,
      openingCardDisplay: null,
      andarCards: [],
      baharCards: [],
      winningCard: null,
      timeRemaining: 0,
      timerDuration: 30,
      roundPhase: 'idle',
      isStreamLive: false,
      showWinnerCelebration: false,
      showNoWinnerNotification: false,
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
      setGameId: (gameId) => set({ gameId }),

      // Round actions
      setRoundNumber: (roundNumber) => set({ roundNumber }),
      
      updateRoundBets: (round, side, amount, betId) =>
        set((state) => {
          const roundKey = round === 1 ? 'round1Bets' : 'round2Bets';
          const currentRoundBets = state[roundKey];
          
          return {
            [roundKey]: {
              ...currentRoundBets,
              [side]: currentRoundBets[side] + amount,
              bets: [...currentRoundBets.bets, { id: betId, side, amount }],
            },
          };
        }),
      
      clearRoundBets: (round) =>
        set({
          [round === 1 ? 'round1Bets' : 'round2Bets']: { ...initialRoundBets },
        }),
      
      saveLastRoundBets: () =>
        set((state) => ({
          lastRoundBets: state.roundNumber === 1 
            ? { ...state.round1Bets } 
            : { ...state.round2Bets },
        })),

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
      
      setBettingLocked: (locked) => set({ bettingLocked: locked }),

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
          betting: {
            ...state.betting,
            betHistory: [...state.betting.betHistory, bet],
          },
        })),

      rebetLastRound: () => {
        const { lastRoundBets, betting } = get();
        if (!lastRoundBets) return;
        
        set({
          betting: {
            ...betting,
            currentBets: {
              andar: lastRoundBets.andar,
              bahar: lastRoundBets.bahar,
            },
            totalBetAmount: lastRoundBets.andar + lastRoundBets.bahar,
          },
        });
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
      setOpeningCard: (display) => set({ openingCardDisplay: display }),
      setWinningCard: (card) => set({ winningCard: card }),
      
      addAndarCard: (card) =>
        set((state) => ({
          andarCards: [...state.andarCards, card],
        })),
      addBaharCard: (card) =>
        set((state) => ({
          baharCards: [...state.baharCards, card],
        })),
      addDealtCard: (cardData) =>
        set((state) => {
          // Also add to respective card array
          const updates: any = {
            dealtCards: [...state.dealtCards, cardData],
          };
          if (cardData.side === 'andar') {
            updates.andarCards = [...state.andarCards, cardData.card];
          } else {
            updates.baharCards = [...state.baharCards, cardData.card];
          }
          return updates;
        }),

      clearCards: () =>
        set({
          jokerCard: null,
          openingCardDisplay: null,
          andarCards: [],
          baharCards: [],
          winningCard: null,
        }),

      clearDealtCards: () =>
        set({
          dealtCards: [],
        }),

      // Timer actions
      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
      setTimerDuration: (duration) => set({ timerDuration: duration }),
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
          bettingLocked: !canBet,
        })),

      // Flash screen
      setShowFlash: (show) => set({ showFlash: show }),

      // Winner actions
      showWinner: (data) =>
        set({
          showWinnerCelebration: true,
          winnerData: data,
          roundPhase: 'complete',
        }),
      hideWinner: () =>
        set({
          showWinnerCelebration: false,
          winnerData: null,
        }),
      showNoWinner: () =>
        set({
          showNoWinnerNotification: true,
          roundPhase: 'no_winner',
        }),
      hideNoWinner: () =>
        set({
          showNoWinnerNotification: false,
        }),

      // Chip selection
      setSelectedChip: (amount) => set({ selectedChip: amount }),

      // Reset
      resetGame: () =>
        set({
          currentGame: null,
          currentRound: null,
          gameId: null,
          roundNumber: 1,
          round1Bets: { ...initialRoundBets },
          round2Bets: { ...initialRoundBets },
          betting: initialBettingState,
          bettingLocked: false,
          myBets: [],
          dealtCards: [],
          jokerCard: null,
          openingCardDisplay: null,
          andarCards: [],
          baharCards: [],
          winningCard: null,
          timeRemaining: 0,
          roundPhase: 'idle',
          showWinnerCelebration: false,
          showNoWinnerNotification: false,
          winnerData: null,
        }),
      
      resetForNewRound: () =>
        set((state) => ({
          dealtCards: [],
          andarCards: [],
          baharCards: [],
          winningCard: null,
          bettingLocked: false,
          showWinnerCelebration: false,
          showNoWinnerNotification: false,
          winnerData: null,
          betting: {
            ...state.betting,
            currentBets: {},
            totalBetAmount: 0,
            betHistory: [],
            canPlaceBet: true,
          },
          myBets: [],
        })),
    }),
    { name: 'GameStore' }
  )
);