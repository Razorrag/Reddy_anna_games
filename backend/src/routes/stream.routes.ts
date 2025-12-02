import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { streamService } from '../services/stream.service';

const router = Router();

// Get stream info
router.get('/info', authenticate, async (req, res, next) => {
  try {
    const info = await streamService.getStreamInfo('app', 'stream');
    res.json(info);
  } catch (error) {
    next(error);
  }
});

// Check if stream is live
router.get('/status', async (req, res, next) => {
  try {
    const isLive = await streamService.isStreamLive('app', 'stream');
    res.json({ isLive });
  } catch (error) {
    next(error);
  }
});

// Get viewer count
router.get('/viewers', authenticate, async (req, res, next) => {
  try {
    const count = await streamService.getViewerCount('app', 'stream');
    res.json({ viewers: count });
  } catch (error) {
    next(error);
  }
});

// Get stream URLs
router.get('/urls', async (req, res, next) => {
  try {
    const urls = streamService.getStreamUrls('app', 'stream');
    res.json(urls);
  } catch (error) {
    next(error);
  }
});

// Test connectivity
router.get('/test', authenticate, async (req, res, next) => {
  try {
    const result = await streamService.testStreamConnectivity();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
