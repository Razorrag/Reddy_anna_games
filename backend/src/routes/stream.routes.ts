import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { streamService } from '../services/stream.service';

const router = Router();

/**
 * Stream Control Routes
 * Admin-only routes for managing live stream configuration and status
 */

// Get current stream configuration
router.get('/config', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const config = await streamService.getStreamConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
});

// Update stream configuration
router.post('/config', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { streamUrl, streamKey, isActive } = req.body;
    
    const config = await streamService.updateStreamConfig({
      streamUrl,
      streamKey,
      isActive,
    });
    
    res.json({
      message: 'Stream configuration updated',
      config,
    });
  } catch (error) {
    next(error);
  }
});

// Toggle stream pause/resume
router.post('/toggle-pause', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { paused } = req.body;
    
    const result = await streamService.toggleStreamPause(paused);
    
    res.json({
      message: paused ? 'Stream paused' : 'Stream resumed',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

// Get stream health status
router.get('/health', authenticateToken, async (req, res, next) => {
  try {
    const health = await streamService.getStreamHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

// Get stream statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const stats = await streamService.getStreamStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Test stream connection
router.post('/test', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { streamUrl } = req.body;
    
    const result = await streamService.testStreamConnection(streamUrl);
    
    res.json({
      message: 'Stream connection test complete',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;