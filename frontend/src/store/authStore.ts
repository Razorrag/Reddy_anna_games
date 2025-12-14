import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setAuthToken, removeAuthToken } from '@/lib/api';
import { initializeSocket, disconnectSocket } from '@/lib/socket';
import { tokenManager } from '@/lib/TokenManager';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authChecked: boolean; // Critical flag to prevent premature redirects
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateBalance: (mainBalance: number, bonusBalance: number) => void;
  setLoading: (loading: boolean) => void;
  setAuthChecked: (checked: boolean) => void;
  checkAuthStatus: () => void;
}

/**
 * Authentication store
 * Manages user session, JWT tokens, and login/logout
 * 
 * CRITICAL: authChecked flag prevents flickering during hydration.
 * Components should show loading until authChecked is true.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      authChecked: false, // Start as false until we verify auth state

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token) => {
        set({ token });
        setAuthToken(token);
        tokenManager.setToken(token);
      },

      login: (user, token) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false,
          authChecked: true
        });
        setAuthToken(token);
        tokenManager.setToken(token);
        
        // Initialize WebSocket connection
        initializeSocket(token);
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
          authChecked: true // Keep as true - we've checked, user is just not logged in
        });
        removeAuthToken();
        tokenManager.clearTokens();
        
        // Also clear the persisted Zustand state to prevent stale data
        localStorage.removeItem('auth-storage');
        
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

      setAuthChecked: (checked) => {
        set({ authChecked: checked });
      },

      // Check and validate auth status from persisted storage
      checkAuthStatus: () => {
        const { token, user } = get();
        
        // If we have both token and user, mark as authenticated
        if (token && user) {
          setAuthToken(token);
          tokenManager.setToken(token);
          set({ isAuthenticated: true, authChecked: true });
        } else {
          // Clear any stale state
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            authChecked: true 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after hydration completes
        if (state) {
          // Validate the persisted state
          state.checkAuthStatus();
        }
      },
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