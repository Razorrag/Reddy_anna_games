# 📱 Mobile Game Page Optimization Plan

**Goal**: Recreate the exact mobile game experience from legacy app in the new app with royal theme

---

## 📋 Legacy Mobile Layout Analysis

### Structure (from [`andar_bahar/client/src/components/MobileGameLayout/MobileGameLayout.tsx`](andar_bahar/client/src/components/MobileGameLayout/MobileGameLayout.tsx:40-129))

```
┌─────────────────────────────────────┐
│ 1. MobileTopBar (Fixed)             │
│    - Round indicator (R1/R2/R3)    │
│    - Profile, Bonus, Wallet buttons │
│    - Balance display                │
├─────────────────────────────────────┤
│ 2. VideoArea (65-70% height)       │
│    - Live stream with overlays      │
│    - Circular timer countdown       │
│    - LIVE badge, viewer count       │
├─────────────────────────────────────┤
│ 3. BettingStrip (Horizontal)       │
│    - ANDAR | Opening Card | BAHAR   │
│    - Current bets display           │
│    - Touch-optimized buttons        │
├─────────────────────────────────────┤
│ 4. HorizontalChipSelector (Toggle) │
│    - Swipeable chip carousel        │
│    - Only shows when toggled        │
├─────────────────────────────────────┤
│ 5. ControlsRow (4 buttons)         │
│    - History | Undo | Chip | Rebet  │
│    - Chip button prominent (gold)   │
├─────────────────────────────────────┤
│ 6. CardHistory (Collapsible)       │
│    - Recent 6 games (right to left) │
│    - Red circles (Andar) / Blue (Bahar) │
│    - Opening card rank shown        │
├─────────────────────────────────────┤
│ 7. ProgressBar (1px height)        │
│    - Phase indicator at bottom      │
└─────────────────────────────────────┘
```

---

## 🎯 Components to Create/Update

### 1. **MobileTopBar Component** ✅ EXISTS IN LEGACY
**Location**: `frontend/src/components/game/MobileTopBar.tsx`

**Features**:
- Round indicator badge (R1/R2/R3) with color coding:
  - Green for Round 1
  - Blue for Round 2
  - Red for Round 3
- Profile icon button (top-right)
- Bonus chip (shows cumulative total with lock icon if locked)
- Wallet chip (always visible, shows balance)
- Royal theme styling with gold accents

**Props**:
```typescript
interface MobileTopBarProps {
  userBalance: number;
  onWalletClick: () => void;
  gameState: GameState;
}
```

### 2. **BettingStrip Component** ✅ EXISTS IN LEGACY
**Location**: `frontend/src/components/game/BettingStrip.tsx`

**Features**:
- Three-segment layout:
  - **Left**: ANDAR button (red gradient)
    - Shows Round 1 and Round 2 bets
    - Latest dealt card with count
  - **Center**: Opening card display (gold)
    - Card symbol and suit
    - Enhanced glow effect
  - **Right**: BAHAR button (blue gradient)
    - Shows Round 1 and Round 2 bets
    - Latest dealt card with count
- Touch-optimized (prevents 300ms delay)
- Active state with yellow border glow
- Disabled state with opacity

**Props**:
```typescript
interface BettingStripProps {
  selectedPosition: BetSide | null;
  selectedBetAmount: number;
  onPositionSelect: (position: BetSide) => void;
  onPlaceBet: (position: BetSide) => void;
  isPlacingBet: boolean;
}
```

### 3. **HorizontalChipSelector Component** ❌ NEEDS TO BE CREATED
**Location**: `frontend/src/components/game/HorizontalChipSelector.tsx`

**Features**:
- Swipeable horizontal carousel
- 8 chip amounts: 2500, 5000, 10000, 20000, 30000, 40000, 50000, 100000
- Gold gradient chips with shine effect
- Selected chip has enhanced glow
- Shows chip value (e.g., "2.5k", "10k")
- Toggleable (only shows when chip selector button clicked)
- Touch-friendly scrolling

**Props**:
```typescript
interface HorizontalChipSelectorProps {
  betAmounts: number[];
  selectedAmount: number;
  userBalance: number;
  onChipSelect: (amount: number) => void;
  isVisible: boolean;
}
```

### 4. **ControlsRow Component** ✅ EXISTS IN LEGACY
**Location**: `frontend/src/components/game/ControlsRow.tsx`

**Features**:
- 4 buttons in horizontal row:
  1. **History** - Gray, clock icon
  2. **Undo** - Gray, undo arrow icon
  3. **Select Chip** - Gold gradient, prominent, shows selected amount
  4. **Rebet** - Gray, refresh icon
- Touch-optimized with active scale
- Disabled states for Undo and Rebet

**Props**:
```typescript
interface ControlsRowProps {
  selectedBetAmount: number;
  isPlacingBet: boolean;
  onUndoBet: () => void;
  onRebet: () => void;
  onHistoryClick: () => void;
  onShowChipSelector: () => void;
}
```

### 5. **CardHistory Component** ✅ EXISTS IN LEGACY
**Location**: `frontend/src/components/game/CardHistory.tsx`

**Features**:
- Shows recent 6 games
- **Right to left order** (newest on right)
- Circular badges:
  - Red background (maroon #A52A2A) for Andar wins
  - Blue background (navy #01073b) for Bahar wins
  - Yellow text showing card rank (A, K, Q, J, 10, 9, etc.)
- Clickable to open game details in history modal
- Smooth slide-in animation for new games
- Collapsible details section

**Props**:
```typescript
interface CardHistoryProps {
  onHistoryClick?: () => void;
  onGameClick?: (gameId: string) => void;
}
```

### 6. **VideoArea Component** ✅ EXISTS IN LEGACY
**Location**: `frontend/src/components/game/VideoArea.tsx`

**Features** (already implemented):
- HLS stream with ultra-low latency
- Circular countdown timer overlay (center)
- LIVE badge (top-left)
- Viewer count (top-right)
- Frozen frame on pause
- Multi-layer glow effects
- Phase-based timer colors

### 7. **MobileGameLayout Component** ❌ NEEDS MAJOR UPDATE
**Location**: `frontend/src/components/game/MobileGameLayout.tsx`

**Current Issues**:
- Too generic, uses children array
- Not matching legacy structure
- Missing proper component integration

**New Structure**:
```typescript
interface MobileGameLayoutProps {
  // All game state and handlers
}

export function MobileGameLayout(props: MobileGameLayoutProps) {
  return (
    <div className="game-container">
      <div className="max-w-md mx-auto h-screen flex flex-col">
        <MobileTopBar {...} />
        <VideoArea className="flex-1" />
        <BettingStrip {...} />
        {showChipSelector && <HorizontalChipSelector {...} />}
        <ControlsRow {...} />
        <CardHistory {...} />
        <ProgressBar gameState={gameState} className="h-1" />
        <GlobalWinnerCelebration />
      </div>
    </div>
  );
}
```

### 8. **ProgressBar Component** ❌ NEEDS TO BE CREATED
**Location**: `frontend/src/components/game/ProgressBar.tsx`

**Features**:
- 1px height bottom indicator
- Color-coded by phase:
  - Green for betting
  - Yellow for dealing
  - Red for complete
- Smooth transitions

---

## 🎨 Royal Theme Integration

All components must use:
- **Backgrounds**: Deep navy (#0A0E27, #1A1F3A)
- **Primary**: Gold (#FFD700) for text, buttons, accents
- **Interactive**: Neon cyan (#00F5FF) for hover states
- **Gradients**: Royal gradient, gold gradient, neon gradient
- **Shadows**: Gold glow, neon cyan glow effects
- **Animations**: Pulse, shimmer, glow effects

---

## 📐 Mobile Optimizations

### Touch Interactions
```css
/* Prevent 300ms click delay */
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;

/* Active states */
.active:scale-95

/* iOS input zoom prevention */
input { font-size: 16px !important; }
```

### Safe Area Padding
```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Scrolling
```css
/* Disable pull-to-refresh */
body {
  overscroll-behavior-y: contain;
}

/* Custom scrollbar (4px width) */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
```

---

## 🔄 Implementation Steps

### Phase 1: Create Missing Components
1. ✅ **HorizontalChipSelector** - Swipeable chip carousel
2. ✅ **ProgressBar** - Phase indicator
3. ✅ **Update MobileGameLayout** - Proper structure

### Phase 2: Update Existing Components
1. ✅ Verify **MobileTopBar** matches legacy
2. ✅ Verify **BettingStrip** has touch optimization
3. ✅ Verify **ControlsRow** button styling
4. ✅ Verify **CardHistory** right-to-left order

### Phase 3: Game Page Integration
1. ✅ Update **GameRoom.tsx** to use new MobileGameLayout
2. ✅ Add all necessary state handlers
3. ✅ Connect WebSocket events
4. ✅ Add modals (Wallet, History)

### Phase 4: Testing & Polish
1. ✅ Test on mobile devices (iOS Safari, Chrome Android)
2. ✅ Verify touch interactions
3. ✅ Check safe area padding on notched devices
4. ✅ Test all betting flows
5. ✅ Verify animations and transitions

---

## 🚀 Next Steps

1. **Create HorizontalChipSelector component** with swipeable carousel
2. **Create ProgressBar component** with phase colors
3. **Recreate MobileGameLayout** with exact legacy structure
4. **Update GameRoom page** to use new mobile layout
5. **Test on real mobile devices**

---

## ✅ Success Criteria

- [ ] Mobile layout exactly matches legacy app
- [ ] All touch interactions work smoothly
- [ ] Betting flow is instant (<100ms)
- [ ] Royal theme is consistently applied
- [ ] Works on iOS and Android
- [ ] Safe area padding on notched devices
- [ ] No zoom on input focus
- [ ] Smooth animations throughout
