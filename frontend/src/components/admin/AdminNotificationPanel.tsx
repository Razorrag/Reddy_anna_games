import React, { useState, useMemo } from 'react';
import { X, Bell, BellOff, Trash2, Filter } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationSummary } from './NotificationSummary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationCategory } from './types';

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

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.isRead);
    }

    filtered.sort((a, b) => {
      if (a.urgency !== b.urgency) {
        return Number(b.urgency) - Number(a.urgency);
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
      const categoryKey = notification.category as string;
      if (categoryKey in groups) {
        groups[categoryKey as keyof typeof groups].push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const categoryIcons: Record<string, string> = {
    financial: '💰',
    game: '🎮',
    users: '👥',
    partners: '🤝',
    system: '⚙️',
  };

  const categoryLabels: Record<string, string> = {
    financial: 'Financial',
    game: 'Game Events',
    users: 'User Activity',
    partners: 'Partner Management',
    system: 'System Status',
  };

  // When closed, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay - click to close */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Notification Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen w-80 bg-[#0A0E27] border-l-2 border-[#FFD700]/30 z-50 overflow-hidden flex flex-col shadow-2xl ${className}`}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-[#FFD700]/30 bg-gradient-to-br from-violet-900/20 to-[#0A0E27]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#FFD700]" />
              <h2 className="text-lg font-bold text-[#FFD700]">Notifications</h2>
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
        <div className="p-4 border-b border-[#FFD700]/20 bg-black/20">
          <NotificationSummary summary={summary} />
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3 border-b border-[#FFD700]/20 bg-black/10">
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
                onClick={() => setSelectedCategory(key as NotificationCategory)}
                variant={selectedCategory === key ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                {icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <BellOff className="h-12 w-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No notifications</p>
              {showOnlyUnread && (
                <p className="text-gray-500 text-xs mt-2">All caught up!</p>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => {
                if (categoryNotifications.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide font-semibold">
                      <span>{categoryIcons[category]}</span>
                      <span>{categoryLabels[category]}</span>
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
      </div>
    </>
  );
};