import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Filter,
  Gift,
  TrendingUp,
  AlertCircle,
  Info,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserNotifications } from '@/hooks/queries/notification/useUserNotifications';
import { useMarkNotificationRead } from '@/hooks/mutations/notification/useMarkNotificationRead';
import { useDeleteNotification } from '@/hooks/mutations/notification/useDeleteNotification';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

type NotificationFilter = 'all' | 'unread' | 'game' | 'payment' | 'bonus' | 'system';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const { data: notifications, isLoading } = useUserNotifications(user?.id || '', {
    filter: filter === 'all' ? undefined : filter,
  });

  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markRead.mutateAsync({ notificationId });
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    if (!notifications || notifications.length === 0) return;

    try {
      // Mark all unread notifications as read
      const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n.id);
      await Promise.all(unreadIds.map((id: string) => markRead.mutateAsync({ notificationId: id })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification.mutateAsync({ notificationId });
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <TrendingUp className="w-5 h-5 text-[#00F5FF]" />;
      case 'payment':
        return <AlertCircle className="w-5 h-5 text-[#FFD700]" />;
      case 'bonus':
        return <Gift className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      game: <Badge variant="neon">Game</Badge>,
      payment: <Badge variant="gold">Payment</Badge>,
      bonus: <Badge variant="success">Bonus</Badge>,
      system: <Badge variant="secondary">System</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>{type}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading notifications...</div>
      </div>
    );
  }

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/game')}
                className="text-white hover:text-[#FFD700]"
              >
                ← Back
              </Button>
              <Bell className="w-8 h-8 text-[#FFD700]" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-400">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="gold"
                onClick={handleMarkAllRead}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-[#FFD700]" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="game">Game Updates</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="bonus">Bonuses</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Notifications List */}
        {!notifications || notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-12">
              <div className="text-center">
                <BellOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No notifications</p>
                <p className="text-gray-500 text-sm">
                  {filter !== 'all'
                    ? 'Try adjusting your filter'
                    : "You're all caught up!"}
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: any, index: number) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`bg-[#1a1f3a] border-[#FFD700]/30 p-4 transition-all hover:border-[#FFD700] ${
                    !notification.read ? 'bg-[#1a1f3a]/80 border-[#FFD700]/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      notification.read ? 'bg-[#2a2f4a]' : 'bg-[#FFD700]/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(notification.type)}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" />
                            )}
                          </div>
                          <h3 className={`font-semibold ${
                            notification.read ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${
                        notification.read ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(notification.id)}
                            className="h-auto py-1 px-3 text-[#00F5FF] hover:text-[#00F5FF] hover:bg-[#00F5FF]/10"
                          >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-auto py-1 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {notifications && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-[#FFD700]" />
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">{notifications.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-[#FFD700]" />
                <div>
                  <p className="text-sm text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-white">{unreadCount}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-4">
              <div className="flex items-center gap-3">
                <CheckCheck className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Read</p>
                  <p className="text-2xl font-bold text-white">
                    {notifications.length - unreadCount}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}