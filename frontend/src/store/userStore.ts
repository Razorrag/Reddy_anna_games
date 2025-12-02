import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Transaction, Bonus, Referral } from '../types';

interface UserState {
  // User data
  profile: User | null;
  balance: number;
  
  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  
  // Bonuses
  bonuses: Bonus[];
  bonusesLoading: boolean;
  activeBonus: Bonus | null;
  
  // Referrals
  referrals: Referral[];
  referralStats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
  };
  referralsLoading: boolean;
  
  // Actions
  setProfile: (user: User | null) => void;
  updateBalance: (newBalance: number) => void;
  incrementBalance: (amount: number) => void;
  decrementBalance: (amount: number) => void;
  
  // Transaction actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setTransactionsLoading: (loading: boolean) => void;
  
  // Bonus actions
  setBonuses: (bonuses: Bonus[]) => void;
  setActiveBonus: (bonus: Bonus | null) => void;
  updateBonusWagering: (bonusId: string, wageringProgress: number) => void;
  setBonusesLoading: (loading: boolean) => void;
  
  // Referral actions
  setReferrals: (referrals: Referral[]) => void;
  updateReferralStats: (stats: UserState['referralStats']) => void;
  setReferralsLoading: (loading: boolean) => void;
  
  // Reset
  clearUserData: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        profile: null,
        balance: 0,
        transactions: [],
        transactionsLoading: false,
        bonuses: [],
        bonusesLoading: false,
        activeBonus: null,
        referrals: [],
        referralStats: {
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: 0,
        },
        referralsLoading: false,

        // Profile actions
        setProfile: (user) => {
          set({ profile: user });
          if (user) {
            set({ balance: user.balance });
          }
        },

        updateBalance: (newBalance) => set({ balance: newBalance }),

        incrementBalance: (amount) =>
          set((state) => ({
            balance: state.balance + amount,
          })),

        decrementBalance: (amount) =>
          set((state) => ({
            balance: Math.max(0, state.balance - amount),
          })),

        // Transaction actions
        setTransactions: (transactions) => set({ transactions }),

        addTransaction: (transaction) =>
          set((state) => ({
            transactions: [transaction, ...state.transactions],
          })),

        setTransactionsLoading: (loading) =>
          set({ transactionsLoading: loading }),

        // Bonus actions
        setBonuses: (bonuses) => {
          set({ bonuses });
          // Set active bonus (first active/locked bonus)
          const active = bonuses.find((b) => b.status === 'active' || b.status === 'locked');
          set({ activeBonus: active || null });
        },

        setActiveBonus: (bonus) => set({ activeBonus: bonus }),

        updateBonusWagering: (bonusId, wageringProgress) =>
          set((state) => ({
            bonuses: state.bonuses.map((bonus) =>
              bonus.id === bonusId ? { ...bonus, wageringProgress } : bonus
            ),
          })),

        setBonusesLoading: (loading) => set({ bonusesLoading: loading }),

        // Referral actions
        setReferrals: (referrals) => set({ referrals }),

        updateReferralStats: (stats) => set({ referralStats: stats }),

        setReferralsLoading: (loading) => set({ referralsLoading: loading }),

        // Reset
        clearUserData: () =>
          set({
            profile: null,
            balance: 0,
            transactions: [],
            bonuses: [],
            activeBonus: null,
            referrals: [],
            referralStats: {
              totalReferrals: 0,
              activeReferrals: 0,
              totalEarnings: 0,
            },
          }),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          profile: state.profile,
          balance: state.balance,
        }),
      }
    ),
    { name: 'UserStore' }
  )
);