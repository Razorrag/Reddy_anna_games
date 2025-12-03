/**
 * Global TypeScript declarations
 * Handles missing types, browser APIs, and module augmentations
 */

// ============================================
// React Router / Wouter
// ============================================

declare module 'wouter' {
  export function useLocation(): [string, (path: string) => void];
  export function useRoute(pattern: string): [boolean, Record<string, string>];
  export function useParams<T = Record<string, string>>(): T;
  export function useSearch(): string;
  export function Route(props: { path: string; component: React.ComponentType<any> }): JSX.Element;
  export function Link(props: { href: string; children: React.ReactNode; [key: string]: any }): JSX.Element;
  export function Switch(props: { children: React.ReactNode }): JSX.Element;
  export function Redirect(props: { to: string }): JSX.Element;
  export function Router(props: { children: React.ReactNode }): JSX.Element;
  export const useNavigate: () => (path: string) => void;
}

// ============================================
// React Hooks Augmentation
// ============================================

declare global {
  const useParams: <T = Record<string, string>>() => T;
  const useNavigate: () => (path: string) => void;
  const navigate: (path: string) => void;
}

// ============================================
// API Function Type Overrides
// ============================================

declare module '../lib/api' {
  export const api: {
    get: <T = any>(url: string, config?: any) => Promise<{ data: T }>;
    post: <T = any>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
    put: <T = any>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
    patch: <T = any>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
    delete: <T = any>(url: string, config?: any) => Promise<{ data: T }>;
  };
}

// ============================================
// Mutation Function Signatures
// ============================================

declare module '../hooks/mutations/admin/useUpdateUser' {
  export const useUpdateUser: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useApproveWithdrawal' {
  export const useApproveWithdrawal: () => {
    mutate: (data: string | { requestId?: string; withdrawalId?: string; transactionId?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useRejectWithdrawal' {
  export const useRejectWithdrawal: () => {
    mutate: (data: string | { requestId?: string; withdrawalId?: string; transactionId?: string; reason?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useSuspendUser' {
  export const useSuspendUser: () => {
    mutate: (data: string | { userId?: string; reason?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useBanUser' {
  export const useBanUser: () => {
    mutate: (data: string | { userId?: string; reason?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useVerifyUser' {
  export const useVerifyUser: () => {
    mutate: (data: string | { userId?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useDeleteUser' {
  export const useDeleteUser: () => {
    mutate: (data: string | { userId?: string; reason?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useUpdatePartner' {
  export const useUpdatePartner: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/admin/useProcessPayout' {
  export const useProcessPayout: () => {
    mutate: (data: string | { partnerId?: string; amount?: number; notes?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// Query Function Signatures  
// ============================================

declare module '../hooks/queries/admin/useUsers' {
  export const useUsers: (filters?: any) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/admin/usePartners' {
  export const usePartners: (filters?: any) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/admin/useWithdrawals' {
  export const useWithdrawals: (filters?: any) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/admin/useAnalytics' {
  export const useAnalytics: (filters?: any) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/user/useUserBonuses' {
  export const useUserBonuses: (userId?: string) => {
    data: any[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/user/useUserGameHistory' {
  export const useUserGameHistory: (userId?: string, filters?: any) => {
    data: any[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/user/useUserReferrals' {
  export const useUserReferrals: (userId?: string) => {
    data: any[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/user/useUserNotifications' {
  export const useUserNotifications: (userId?: string, filters?: any) => {
    data: any[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/partner/usePartnerStatistics' {
  export const usePartnerStatistics: () => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/partner/usePartnerEarnings' {
  export const usePartnerEarnings: (filters?: any) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/partner/usePartnerPlayers' {
  export const usePartnerPlayers: (filters?: any) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/partner/usePartnerCommissions' {
  export const usePartnerCommissions: () => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

declare module '../hooks/queries/user/useReferralStats' {
  export const useReferralStats: () => {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

// ============================================
// Bonus Mutations
// ============================================

declare module '../hooks/mutations/bonus/useUnlockBonus' {
  export const useUnlockBonus: () => {
    mutate: (data: string | { userId?: string; bonusId?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// Notification Mutations
// ============================================

declare module '../hooks/mutations/notification/useMarkNotificationRead' {
  export const useMarkNotificationRead: () => {
    mutate: (data: string | { notificationId?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/notification/useDeleteNotification' {
  export const useDeleteNotification: () => {
    mutate: (data: string | { notificationId?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// User Mutations
// ============================================

declare module '../hooks/mutations/user/useUpdateProfile' {
  export const useUpdateProfile: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/user/useChangePassword' {
  export const useChangePassword: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/user/useUploadVerificationDocument' {
  export const useUploadVerificationDocument: () => {
    mutate: (data: File | { userId?: string; file?: File; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// Payment Mutations
// ============================================

declare module '../hooks/mutations/payment/useCreateDeposit' {
  export const useCreateDeposit: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/payment/useCreateWithdrawal' {
  export const useCreateWithdrawal: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// Support Mutations
// ============================================

declare module '../hooks/mutations/support/useSubmitSupportTicket' {
  export const useSubmitSupportTicket: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// Partner Mutations
// ============================================

declare module '../hooks/mutations/partner/useCreatePayoutRequest' {
  export const useCreatePayoutRequest: () => {
    mutate: (data: number | { amount?: number; upiId?: string; notes?: string; [key: string]: any }) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/partner/useUpdatePartnerProfile' {
  export const useUpdatePartnerProfile: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '../hooks/mutations/partner/useUpdatePartnerPassword' {
  export const useUpdatePartnerPassword: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
}

// ============================================
// Auth Types
// ============================================

declare module '../hooks/mutations/auth/usePartnerLogin' {
  export const usePartnerLogin: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
  
  export interface PartnerLoginData {
    username?: string;
    phone?: string;
    password: string;
  }
}

declare module '../hooks/mutations/auth/usePartnerSignup' {
  export const usePartnerSignup: () => {
    mutate: (data: any) => void;
    mutateAsync: (data: any) => Promise<any>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
  
  export interface PartnerSignupData {
    username?: string;
    name?: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }
}

// ============================================
// Browser APIs
// ============================================

declare global {
  interface Navigator {
    clipboard: {
      writeText(text: string): Promise<void>;
      readText(): Promise<string>;
    };
  }
}

// ============================================
// NodeJS Types (for utils)
// ============================================

declare namespace NodeJS {
  interface Timeout {
    ref(): this;
    unref(): this;
    hasRef(): boolean;
    refresh(): this;
    [Symbol.toPrimitive](): number;
  }
}

export {};