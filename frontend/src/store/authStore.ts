import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setAuthToken, removeAuthToken } from '@/lib/api';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateBalance: (mainBalance: number, bonusBalance: number) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Authentication store
 * Manages user session, JWT tokens, and login/logout
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token) => {
        set({ token });
        setAuthToken(token);
      },

      login: (user, token) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
        setAuthToken(token);
        
        // Initialize WebSocket connection
        initializeSocket(token);
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
        removeAuthToken();
        
        // Disconnect WebSocket
        disconnectSocket();
      },

      updateBalance: (mainBalance, bonusBalance) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { 
              ...user, 
              mainBalance, 
              bonusBalance 
            } 
          });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = () => {
  return useAuthStore((state) => state.user?.role === 'admin');
};

/**
 * Hook to get user balance
 */
export const useUserBalance = () => {
  return useAuthStore((state) => ({
    mainBalance: state.user?.mainBalance ?? 0,
    bonusBalance: state.user?.bonusBalance ?? 0,
    totalBalance: (state.user?.mainBalance ?? 0) + (state.user?.bonusBalance ?? 0),
  }));
};