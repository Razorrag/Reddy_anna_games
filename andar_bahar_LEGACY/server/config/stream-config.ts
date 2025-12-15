/**
 * STREAMING CONFIGURATION
 * 
 * Centralized configuration for OvenMediaEngine, OBS Studio, and HLS.js player
 */

export const streamConfig = {
  // OvenMediaEngine Configuration
  ome: {
    // WebRTC for ultra-low latency streaming (<1s)
    webrtcUrl: process.env.WEBRTC_URL || 'ws://localhost:3333/app/stream',
    
    // Low-Latency HLS (LL-HLS) for broader compatibility
    hlsUrl: process.env.HLS_URL || 'http://localhost:8080/app/stream/llhls.m3u8',
    
    // RTMP ingest endpoint (where OBS sends stream)
    rtmpIngest: process.env.RTMP_INGEST || 'rtmp://localhost:1935/app/stream',
    
    // WebRTC signaling server
    signalingUrl: process.env.SIGNALING_URL || 'ws://localhost:3333/app/stream',
    
    // Stream application name
    appName: process.env.STREAM_APP || 'app',
    
    // Stream name
    streamName: process.env.STREAM_NAME || 'stream'
  },

  // OBS Studio Settings (for streamer setup)
  obs: {
    // RTMP Server URL (paste this in OBS > Settings > Stream > Server)
    server: process.env.RTMP_INGEST || 'rtmp://localhost:1935/app',
    
    // Stream Key (paste this in OBS > Settings > Stream > Stream Key)
    streamKey: process.env.STREAM_KEY || 'stream',
    
    // Recommended video settings
    videoSettings: {
      resolution: '1280x720',      // 720p for balance of quality and latency
      fps: 30,                      // 30fps standard
      bitrate: 2500,                // 2.5Mbps for good quality
      keyframeInterval: 2,          // 2 second keyframe for HLS segments
      preset: 'veryfast',           // Fast encoding for low latency
      profile: 'baseline',          // H.264 baseline for compatibility
      tune: 'zerolatency'           // Zero latency tune
    },
    
    // Audio settings
    audioSettings: {
      bitrate: 128,                 // 128kbps audio
      sampleRate: 44100,            // 44.1kHz
      channels: 2                   // Stereo
    }
  },

  // HLS.js Player Configuration (used by VideoArea.tsx)
  player: {
    // Enable low-latency mode
    lowLatencyMode: true,
    
    // Keep only 90 seconds of buffer behind playback position
    backBufferLength: 90,
    
    // Only buffer 2 seconds ahead
    maxBufferLength: 2,
    
    // Maximum buffer size
    maxMaxBufferLength: 10,
    
    // How close to live edge to maintain (0.3s = 300ms behind live)
    liveSyncDuration: 0.3,
    
    // Maximum acceptable latency before seeking closer to live
    liveMaxLatencyDuration: 5,
    
    // Use Web Worker for better performance
    enableWorker: true,
    
    // Number of segments to keep in sync buffer
    liveSyncDurationCount: 1,
    
    // Enable debug logging (disable in production)
    debug: process.env.NODE_ENV === 'development',
    
    // Retry configuration
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 3,
    manifestLoadingRetryDelay: 1000,
    
    // Fragment loading
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 6,
    fragLoadingRetryDelay: 1000,
    
    // Auto level selection
    startLevel: -1, // Auto-select initial quality
    capLevelToPlayerSize: true,
    
    // ABR (Adaptive Bitrate) settings
    abrEwmaDefaultEstimate: 500000, // 500kbps initial estimate
    abrEwmaFastLive: 3.0,
    abrEwmaSlowLive: 9.0
  },

  // Fallback configuration (if OME is not available)
  fallback: {
    enabled: process.env.ENABLE_FALLBACK === 'true',
    videoUrl: process.env.FALLBACK_VIDEO_URL || '/videos/loop.mp4',
    message: 'Live stream temporarily unavailable. Showing recorded content.'
  },

  // Health check endpoints
  healthCheck: {
    omeHealth: process.env.OME_HEALTH_URL || 'http://localhost:8080/health',
    checkInterval: 30000, // Check every 30 seconds
    timeout: 5000 // 5 second timeout
  },

  // Production URLs (override with environment variables)
  production: {
    webrtcUrl: process.env.PROD_WEBRTC_URL || 'wss://stream.yourdomain.com:3333/app/stream',
    hlsUrl: process.env.PROD_HLS_URL || 'https://stream.yourdomain.com:8080/app/stream/llhls.m3u8',
    rtmpIngest: process.env.PROD_RTMP_INGEST || 'rtmp://stream.yourdomain.com:1935/app/stream'
  }
};

/**
 * Get stream URLs based on environment
 */
export function getStreamUrls() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    return {
      webrtc: streamConfig.production.webrtcUrl,
      hls: streamConfig.production.hlsUrl,
      rtmp: streamConfig.production.rtmpIngest
    };
  }
  
  return {
    webrtc: streamConfig.ome.webrtcUrl,
    hls: streamConfig.ome.hlsUrl,
    rtmp: streamConfig.ome.rtmpIngest
  };
}

/**
 * Validate streaming configuration
 */
export function validateStreamConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required URLs
  if (!streamConfig.ome.hlsUrl) {
    errors.push('HLS URL is not configured');
  }
  
  if (!streamConfig.ome.rtmpIngest) {
    errors.push('RTMP ingest URL is not configured');
  }
  
  // Validate URL formats
  try {
    new URL(streamConfig.ome.hlsUrl);
  } catch {
    errors.push('HLS URL is not a valid URL');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get OBS streaming instructions
 */
export function getOBSInstructions() {
  return {
    server: streamConfig.obs.server,
    streamKey: streamConfig.obs.streamKey,
    videoSettings: streamConfig.obs.videoSettings,
    audioSettings: streamConfig.obs.audioSettings,
    instructions: [
      '1. Open OBS Studio',
      '2. Go to Settings > Stream',
      `3. Service: Custom`,
      `4. Server: ${streamConfig.obs.server}`,
      `5. Stream Key: ${streamConfig.obs.streamKey}`,
      '6. Go to Settings > Output',
      '7. Output Mode: Advanced',
      '8. Encoder: x264',
      `9. Bitrate: ${streamConfig.obs.videoSettings.bitrate} Kbps`,
      '10. Keyframe Interval: 2',
      '11. CPU Usage Preset: veryfast',
      '12. Profile: baseline',
      '13. Tune: zerolatency',
      '14. Click Apply, then OK',
      '15. Click "Start Streaming"'
    ]
  };
}

export default streamConfig;