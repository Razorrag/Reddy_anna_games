import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Default options for TanStack Query
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: How long data is considered fresh
    staleTime: 5 * 60 * 1000, // 5 minutes for most data
    
    // Cache time: How long inactive data stays in cache
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Refetch on window focus
    refetchOnWindowFocus: true,
    
    // Refetch on network reconnection
    refetchOnReconnect: true,
    
    // Retry failed requests
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Show error toasts for failed queries
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch data';
      toast.error(message);
    },
  },
  mutations: {
    // Retry failed mutations
    retry: 1,
    
    // Show error toasts for failed mutations
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(message);
    },
  },
};

/**
 * Create and export query client instance
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query keys for organized cache management
 */
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // User
  user: {
    profile: (userId?: string) => ['user', 'profile', userId] as const,
    balance: (userId?: string) => ['user', 'balance', userId] as const,
    transactions: (userId?: string, filters?: any) => ['user', 'transactions', userId, filters] as const,
    bonuses: (userId?: string) => ['user', 'bonuses', userId] as const,
    activeBonus: (userId?: string) => ['user', 'activeBonus', userId] as const,
    referrals: (userId?: string) => ['user', 'referrals', userId] as const,
    referralStats: (userId?: string) => ['user', 'referralStats', userId] as const,
    statistics: (userId?: string) => ['user', 'statistics', userId] as const,
  },
  
  // Game
  game: {
    current: ['game', 'current'] as const,
    currentRound: ['game', 'currentRound'] as const,
    history: (filters?: any) => ['game', 'history', filters] as const,
    userBets: (userId?: string, roundId?: string) => ['game', 'userBets', userId, roundId] as const,
    statistics: ['game', 'statistics'] as const,
    livePlayerCount: ['game', 'livePlayerCount'] as const,
  },
  
  // Admin
  admin: {
    users: (filters?: any) => ['admin', 'users', filters] as const,
    userDetails: (userId: string) => ['admin', 'userDetails', userId] as const,
    deposits: (filters?: any) => ['admin', 'deposits', filters] as const,
    withdrawals: (filters?: any) => ['admin', 'withdrawals', filters] as const,
    partners: (filters?: any) => ['admin', 'partners', filters] as const,
    partnerDetails: (partnerId: string) => ['admin', 'partnerDetails', partnerId] as const,
    dashboardStats: ['admin', 'dashboardStats'] as const,
    analytics: (filters?: any) => ['admin', 'analytics', filters] as const,
    gameRounds: (filters?: any) => ['admin', 'gameRounds', filters] as const,
  },
  
  // Partner
  partner: {
    profile: (partnerId?: string) => ['partner', 'profile', partnerId] as const,
    players: (partnerId?: string, filters?: any) => ['partner', 'players', partnerId, filters] as const,
    commissions: (partnerId?: string, filters?: any) => ['partner', 'commissions', partnerId, filters] as const,
    earnings: (partnerId?: string) => ['partner', 'earnings', partnerId] as const,
    statistics: (partnerId?: string) => ['partner', 'statistics', partnerId] as const,
  },
};

/**
 * Invalidation helpers for cache management
 */
export const invalidateQueries = {
  // Invalidate all user-related queries
  user: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  },
  
  // Invalidate specific user queries
  userProfile: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
  },
  
  userBalance: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.balance(userId) });
  },
  
  userTransactions: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', 'transactions', userId] });
  },
  
  userBonuses: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', 'bonuses', userId] });
  },
  
  // Invalidate all game-related queries
  game: () => {
    queryClient.invalidateQueries({ queryKey: ['game'] });
  },
  
  // Invalidate specific game queries
  currentRound: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.game.currentRound });
  },
  
  gameHistory: () => {
    queryClient.invalidateQueries({ queryKey: ['game', 'history'] });
  },
  
  // Invalidate all admin queries
  admin: () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  },
  
  // Invalidate specific admin queries
  deposits: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
  },
  
  withdrawals: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
  },
  
  // Invalidate all partner queries
  partner: (partnerId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['partner', partnerId] });
  },
};