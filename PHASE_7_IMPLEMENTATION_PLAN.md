# 🎲 PHASE 7: BETTING FEATURES IMPLEMENTATION PLAN

**Status:** 🚧 IN PROGRESS  
**Goal:** Implement undo bet, rebet, and double bet functionality  
**Estimated Time:** 1 day  
**Priority:** HIGH (Core user functionality)

---

## 📋 OVERVIEW

Phase 7 focuses on implementing the three core betting features that enhance user experience:
1. **Undo Bet** - Cancel the last placed bet and refund amount
2. **Rebet** - Quickly place the same bets as the previous round
3. **Double Bet** - Double all current bets with one click

These features are already designed in the UI (ControlsRow component) but need backend implementation and API integration.

---

## 🎯 OBJECTIVES

### 1. Undo Bet Feature
- Allow players to cancel their most recent bet
- Refund the bet amount to their balance
- Update UI to reflect removed bet
- Only available during betting phase
- Cannot undo after betting closes

### 2. Rebet Feature
- Store bets from previous round
- One-click to place all previous bets again
- Validate sufficient balance
- Show confirmation of rebets

### 3. Double Bet Feature
- Double all current round bets
- Validate sufficient balance for doubled amount
- Update bet totals in real-time
- Visual feedback for doubled bets

---

## 🏗️ ARCHITECTURE

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     PLAYER UI                                │
│  • Click "Undo" button                                       │
│  • Click "Rebet" button                                      │
│  • Click "2x" (double) button                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ HTTP Request / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API                                │
│  • POST /api/bets/:betId/undo                                │
│  • POST /api/bets/rebet                                      │
│  • POST /api/bets/double                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ Business Logic
┌─────────────────────────────────────────────────────────────┐
│                   BET SERVICE                                │
│  • undoBet(betId, userId)                                    │
│  • rebetPreviousRound(userId, roundId)                       │
│  • doubleBets(userId, roundId)                               │
│  • Validate betting phase                                    │
│  • Check balance sufficiency                                 │
│  • Update bet records                                        │
│  • Refund/deduct balance                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ WebSocket Broadcast
┌─────────────────────────────────────────────────────────────┐
│                   REAL-TIME UPDATES                          │
│  • bet:undone → Update UI                                    │
│  • bets:placed → Show new bets                               │
│  • balance:updated → Update wallet                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTATION TASKS

### Task 1: Backend - Bet Service Methods

**File:** `backend/src/services/bet.service.ts`

#### 1.1 Undo Bet Method

```typescript
/**
 * Undo a bet - Cancel and refund
 * 
 * Requirements:
 * - Bet must be in current round
 * - Round must be in betting phase
 * - User must own the bet
 * - Bet must be status 'pending' or 'confirmed'
 * 
 * Actions:
 * - Mark bet as 'cancelled'
 * - Refund bet amount to user balance
 * - Update round totals (subtract from Andar/Bahar totals)
 * - Create refund transaction record
 * - Broadcast bet:undone event
 */
async undoBet(betId: string, userId: string): Promise<{
  success: boolean;
  bet: Bet;
  newBalance: number;
  message: string;
}>
```

#### 1.2 Rebet Previous Round Method

```typescript
/**
 * Rebet - Place all bets from previous round
 * 
 * Requirements:
 * - Previous round must exist and be complete
 * - Current round must be in betting phase
 * - User must have sufficient balance
 * - At least one bet in previous round
 * 
 * Actions:
 * - Fetch all user bets from previous round
 * - Calculate total bet amount needed
 * - Validate balance
 * - Place each bet in current round
 * - Deduct total from balance
 * - Broadcast bets:placed event
 */
async rebetPreviousRound(userId: string, currentRoundId: string): Promise<{
  success: boolean;
  bets: Bet[];
  totalAmount: number;
  newBalance: number;
  message: string;
}>
```

#### 1.3 Double Bets Method

```typescript
/**
 * Double Bets - Double all current round bets
 * 
 * Requirements:
 * - Current round must be in betting phase
 * - User must have bets in current round
 * - User must have sufficient balance for additional amount
 * 
 * Actions:
 * - Fetch all user bets in current round
 * - Calculate additional amount needed (current total)
 * - Validate balance
 * - Place duplicate bets (same sides, same amounts)
 * - Deduct additional amount from balance
 * - Update round totals (double on each side)
 * - Broadcast bets:placed event
 */
async doubleBets(userId: string, roundId: string): Promise<{
  success: boolean;
  originalBets: Bet[];
  newBets: Bet[];
  totalAmount: number;
  newBalance: number;
  message: string;
}>
```

---

### Task 2: Backend - API Routes

**File:** `backend/src/routes/game.routes.ts`

#### 2.1 Add New Endpoints

```typescript
// Undo bet
router.post('/bets/:betId/undo', authenticate, asyncHandler(async (req, res) => {
  const { betId } = req.params;
  const userId = req.user.id;
  
  const result = await betService.undoBet(betId, userId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  
  res.json({
    success: true,
    bet: result.bet,
    newBalance: result.newBalance,
    message: result.message
  });
}));

// Rebet previous round
router.post('/rounds/:roundId/rebet', authenticate, asyncHandler(async (req, res) => {
  const { roundId } = req.params;
  const userId = req.user.id;
  
  const result = await betService.rebetPreviousRound(userId, roundId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  
  res.json({
    success: true,
    bets: result.bets,
    totalAmount: result.totalAmount,
    newBalance: result.newBalance,
    message: result.message
  });
}));

// Double bets
router.post('/rounds/:roundId/double', authenticate, asyncHandler(async (req, res) => {
  const { roundId } = req.params;
  const userId = req.user.id;
  
  const result = await betService.doubleBets(userId, roundId);
  
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  
  res.json({
    success: true,
    originalBets: result.originalBets,
    newBets: result.newBets,
    totalAmount: result.totalAmount,
    newBalance: result.newBalance,
    message: result.message
  });
}));
```

---

### Task 3: Frontend - React Query Hooks

#### 3.1 Create useUndoBet Hook

**File:** `frontend/src/hooks/mutations/game/useUndoBet.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';

interface UndoBetResponse {
  success: boolean;
  bet: any;
  newBalance: number;
  message: string;
}

export function useUndoBet() {
  const queryClient = useQueryClient();
  const { updateBalance } = useAuthStore();
  const { removeMyBet } = useGameStore();
  
  return useMutation({
    mutationFn: async (betId: string) => {
      const response = await apiClient.post<UndoBetResponse>(
        `/api/bets/${betId}/undo`
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update user balance
      updateBalance(data.newBalance);
      
      // Remove bet from game store
      removeMyBet(data.bet.id);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['myBets'] });
      
      // Show success message
      toast.success(data.message || 'Bet undone successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to undo bet');
    }
  });
}
```

#### 3.2 Create useRebet Hook

**File:** `frontend/src/hooks/mutations/game/useRebet.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';

interface RebetResponse {
  success: boolean;
  bets: any[];
  totalAmount: number;
  newBalance: number;
  message: string;
}

export function useRebet() {
  const queryClient = useQueryClient();
  const { updateBalance } = useAuthStore();
  const { addMyBets } = useGameStore();
  
  return useMutation({
    mutationFn: async (roundId: string) => {
      const response = await apiClient.post<RebetResponse>(
        `/api/rounds/${roundId}/rebet`
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update user balance
      updateBalance(data.newBalance);
      
      // Add bets to game store
      addMyBets(data.bets);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['myBets'] });
      
      // Show success message
      toast.success(
        `Rebet successful! ${data.bets.length} bets placed for ₹${data.totalAmount.toLocaleString('en-IN')}`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to rebet');
    }
  });
}
```

#### 3.3 Create useDoubleBets Hook

**File:** `frontend/src/hooks/mutations/game/useDoubleBets.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';

interface DoubleBetsResponse {
  success: boolean;
  originalBets: any[];
  newBets: any[];
  totalAmount: number;
  newBalance: number;
  message: string;
}

export function useDoubleBets() {
  const queryClient = useQueryClient();
  const { updateBalance } = useAuthStore();
  const { addMyBets } = useGameStore();
  
  return useMutation({
    mutationFn: async (roundId: string) => {
      const response = await apiClient.post<DoubleBetsResponse>(
        `/api/rounds/${roundId}/double`
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update user balance
      updateBalance(data.newBalance);
      
      // Add new bets to game store
      addMyBets(data.newBets);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['myBets'] });
      
      // Show success message
      toast.success(
        `Bets doubled! Additional ₹${data.totalAmount.toLocaleString('en-IN')} placed`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to double bets');
    }
  });
}
```

---

### Task 4: Frontend - Wire Up Controls

**File:** `frontend/src/components/game/mobile/ControlsRow.tsx`

#### 4.1 Import Hooks and Connect Buttons

```typescript
import { useUndoBet } from '@/hooks/mutations/game/useUndoBet';
import { useRebet } from '@/hooks/mutations/game/useRebet';
import { useDoubleBets } from '@/hooks/mutations/game/useDoubleBets';
import { useGameStore } from '@/store/gameStore';

// Inside component:
const { currentRound, myBets, lastRoundBets } = useGameStore();
const undoBetMutation = useUndoBet();
const rebetMutation = useRebet();
const doubleBetsMutation = useDoubleBets();

// Undo button handler
const handleUndoBet = () => {
  if (myBets.length === 0) {
    toast.warning('No bets to undo');
    return;
  }
  
  // Undo the most recent bet
  const lastBet = myBets[myBets.length - 1];
  undoBetMutation.mutate(lastBet.id);
};

// Rebet button handler
const handleRebet = () => {
  if (!currentRound) {
    toast.warning('No active round');
    return;
  }
  
  if (!lastRoundBets || lastRoundBets.length === 0) {
    toast.warning('No previous bets to rebet');
    return;
  }
  
  rebetMutation.mutate(currentRound.id);
};

// Double button handler (usually in chip selector or separate button)
const handleDoubleBets = () => {
  if (!currentRound) {
    toast.warning('No active round');
    return;
  }
  
  if (myBets.length === 0) {
    toast.warning('No bets to double');
    return;
  }
  
  doubleBetsMutation.mutate(currentRound.id);
};

// Button JSX updates:
<button
  onClick={handleUndoBet}
  disabled={myBets.length === 0 || undoBetMutation.isPending}
  className="..."
>
  {undoBetMutation.isPending ? 'Undoing...' : 'Undo'}
</button>

<button
  onClick={handleRebet}
  disabled={!lastRoundBets || lastRoundBets.length === 0 || rebetMutation.isPending}
  className="..."
>
  {rebetMutation.isPending ? 'Rebetting...' : 'Rebet'}
</button>
```

---

### Task 5: Game Store Updates

**File:** `frontend/src/store/gameStore.ts`

#### 5.1 Add New Actions

```typescript
// Add to GameState interface:
interface GameState {
  // ... existing properties ...
  
  // New actions for betting features
  removeMyBet: (betId: string) => void;
  addMyBets: (bets: Bet[]) => void;
  saveLastRoundBets: () => void; // Already exists
}

// Implement in store:
removeMyBet: (betId) =>
  set((state) => ({
    myBets: state.myBets.filter(bet => bet.id !== betId),
    betting: {
      ...state.betting,
      betHistory: state.betting.betHistory.filter(bet => bet.id !== betId),
    },
  })),

addMyBets: (bets) =>
  set((state) => ({
    myBets: [...state.myBets, ...bets],
    betting: {
      ...state.betting,
      betHistory: [...state.betting.betHistory, ...bets],
    },
  })),
```

---

## ✅ TESTING CHECKLIST

### Unit Tests
- [ ] undoBet validates bet ownership
- [ ] undoBet refunds correct amount
- [ ] rebetPreviousRound validates balance
- [ ] rebetPreviousRound places correct bets
- [ ] doubleBets validates current bets exist
- [ ] doubleBets deducts correct amount

### Integration Tests
- [ ] Undo bet updates UI immediately
- [ ] Undo bet refunds balance correctly
- [ ] Rebet works across round transitions
- [ ] Rebet validates insufficient balance
- [ ] Double bets updates totals correctly
- [ ] All features disabled after betting closes

### UI/UX Tests
- [ ] Undo button disabled when no bets
- [ ] Rebet button disabled when no previous bets
- [ ] Double button disabled when no current bets
- [ ] Loading states show during API calls
- [ ] Success/error toasts appear
- [ ] Balance updates reflect immediately

### Edge Cases
- [ ] Undo during round transition
- [ ] Rebet with insufficient balance
- [ ] Double bets exceeding max bet limit
- [ ] Multiple rapid clicks (debouncing)
- [ ] Network error during operation

---

## 📊 SUCCESS METRICS

### Functionality
- All three features (undo/rebet/double) working correctly
- Balance updates accurately
- UI reflects changes immediately
- Error handling for all edge cases

### Performance
- API response time < 200ms
- UI updates < 50ms after response
- No race conditions in bet updates
- Proper transaction isolation

### User Experience
- Clear visual feedback (loading states)
- Informative success/error messages
- Disabled states prevent invalid actions
- Smooth animations

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend
- [ ] Bet service methods implemented
- [ ] API routes added and tested
- [ ] WebSocket events for real-time updates
- [ ] Database transactions for balance updates
- [ ] Error handling and validation

### Frontend
- [ ] React Query hooks created
- [ ] ControlsRow buttons connected
- [ ] Game store actions added
- [ ] Toast notifications configured
- [ ] Loading/disabled states

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing complete
- [ ] Edge cases verified

### Documentation
- [ ] API endpoints documented
- [ ] Hook usage examples
- [ ] Error codes documented
- [ ] User guide updated

---

**Estimated Time:** 8 hours  
**Priority:** HIGH  
**Complexity:** MEDIUM  
**Dependencies:** Phases 1-6 complete ✅  

**Next Phase:** Phase 8 - Integration Testing