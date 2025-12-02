import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get user notifications
router.get('/', asyncHandler(notificationController.getUserNotifications.bind(notificationController)));

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', asyncHandler(notificationController.markAsRead.bind(notificationController)));

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', asyncHandler(notificationController.markAllAsRead.bind(notificationController)));

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', asyncHandler(notificationController.deleteNotification.bind(notificationController)));

export default router;