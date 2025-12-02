import axios from 'axios';

interface StreamConfig {
  omeApiUrl: string;
  omeApiKey: string;
  rtmpUrl: string;
  webrtcUrl: string;
  llHlsUrl: string;
}

interface StreamInfo {
  appName: string;
  streamName: string;
  status: 'active' | 'inactive';
  viewers: number;
  bitrate: number;
  createdTime: Date;
}

export class StreamService {
  private config: StreamConfig;

  constructor() {
    this.config = {
      omeApiUrl: process.env.OME_API_URL || 'http://localhost:8081/v1',
      omeApiKey: process.env.OME_API_KEY || '',
      rtmpUrl: process.env.RTMP_URL || 'rtmp://localhost:1935',
      webrtcUrl: process.env.WEBRTC_URL || 'ws://localhost:3333',
      llHlsUrl: process.env.LL_HLS_URL || 'https://localhost:3334',
    };
  }

  // Get stream information
  async getStreamInfo(appName: string, streamName: string): Promise<StreamInfo | null> {
    try {
      const response = await axios.get(
        `${this.config.omeApiUrl}/vhosts/default/apps/${appName}/streams/${streamName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.omeApiKey}`,
          },
        }
      );

      const stream = response.data;
      return {
        appName,
        streamName,
        status: stream.state === 'started' ? 'active' : 'inactive',
        viewers: stream.outputs?.[0]?.tracks?.[0]?.sessions?.length || 0,
        bitrate: stream.inputs?.[0]?.tracks?.[0]?.bitrate || 0,
        createdTime: new Date(stream.createdTime),
      };
    } catch (error) {
      console.error('Get stream info error:', error);
      return null;
    }
  }

  // Check if stream is live
  async isStreamLive(appName: string, streamName: string): Promise<boolean> {
    try {
      const streamInfo = await this.getStreamInfo(appName, streamName);
      return streamInfo?.status === 'active';
    } catch (error) {
      console.error('Check stream live error:', error);
      return false;
    }
  }

  // Get all active streams
  async getActiveStreams(appName: string = 'live'): Promise<StreamInfo[]> {
    try {
      const response = await axios.get(
        `${this.config.omeApiUrl}/vhosts/default/apps/${appName}/streams`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.omeApiKey}`,
          },
        }
      );

      const streams = response.data.streams || [];
      return streams
        .filter((stream: any) => stream.state === 'started')
        .map((stream: any) => ({
          appName,
          streamName: stream.name,
          status: 'active' as const,
          viewers: stream.outputs?.[0]?.tracks?.[0]?.sessions?.length || 0,
          bitrate: stream.inputs?.[0]?.tracks?.[0]?.bitrate || 0,
          createdTime: new Date(stream.createdTime),
        }));
    } catch (error) {
      console.error('Get active streams error:', error);
      return [];
    }
  }

  // Generate stream URLs for a game
  getStreamUrls(gameId: string, appName: string = 'live') {
    const streamName = `game_${gameId}`;
    
    return {
      rtmp: `${this.config.rtmpUrl}/${appName}/${streamName}`,
      webrtc: `${this.config.webrtcUrl}/${appName}/${streamName}`,
      llhls: `${this.config.llHlsUrl}/${appName}/${streamName}/llhls.m3u8`,
      hls: `${this.config.llHlsUrl}/${appName}/${streamName}/playlist.m3u8`,
    };
  }

  // Get viewer count for a stream
  async getViewerCount(appName: string, streamName: string): Promise<number> {
    try {
      const streamInfo = await this.getStreamInfo(appName, streamName);
      return streamInfo?.viewers || 0;
    } catch (error) {
      console.error('Get viewer count error:', error);
      return 0;
    }
  }

  // Record stream (if recording is enabled)
  async startRecording(appName: string, streamName: string): Promise<boolean> {
    try {
      // Implementation depends on OME recording configuration
      console.log(`Starting recording for ${appName}/${streamName}`);
      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      return false;
    }
  }

  // Stop stream recording
  async stopRecording(appName: string, streamName: string): Promise<boolean> {
    try {
      console.log(`Stopping recording for ${appName}/${streamName}`);
      return true;
    } catch (error) {
      console.error('Stop recording error:', error);
      return false;
    }
  }

  // Get stream statistics
  async getStreamStatistics(appName: string, streamName: string) {
    try {
      const response = await axios.get(
        `${this.config.omeApiUrl}/vhosts/default/apps/${appName}/streams/${streamName}/monitoring`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.omeApiKey}`,
          },
        }
      );

      return {
        viewers: response.data.sessions?.length || 0,
        bitrate: response.data.bitrate || 0,
        framerate: response.data.framerate || 0,
        resolution: response.data.resolution || 'unknown',
        uptime: response.data.uptime || 0,
      };
    } catch (error) {
      console.error('Get stream statistics error:', error);
      return null;
    }
  }

  // Validate stream health
  async validateStreamHealth(appName: string, streamName: string): Promise<{
    healthy: boolean;
    issues: string[];
  }> {
    try {
      const streamInfo = await this.getStreamInfo(appName, streamName);
      const issues: string[] = [];

      if (!streamInfo) {
        issues.push('Stream not found');
        return { healthy: false, issues };
      }

      if (streamInfo.status !== 'active') {
        issues.push('Stream is not active');
      }

      if (streamInfo.bitrate < 100000) { // Less than 100 kbps
        issues.push('Low bitrate detected');
      }

      return {
        healthy: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Validate stream health error:', error);
      return {
        healthy: false,
        issues: ['Health check failed'],
      };
    }
  }

  // Push stream notification to viewers (via WebSocket or similar)
  async notifyViewers(appName: string, streamName: string, message: string) {
    try {
      // This would integrate with your WebSocket/Socket.IO implementation
      console.log(`Notifying viewers of ${appName}/${streamName}: ${message}`);
      return true;
    } catch (error) {
      console.error('Notify viewers error:', error);
      return false;
    }
  }

  // Create stream backup URLs (for failover)
  getBackupStreamUrls(gameId: string, appName: string = 'live') {
    const streamName = `game_${gameId}_backup`;
    
    return {
      rtmp: `${this.config.rtmpUrl}/${appName}/${streamName}`,
      webrtc: `${this.config.webrtcUrl}/${appName}/${streamName}`,
      llhls: `${this.config.llHlsUrl}/${appName}/${streamName}/llhls.m3u8`,
    };
  }

  // Test stream connectivity
  async testStreamConnectivity(): Promise<{
    ome: boolean;
    rtmp: boolean;
    webrtc: boolean;
    llhls: boolean;
  }> {
    const results = {
      ome: false,
      rtmp: false,
      webrtc: false,
      llhls: false,
    };

    try {
      // Test OME API
      const omeResponse = await axios.get(`${this.config.omeApiUrl}/vhosts`, {
        headers: {
          'Authorization': `Bearer ${this.config.omeApiKey}`,
        },
        timeout: 5000,
      });
      results.ome = omeResponse.status === 200;
    } catch (error) {
      console.error('OME connectivity test failed:', error);
    }

    // RTMP, WebRTC, and LL-HLS tests would require actual stream connections
    // For now, we'll just mark them as available if OME is available
    results.rtmp = results.ome;
    results.webrtc = results.ome;
    results.llhls = results.ome;

    return results;
  }

  // Get recommended stream settings
  getRecommendedStreamSettings() {
    return {
      video: {
        codec: 'H.264',
        bitrate: '2500-4000 kbps',
        resolution: '1280x720 (720p)',
        framerate: '30 fps',
        keyframeInterval: '2 seconds',
      },
      audio: {
        codec: 'AAC',
        bitrate: '128 kbps',
        sampleRate: '44100 Hz',
        channels: 'Stereo',
      },
      encoding: {
        preset: 'veryfast',
        profile: 'main',
        level: '4.0',
      },
      latency: {
        target: '1-2 seconds (LL-HLS)',
        fallback: '3-5 seconds (HLS)',
      },
    };
  }
}

export const streamService = new StreamService();