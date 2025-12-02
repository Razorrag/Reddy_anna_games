# 🎬 Phase 20: Complete Streaming Implementation Plan

## 🎯 Goal
Achieve 100% feature parity with legacy VideoArea.tsx (1,310 lines) by implementing OvenMediaEngine streaming with all advanced features.

---

## 📋 IMPLEMENTATION CHECKLIST

### Part 1: OvenMediaEngine Docker Setup ✅
- [ ] Add OvenMediaEngine service to docker-compose.yml
- [ ] Configure RTMP input (port 1935)
- [ ] Configure WebRTC output (port 3333)
- [ ] Configure HLS output (port 8080)
- [ ] Add OME configuration files
- [ ] Test OBS → OME → Frontend pipeline

### Part 2: Enhanced VideoPlayer Component ✅
- [ ] Install HLS.js dependency
- [ ] Copy ultra-low latency HLS config from legacy
- [ ] Implement frozen frame capture on pause
- [ ] Add loop video system (/shared/uhd_30fps.mp4)
- [ ] WebSocket-driven pause/resume sync
- [ ] Circular countdown timer overlay
- [ ] Multi-layer glow effects
- [ ] Stream health monitoring
- [ ] Debug overlay (5-click activation)
- [ ] LIVE badge with viewer count
- [ ] Reconnection handling
- [ ] Browser visibility detection

### Part 3: Backend Stream Control APIs ✅
- [ ] GET /api/stream/config - Get stream configuration
- [ ] POST /api/stream/pause - Pause stream
- [ ] POST /api/stream/resume - Resume stream
- [ ] POST /api/stream/loop-mode - Toggle loop mode
- [ ] PUT /api/stream/loop-message - Update loop message
- [ ] WebSocket events for real-time sync

### Part 4: Advanced Betting APIs ✅
- [ ] POST /api/game/undo-bet - Undo last bet
- [ ] POST /api/game/rebet - Rebet previous round
- [ ] GET /api/game/last-bets - Get last round bets

### Part 5: Testing & Validation ✅
- [ ] Test OBS streaming
- [ ] Test loop mode transition
- [ ] Test pause/resume
- [ ] Test frozen frames
- [ ] Test timer overlay
- [ ] Test WebSocket sync
- [ ] Test mobile responsiveness
- [ ] Load test (1000+ concurrent viewers)

---

## 🚀 EXECUTION PLAN

### Step 1: Docker & OvenMediaEngine (Day 1)
```yaml
# docker-compose.yml additions
services:
  ovenmediaengine:
    image: airensoft/ovenmediaengine:latest
    ports:
      - "1935:1935"   # RTMP input
      - "3333:3333"   # WebRTC
      - "8080:8080"   # HLS
      - "9000:9000"   # API
    volumes:
      - ./ome-config:/opt/ovenmediaengine/conf
    networks:
      - app-network
```

### Step 2: Frontend Implementation (Day 2-3)
1. Install dependencies: `npm install hls.js`
2. Create enhanced VideoPlayer with all legacy features
3. Add circular timer component
4. Implement frozen frame system
5. Add loop video player

### Step 3: Backend APIs (Day 4)
1. Create stream control routes
2. Add undo/rebet endpoints
3. WebSocket event handlers

### Step 4: Testing (Day 5-6)
1. OBS streaming test
2. All features validation
3. Performance testing
4. Mobile testing

### Step 5: Documentation (Day 7)
1. Setup guide
2. API documentation
3. Troubleshooting guide

---

## 📁 FILES TO CREATE/MODIFY

### New Files:
1. `docker-compose.streaming.yml` - OvenMediaEngine service
2. `ome-config/Server.xml` - OME configuration
3. `frontend/src/components/game/EnhancedVideoPlayer.tsx` - Full streaming component
4. `frontend/src/components/game/CircularTimer.tsx` - Timer overlay
5. `frontend/src/hooks/useStreamControl.ts` - Stream control hook
6. `backend/routes/stream.routes.ts` - Stream API routes
7. `backend/services/stream.service.ts` - Stream business logic
8. `backend/routes/betting.routes.ts` - Advanced betting APIs
9. `public/shared/uhd_30fps.mp4` - Loop video (placeholder)

### Modified Files:
1. `docker-compose.yml` - Add OME service
2. `frontend/package.json` - Add hls.js
3. `frontend/src/pages/game/GameRoom.tsx` - Use enhanced player
4. `backend/index.ts` - Register new routes
5. `.env.example` - Add stream URLs

---

## 🎨 LEGACY FEATURES TO IMPLEMENT

### From VideoArea.tsx (1,310 lines):

#### HLS.js Ultra-Low Latency Config (Lines 315-364)
```typescript
const hls = new Hls({
  lowLatencyMode: true,
  liveSyncDurationCount: 1,
  liveMaxLatencyDurationCount: 3,
  maxBufferLength: 2,
  maxMaxBufferLength: 4,
  maxLiveSyncPlaybackRate: 1.05,
  // ... 20+ more optimizations
});
```

#### Loop Video System (Lines 757-822)
```typescript
if (streamConfig?.loopMode) {
  return (
    <video src="/shared/uhd_30fps.mp4" autoPlay loop muted />
    <div className="overlay">
      <p>{loopNextGameDate}</p>
      <p>{loopNextGameTime}</p>
    </div>
  );
}
```

#### Frozen Frame Capture (Lines 527-565)
```typescript
const captureCurrentFrame = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const frame = canvas.toDataURL('image/jpeg', 0.95);
  setFrozenFrame(frame);
};
```

#### Circular Timer Overlay (Lines 1073-1296)
```typescript
// Multi-layer glow effect
<div className="glow-layer-1" />
<div className="glow-layer-2" />
<div className="glow-layer-3" />
<svg>
  <circle /> {/* Progress ring */}
</svg>
<div className="timer-text">{countdown}</div>
```

#### WebSocket Stream Control (Lines 496-524)
```typescript
ws.addEventListener('message', (event) => {
  if (message.type === 'stream_pause_state') {
    setIsPausedState(message.data.isPaused);
  }
});
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS FROM LEGACY

1. **Debounced Fetching** - Min 2s between API calls
2. **React.memo** - Prevent unnecessary re-renders
3. **useMemo** - Cache computed values
4. **useCallback** - Stable function references
5. **Data Attributes** - Instant UI updates
6. **Touch Optimization** - No 300ms delay
7. **Visibility Detection** - Pause when hidden
8. **Stream Recovery** - Auto-reconnect on errors

---

## 🎯 SUCCESS CRITERIA

- [ ] OBS stream appears in frontend
- [ ] Loop video plays when stream inactive
- [ ] Pause shows frozen frame (no black screen)
- [ ] Resume shows fresh live stream
- [ ] Timer overlay perfectly centered with glow
- [ ] WebSocket sync works instantly
- [ ] Mobile responsive on all devices
- [ ] Can handle 1000+ concurrent viewers
- [ ] Sub-1-second latency
- [ ] No memory leaks
- [ ] All legacy features working

---

## 📊 TIMELINE

**Day 1**: Docker + OvenMediaEngine setup  
**Day 2-3**: Enhanced VideoPlayer implementation  
**Day 4**: Backend APIs (stream + betting)  
**Day 5-6**: Testing & validation  
**Day 7**: Documentation & polish  

**Total: 1 Week to 100% Complete**

---

## 🔗 REFERENCE FILES

- Legacy: `andar_bahar/client/src/components/MobileGameLayout/VideoArea.tsx`
- OME Config: `andar_bahar/Server.xml`
- OME Ultra-Low: `andar_bahar/Server-UltraLowLatency.xml`
- Analysis: `COMPLETE_LEGACY_VS_NEW_ANALYSIS.md`

---

**Status**: Ready to implement  
**Priority**: 🔴 CRITICAL  
**Next Step**: Create docker-compose.streaming.yml