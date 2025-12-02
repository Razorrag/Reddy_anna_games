// Admin Notification Types

export enum NotificationType {
  // Financial
  DEPOSIT_REQUEST = 'deposit_request',
  WITHDRAWAL_REQUEST = 'withdrawal_request',
  LARGE_WITHDRAWAL = 'large_withdrawal',
  
  // Game
  ACTIVE_GAME = 'active_game',
  GAME_COMPLETED = 'game_completed',
  BIG_WIN = 'big_win',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  
  // Users
  NEW_SIGNUP = 'new_signup',
  VERIFICATION_PENDING = 'verification_pending',
  USER_SUSPENDED = 'user_suspended',
  
  // Partners
  PARTNER_SIGNUP = 'partner_signup',
  PARTNER_PAYOUT = 'partner_payout',
  
  // System
  SERVER_STATUS = 'server_status',
  WEBSOCKET_STATUS = 'websocket_status',
  ERROR_RATE = 'error_rate',
}

export enum NotificationUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationCategory {
  FINANCIAL = 'financial',
  GAME = 'game',
  USERS = 'users',
  PARTNERS = 'partners',
  SYSTEM = 'system',
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  count?: number;
  amount?: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'indigo';
  urgency: NotificationUrgency;
  timestamp: Date;
  actionUrl?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationSummary {
  deposits: {
    count: number;
    latest?: {
      amount: number;
      time: string;
      userId?: string;
    };
  };
  withdrawals: {
    count: number;
    latest?: {
      amount: number;
      time: string;
      userId?: string;
    };
  };
  activeGames: number;
  newSignups: number;
  partnerPending: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  websocketConnections: number;
  errorRate: number;
}

export interface NotificationStore {
  notifications: NotificationItem[];
  summary: NotificationSummary | null;
  isOpen: boolean;
  unreadCount: number;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateSummary: (summary: NotificationSummary) => void;
  setIsOpen: (isOpen: boolean) => void;
  clearNotifications: () => void;
}