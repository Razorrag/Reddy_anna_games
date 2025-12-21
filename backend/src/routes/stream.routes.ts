import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { streamService } from '../services/stream.service';

const router = Router();

// Get complete stream configuration for frontend
router.get('/config', async (req, res, next) => {
  try {
    const appName = process.env.STREAM_APP_NAME || 'app';
    const streamName = process.env.STREAM_NAME || 'stream';
    
    // Get all available URLs
    const urls = streamService.getAllStreamUrls(appName, streamName);
    
    // Check if stream is live
    const isLive = await streamService.isStreamLive(appName, streamName);
    
    // Get viewer count
    let viewers = 0;
    try {
      viewers = await streamService.getViewerCount(appName, streamName);
    } catch (error) {
      console.log('Could not get viewer count:', error);
    }

    // Determine primary stream URL (prefer WebRTC if available)
    const primaryUrl = isLive ? urls.webrtc.signaling : '';

    res.json({
      success: true,
      data: {
        // Primary stream URL (WebRTC for ultra-low latency)
        streamUrl: primaryUrl,
        
        // Fallback URLs
        fallbackUrls: {
          llhls: urls.llhls,
          hls: urls.hls
        },
        
        // Stream configuration
        streamType: 'video',
        isActive: isLive,
        isPaused: false,
        loopMode: !isLive, // Enable loop mode when stream is offline
        
        // Loop mode display text
        loopNextGameDate: isLive ? '' : 'Next Game',
        loopNextGameTime: isLive ? '' : 'Starting Soon',
        
        // Player settings
        muted: false,
        minViewers: 1000,
        maxViewers: 1500,
        currentViewers: isLive ? viewers : 0
      }
    });
  } catch (error) {
    console.error('Stream config error:', error);
    // Return safe defaults on error
    res.json({
      success: true,
      data: {
        streamUrl: '',
        fallbackUrls: { llhls: '', hls: '' },
        streamType: 'video',
        isActive: false,
        isPaused: false,
        loopMode: true,
        loopNextGameDate: 'Next Game',
        loopNextGameTime: 'Starting Soon',
        muted: false,
        minViewers: 1000,
        maxViewers: 1500,
        currentViewers: 0
      }
    });
  }
});

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
    const urls = streamService.getAllStreamUrls('app', 'stream');
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
