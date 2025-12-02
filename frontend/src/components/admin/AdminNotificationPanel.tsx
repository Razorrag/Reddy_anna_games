import React, { useState, useMemo } from 'react';
import { X, Bell, BellOff, Trash2, Filter } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationSummary } from './NotificationSummary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NotificationCategory, NotificationUrgency } from './types';

interface AdminNotificationPanelProps {
  className?: string;
}

export const AdminNotificationPanel: React.FC<AdminNotificationPanelProps> = ({ className = '' }) => {
  useAdminNotifications();
  
  const {
    notifications,
    summary,
    isOpen,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    setIsOpen,
  } = useNotificationStore();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Filter by read status
    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.isRead);
    }

    // Sort by urgency (critical first) and timestamp (newest first)
    filtered.sort((a, b) => {
      if (a.urgency !== b.urgency) {
        return Number(b.urgency) - Number(a.urgency); // Higher urgency first
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered;
  }, [notifications, selectedCategory, showOnlyUnread]);

  // Group notifications by category
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof notifications> = {
      financial: [],
      game: [],
      users: [],
      partners: [],
      system: [],
    };

    filteredNotifications.forEach(notification => {
      // notification.category is already a string like 'financial', 'game', etc.
      const categoryKey = notification.category as string;
      if (categoryKey in groups) {
        groups[categoryKey as keyof typeof groups].push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const categoryIcons = {
    financial: '💰',
    game: '🎮',
    users: '👥',
    partners: '🤝',
    system: '⚙️',
  };

  const categoryLabels = {
    financial: 'Financial',
    game: 'Game Events',
    users: 'User Activity',
    partners: 'Partner Management',
    system: 'System Status',
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-gold hover:bg-gold/80"
        size="icon"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div 
      className={`fixed top-0 right-0 h-screen w-80 bg-dark-navy border-l-2 border-gold/30 z-40 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-gold/30 bg-gradient-to-br from-royal-purple/20 to-dark-navy">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-bold text-gold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            {showOnlyUnread ? <BellOff className="h-3 w-3 mr-1" /> : <Bell className="h-3 w-3 mr-1" />}
            {showOnlyUnread ? 'Show All' : 'Unread'}
          </Button>
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            onClick={clearNotifications}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 border-b border-gold/20 bg-black/20">
        <NotificationSummary summary={summary} />
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 border-b border-gold/20 bg-black/10">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
          >
            All
          </Button>
          {Object.entries(categoryIcons).map(([key, icon]) => (
            <Button
              key={key}
              onClick={() => setSelectedCategory(NotificationCategory[key.toUpperCase() as keyof typeof NotificationCategory])}
              variant={selectedCategory === NotificationCategory[key.toUpperCase() as keyof typeof NotificationCategory] ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BellOff className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">No notifications</p>
            {showOnlyUnread && (
              <p className="text-gray-500 text-xs mt-2">All caught up! 🎉</p>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Group by category */}
            {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => {
              if (categoryNotifications.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryNotifications.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {categoryNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-30"
        onClick={() => setIsOpen(false)}
      />
    </div>
  );
};

// Custom scrollbar styles
const style = document.createElement('style');
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(212, 175, 55, 0.5);
  }
`;
document.head.appendChild(style);