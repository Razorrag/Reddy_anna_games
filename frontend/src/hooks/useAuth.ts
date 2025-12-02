import { useAuthStore } from '../store/authStore';
import { useProfile } from './queries/user/useProfile';
import { useBalance } from './queries/user/useBalance';

/**
 * Convenient hook that combines auth state with user data
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  
  // Fetch user profile and balance if authenticated
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: balance, isLoading: balanceLoading } = useBalance(user?.id);

  return {
    // Auth state
    user,
    token,
    isAuthenticated,
    
    // User data
    profile,
    balance,
    
    // Loading states
    isLoading: profileLoading || balanceLoading,
    
    // Actions
    login,
    logout,
  };
};