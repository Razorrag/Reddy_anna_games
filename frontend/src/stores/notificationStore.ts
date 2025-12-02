import { create } from 'zustand';
import { NotificationItem, NotificationSummary, NotificationStore } from '@/components/admin/types';

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  summary: null,
  isOpen: true, // Open by default on desktop
  unreadCount: 0,

  addNotification: (notification: NotificationItem) => {
    set((state) => {
      // Prevent duplicates
      const exists = state.notifications.some(n => n.id === notification.id);
      if (exists) return state;

      // Add new notification at the beginning
      const newNotifications = [notification, ...state.notifications];
      
      // Keep only last 50 notifications
      const limitedNotifications = newNotifications.slice(0, 50);
      
      // Calculate unread count
      const unreadCount = limitedNotifications.filter(n => !n.isRead).length;

      return {
        notifications: limitedNotifications,
        unreadCount,
      };
    });
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  updateSummary: (summary: NotificationSummary) => {
    set({ summary });
  },

  setIsOpen: (isOpen: boolean) => {
    set({ isOpen });
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));