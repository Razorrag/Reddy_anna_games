import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Partner, PartnerCommission, User } from '../types';

interface PartnerEarnings {
  today: number;
  week: number;
  month: number;
  total: number;
}

interface PartnerState {
  // Partner data
  profile: Partner | null;
  
  // Players
  players: User[];
  playersLoading: boolean;
  totalPlayers: number;
  activePlayers: number;
  
  // Commissions
  commissions: PartnerCommission[];
  commissionsLoading: boolean;
  
  // Earnings
  earnings: PartnerEarnings;
  pendingEarnings: number;
  paidEarnings: number;
  
  // Actions
  setProfile: (partner: Partner | null) => void;
  
  // Player actions
  setPlayers: (players: User[]) => void;
  setPlayersLoading: (loading: boolean) => void;
  updatePlayerStats: (totalPlayers: number, activePlayers: number) => void;
  
  // Commission actions
  setCommissions: (commissions: PartnerCommission[]) => void;
  addCommission: (commission: PartnerCommission) => void;
  setCommissionsLoading: (loading: boolean) => void;
  
  // Earnings actions
  updateEarnings: (earnings: Partial<PartnerEarnings>) => void;
  setPendingEarnings: (amount: number) => void;
  setPaidEarnings: (amount: number) => void;
  
  // Reset
  clearPartnerData: () => void;
}

const initialEarnings: PartnerEarnings = {
  today: 0,
  week: 0,
  month: 0,
  total: 0,
};

export const usePartnerStore = create<PartnerState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        profile: null,
        players: [],
        playersLoading: false,
        totalPlayers: 0,
        activePlayers: 0,
        commissions: [],
        commissionsLoading: false,
        earnings: initialEarnings,
        pendingEarnings: 0,
        paidEarnings: 0,

        // Profile actions
        setProfile: (partner) => {
          set({ profile: partner });
          if (partner) {
            set({
              pendingEarnings: partner.pendingEarnings,
              paidEarnings: partner.paidEarnings,
              earnings: {
                ...initialEarnings,
                total: partner.totalEarnings,
              },
            });
          }
        },

        // Player actions
        setPlayers: (players) => set({ players }),

        setPlayersLoading: (loading) => set({ playersLoading: loading }),

        updatePlayerStats: (totalPlayers, activePlayers) =>
          set({ totalPlayers, activePlayers }),

        // Commission actions
        setCommissions: (commissions) => set({ commissions }),

        addCommission: (commission) =>
          set((state) => ({
            commissions: [commission, ...state.commissions],
            pendingEarnings: state.pendingEarnings + commission.commissionAmount,
            earnings: {
              ...state.earnings,
              total: state.earnings.total + commission.commissionAmount,
            },
          })),

        setCommissionsLoading: (loading) =>
          set({ commissionsLoading: loading }),

        // Earnings actions
        updateEarnings: (earnings) =>
          set((state) => ({
            earnings: { ...state.earnings, ...earnings },
          })),

        setPendingEarnings: (amount) => set({ pendingEarnings: amount }),

        setPaidEarnings: (amount) => set({ paidEarnings: amount }),

        // Reset
        clearPartnerData: () =>
          set({
            profile: null,
            players: [],
            totalPlayers: 0,
            activePlayers: 0,
            commissions: [],
            earnings: initialEarnings,
            pendingEarnings: 0,
            paidEarnings: 0,
          }),
      }),
      {
        name: 'partner-storage',
        partialize: (state) => ({
          profile: state.profile,
          pendingEarnings: state.pendingEarnings,
          paidEarnings: state.paidEarnings,
        }),
      }
    ),
    { name: 'PartnerStore' }
  )
);