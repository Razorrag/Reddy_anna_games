import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem, NotificationType, NotificationCategory, NotificationUrgency } from '@/components/admin/types';

export const useAdminNotifications = () => {
  const {
    notifications,
    summary,
    isOpen,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    updateSummary,
    setIsOpen,
  } = useNotificationStore();

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Show silent desktop notification
  const showDesktopNotification = useCallback((notification: NotificationItem) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png',
        silent: true, // No sound
        tag: notification.id,
      });
    }
  }, []);

  // Fetch notification summary from backend
  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        updateSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch notification summary:', error);
    }
  }, [updateSummary]);

  // Handle incoming WebSocket notifications
  useEffect(() => {
    const handleAdminNotification = (event: CustomEvent) => {
      const data = event.detail;
      
      // Create notification object
      const notification: NotificationItem = {
        id: data.id || `notif-${Date.now()}`,
        type: data.type as NotificationType,
        category: data.category as NotificationCategory,
        title: data.title,
        message: data.message,
        count: data.count,
        amount: data.amount,
        icon: data.icon || '🔔',
        color: data.color || 'blue',
        urgency: data.urgency as NotificationUrgency,
        timestamp: new Date(data.timestamp || Date.now()),
        actionUrl: data.actionUrl,
        isRead: false,
        metadata: data.metadata,
      };

      // Add to store
      addNotification(notification);

      // Show desktop notification for high priority
      if (notification.urgency === NotificationUrgency.HIGH || 
          notification.urgency === NotificationUrgency.CRITICAL) {
        showDesktopNotification(notification);
      }

      // Fetch updated summary
      fetchSummary();
    };

    window.addEventListener('admin_notification', handleAdminNotification as EventListener);
    
    return () => {
      window.removeEventListener('admin_notification', handleAdminNotification as EventListener);
    };
  }, [addNotification, showDesktopNotification, fetchSummary]);

  // Initial load and periodic refresh
  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission();
    
    // Initial fetch
    fetchSummary();

    // Refresh summary every 30 seconds (fallback)
    const interval = setInterval(fetchSummary, 30000);

    return () => clearInterval(interval);
  }, [fetchSummary, requestNotificationPermission]);

  return {
    notifications,
    summary,
    isOpen,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setIsOpen,
    refreshSummary: fetchSummary,
  };
};