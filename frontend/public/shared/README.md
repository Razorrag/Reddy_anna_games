# Loop Video Asset

## Required File

**Filename**: `uhd_30fps.mp4`

**Specifications**:
- Resolution: 1920x1080 (Full HD) or higher
- Frame Rate: 30 FPS
- Duration: 10-30 seconds
- Format: MP4 (H.264 codec)
- Audio: Optional (can be muted or removed)
- File Size: < 10MB recommended

## Purpose

This video is used as a loop during stream pauses or when the live OBS stream is not active. It provides a seamless viewing experience for users while waiting for the live stream to resume.

## Recommended Content

- Casino/gaming themed animation
- Royal purple and gold color scheme (matching app theme)
- Professional looking graphics
- Text: "Stream will resume shortly" or "Please wait..."
- Smooth loop (first and last frames should match)

## Where to Get

You can:
1. Use the existing loop video from the legacy app (`andar_bahar/client/public/shared/uhd_30fps.mp4`)
2. Create a custom video using After Effects or similar tools
3. Use a stock video from sites like Envato or Pond5
4. Generate using AI video tools

## Installation

Simply place the `uhd_30fps.mp4` file in this directory:
```
frontend/public/shared/uhd_30fps.mp4
```

The VideoPlayer component will automatically load and use it.

## Alternative

If you don't have a loop video yet, you can temporarily use a static image by modifying the VideoPlayer component to show an image instead of video during pauses.