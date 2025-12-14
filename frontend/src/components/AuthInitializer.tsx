import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer - Validates stored auth token on app startup
 * This prevents flickering and incorrect redirects from stale localStorage data
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isValidating, setIsValidating] = useState(true);
  const { token, isAuthenticated, logout, login } = useAuthStore();

  useEffect(() => {
    const validateAuth = async () => {
      // If no token or not authenticated, no validation needed
      if (!token || !isAuthenticated) {
        setIsValidating(false);
        return;
      }

      try {
        // Validate token with backend
        const response = await api.get('/api/auth/me');
        
        if (response.data?.user) {
          // Token is valid - update user data in case it changed
          login(response.data.user, token);
        } else {
          // Invalid response - clear auth
          logout();
        }
      } catch (error) {
        // Token is invalid/expired - clear auth
        console.log('Auth validation failed, clearing stale session');
        logout();
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, []); // Only run once on mount

  // Show nothing while validating to prevent flicker
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#FFD700] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
