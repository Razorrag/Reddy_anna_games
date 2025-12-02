import { Request, Response } from 'express';
import { db } from '../db';
import { notifications } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export class NotificationController {
  // Get user notifications
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        page = '1',
        limit = '20',
        unreadOnly = 'false',
      } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions = [eq(notifications.userId, userId)];

      if (unreadOnly === 'true') {
        conditions.push(eq(notifications.isRead, false));
      }

      const whereClause = and(...conditions);

      const [result, countResult, unreadCount] = await Promise.all([
        db
          .select()
          .from(notifications)
          .where(whereClause)
          .orderBy(desc(notifications.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(whereClause),
        db
          .select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, userId),
              eq(notifications.isRead, false)
            )
          ),
      ]);

      res.json({
        notifications: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0]?.count || 0,
          totalPages: Math.ceil((countResult[0]?.count || 0) / limitNum),
        },
        unreadCount: unreadCount[0]?.count || 0,
      });
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  // Mark notification as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const [updated] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();

      res.json({ notification: updated });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  }

  // Delete notification
  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if (notification.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await db
        .delete(notifications)
        .where(eq(notifications.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  // Create notification (admin only)
  async createNotification(req: Request, res: Response) {
    try {
      // Check admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { userId, title, message, type, metadata } = req.body;

      if (!userId || !title || !message || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const [notification] = await db
        .insert(notifications)
        .values({
          userId,
          title,
          message,
          type,
          metadata: metadata ? JSON.stringify(metadata) : null,
        })
        .returning();

      res.json({ notification });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  // Broadcast notification to all users (admin only)
  async broadcastNotification(req: Request, res: Response) {
    try {
      // Check admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { title, message, type, metadata, userRole } = req.body;

      if (!title || !message || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get all users matching criteria
      const { users } = await import('../db/schema');
      let query = db.select({ id: users.id }).from(users);

      if (userRole) {
        query = query.where(eq(users.role, userRole));
      }

      const targetUsers = await query;

      // Create notifications for all users
      const notificationValues = targetUsers.map(user => ({
        userId: user.id,
        title,
        message,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }));

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }

      res.json({
        success: true,
        notificationsSent: notificationValues.length,
      });
    } catch (error) {
      console.error('Broadcast notification error:', error);
      res.status(500).json({ error: 'Failed to broadcast notification' });
    }
  }

  // Get notification statistics (admin only)
  async getNotificationStats(req: Request, res: Response) {
    try {
      // Check admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const [stats] = await db
        .select({
          totalNotifications: sql<number>`count(*)`,
          unreadNotifications: sql<number>`count(*) filter (where is_read = false)`,
          readNotifications: sql<number>`count(*) filter (where is_read = true)`,
          notificationsByType: sql<any>`json_object_agg(type, count(*))`,
        })
        .from(notifications);

      res.json({ statistics: stats });
    } catch (error) {
      console.error('Get notification stats error:', error);
      res.status(500).json({ error: 'Failed to fetch notification statistics' });
    }
  }
}

export const notificationController = new NotificationController();