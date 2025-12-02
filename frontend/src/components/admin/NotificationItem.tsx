import React from 'react';
import { useLocation } from 'wouter';
import { NotificationItem as NotificationItemType } from './types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    // Mark as read
    onMarkAsRead(notification.id);

    // Navigate if action URL exists
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  const urgencyColors = {
    critical: 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20',
    high: 'border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20',
    medium: 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20',
    low: 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20',
  };

  const textColors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        urgencyColors[notification.urgency],
        !notification.isRead && 'ring-2 ring-current',
        notification.actionUrl && 'hover:scale-[1.02]'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{notification.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn('font-semibold text-sm', textColors[notification.urgency])}>
              {notification.title}
            </h4>
            {notification.count !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {notification.count}
              </Badge>
            )}
          </div>

          <p className="text-xs text-gray-300 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            {notification.amount && (
              <span className="font-medium text-white">
                {formatAmount(notification.amount)}
              </span>
            )}
            <span>{timeAgo}</span>
          </div>

          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                New
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};