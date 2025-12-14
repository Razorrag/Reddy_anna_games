# 🔴 CRITICAL: WebSocket Event Duplication Analysis

## Executive Summary

**STATUS:** 🔴 CRITICAL ARCHITECTURAL FLAW DETECTED

After deep code analysis as requested, I discovered a **systemic event duplication problem** that will cause the new system to malfunction. Events are being emitted **2-3 times** from multiple layers, causing:

- Frontend receives duplicate events
- Balance updates applied multiple times
- UI state corruption
- Potential race conditions
- Memory leaks from duplicate event processing

## 🔍 Discovery Process

User requested: "deeply check again" after initial integration fixes were completed.

**Analysis Method:**
1. ✅ Verified [`backend/src/index.ts`](backend/src/index.ts:111-115) - Socket.io injection correct
2. ✅ Verified [`backend/src/websocket/game-flow.ts`](backend/src/websocket/game-flow.ts:1-356) - Handlers present
3. ✅ Verified [`backend/src/services/bet.service.ts`](backend/src/services/bet.service.ts:98-128) - Service emits events
4. ✅ Verified [`backend/src/services/game.service.ts`](backend/src/services/game.service.ts:108-114) - Service emits events
5. 🔴 **FOUND:** game-flow.ts handlers ALSO emit same events (lines 88-298)
6. 🔴 **FOUND:** Controllers ALSO emit events after calling services
7. 🔴 **SEARCHED:** All 71 `.emit()` calls across codebase to map complete duplication

## 📊 Complete Emission Layer Analysis

### ✅ Layer 1: Services (CORRECT - Single Source of Truth)

**Files:**
- [`backend/src/services/bet.service.ts`](backend/src/services/bet.service.ts) - 5 emissions
- [`backend/src/services/game.service.ts`](backend/src/services/game.service.ts) - 13 emissions  
- [`backend/src/services/payment.service.ts`](backend/src/services/payment.service.ts) - 12 emissions

**Total:** 30 emissions ✅ **All legitimate** - services emit after DB operations

**Example from bet.service.ts:**
```typescript
// Line 98-128
async placeBet(userId: string, roundId: string, betSide: 'andar' | 'bahar', amount: number) {
  // ... DB operations ...
  
  // ✅ CORRECT: Emit after successful DB update
  if (this.io) {
    this.io.to(`user:${userId}`).emit('bet:placed', { bet, message: 'Bet placed successfully' });
    this.io.to(`game:${gameId}`).emit('round:stats_updated', { roundId, totalAndarBets, totalBaharBets });
    this.io.to(`user:${userId}`).emit('user:balance_updated', { userId, mainBalance, bonusBalance });
  }
  
  return bet;
}
```

### ❌ Layer 2: Controllers (DUPLICATE)

**File:** [`backend/src/controllers/bet.controller.ts`](backend/src/controllers/bet.controller.ts)

**Problem:** 4 duplicate emissions at lines 33, 40, 93, 96

**Example:**
```typescript
// Lines 10-51
async placeBet(req: AuthRequest, res: Response, next: NextFunction) {
  const bet = await betService.placeBet(userId, roundId, betSide, amount);
  //                    ↑ Service already emitted events!
  
  // ❌ DUPLICATE: Emitting again after service call
  const io = req.app.get('io') as SocketIOServer;
  if (io) {
    io.to(`game:${round.gameId}`).emit('bet:placed', { bet, userId });  // Line 33 - DUPLICATE
    io.to(`user:${userId}`).emit('user:balance_updated', balance);      // Line 40 - DUPLICATE
  }
  
  res.status(201).json({ message: 'Bet placed successfully', bet });
}
```

**Result:** `bet:placed` and `user:balance_updated` emitted **TWICE**

### ❌ Layer 3: WebSocket Handlers (DUPLICATE)

**File:** [`backend/src/websocket/game-flow.ts`](backend/src/websocket/game-flow.ts)

**Problem:** 23 duplicate emissions throughout the file

**Critical Examples:**

#### Player Bet Handler (Lines 88-124)
```typescript
socket.on('bet:place', async (data) => {
  const bet = await betService.placeBet(socket.userId, roundId, betSide, amount);
  //                    ↑ Service already emitted 3 events!
  
  // ❌ DUPLICATE #1: Line 100
  socket.emit('bet:placed', { bet, message: 'Bet placed successfully' });
  
  // ❌ DUPLICATE #2: Lines 107-112  
  io.to(`game:${round.gameId}`).emit('round:stats_updated', {
    roundId, totalAndarBets, totalBaharBets
  });
  
  // ❌ DUPLICATE #3: Line 117
  socket.emit('user:balance_updated', balance);
});
```

#### Admin Round Creation (Lines 172-192)
```typescript
socket.on('admin:create_round', async (gameId: string) => {
  const round = await gameService.createNewRound(gameId);
  //                    ↑ Service already emitted 'game:round_created'!
  
  // ❌ DUPLICATE: Line 182
  io.to(`game:${gameId}`).emit('game:round_created', { round, message: 'New round created' });
});
```

#### Admin Round Start (Lines 194-214)
```typescript
socket.on('admin:start_round', async (roundId: string) => {
  const round = await gameService.startRound(roundId);
  //                    ↑ Service already emitted 'game:round_started' + started timer!
  
  // ❌ DUPLICATE: Lines 204-207
  io.to(`game:${round.gameId}`).emit('game:round_started', {
    round, message: 'Betting is now open!'
  });
});
```

#### Admin Close Betting (Lines 216-236)
```typescript
socket.on('admin:close_betting', async (roundId: string) => {
  const round = await gameService.closeBetting(roundId);
  //                    ↑ Service already emitted 'game:betting_closed'!
  
  // ❌ DUPLICATE: Lines 226-229
  io.to(`game:${round.gameId}`).emit('game:betting_closed', {
    round, message: 'Betting is closed'
  });
});
```

#### Admin Deal Cards (Lines 238-259)
```typescript
socket.on('admin:deal_cards', async (roundId: string) => {
  const round = await gameService.dealCardsAndDetermineWinner(roundId);
  //                    ↑ Service already emitted 'game:winner_determined'!
  
  // ❌ DUPLICATE: Lines 248-252
  io.to(`game:${round.round.gameId}`).emit('game:winner_determined', {
    round, winningSide, message: `Winner: ${winningSide?.toUpperCase()}!`
  });
});
```

#### Admin Process Payouts (Lines 261-298)
```typescript
socket.on('admin:process_payouts', async (roundId: string) => {
  await betService.processRoundPayouts(roundId);
  //          ↑ Service already emitted 'game:payouts_processed' + balance updates!
  
  // ❌ DUPLICATE: Lines 276-279
  io.to(`game:${gameId}`).emit('game:payouts_processed', {
    roundId, message: 'Payouts have been processed'
  });
  
  // ❌ DUPLICATE: Lines 282-285 (for each winner)
  for (const bet of roundBets) {
    io.to(`user:${bet.userId}`).emit('user:balance_updated', balance);
  }
});
```

## 🔥 Impact Analysis: The Multiplication Problem

### Scenario 1: User Places Bet via WebSocket

```
Player clicks "Bet ₹100 on Andar" button in UI
    ↓
Frontend: socket.emit('bet:place', { roundId, betSide: 'andar', amount: 100 })
    ↓
Backend: game-flow.ts receives 'bet:place' event (line 88)
    ↓
Handler calls: betService.placeBet(userId, roundId, 'andar', 100)
    ↓
Service Updates Database:
    • Inserts bet record
    • Deducts ₹100 from user balance
    • Updates round statistics
    ↓
Service Emits (bet.service.ts lines 98-128):
    ✅ Emission #1: bet:placed → to user:${userId}
    ✅ Emission #2: round:stats_updated → to game:${gameId}
    ✅ Emission #3: user:balance_updated → to user:${userId}
    ↓
Service returns bet object to handler
    ↓
Handler ALSO Emits (game-flow.ts lines 100-117):
    ❌ Emission #4: bet:placed → to socket (DUPLICATE)
    ❌ Emission #5: round:stats_updated → to game room (DUPLICATE)
    ❌ Emission #6: user:balance_updated → to socket (DUPLICATE)
```

**RESULT:** Frontend receives every event **TWICE**!

**Frontend Impact:**
- `bet:placed` handler runs twice → UI updates twice
- `round:stats_updated` handler runs twice → Statistics doubled
- `user:balance_updated` handler runs twice → Balance display corrupted

### Scenario 2: User Places Bet via HTTP API

```
Player clicks "Bet ₹100 on Andar" button in UI
    ↓
Frontend: POST /api/bets/place { roundId, betSide: 'andar', amount: 100 }
    ↓
Backend: bet.controller.ts receives HTTP request (line 10)
    ↓
Controller calls: betService.placeBet(userId, roundId, 'andar', 100)
    ↓
Service Updates Database (same as above)
    ↓
Service Emits (bet.service.ts lines 98-128):
    ✅ Emission #1: bet:placed → to user:${userId}
    ✅ Emission #2: round:stats_updated → to game:${gameId}
    ✅ Emission #3: user:balance_updated → to user:${userId}
    ↓
Service returns bet object to controller
    ↓
Controller ALSO Emits (bet.controller.ts lines 26-42):
    ❌ Emission #4: bet:placed → to game room (DUPLICATE)
    ❌ Emission #5: user:balance_updated → to user (DUPLICATE)
    ↓
Controller returns HTTP 201 response
```

**RESULT:** Frontend receives every event **TWICE**!

### Scenario 3: Admin Creates Round via HTTP + WebSocket Monitoring

```
Admin clicks "Create New Round" button
    ↓
Frontend: POST /api/games/:gameId/rounds
    ↓
Backend: game.controller.ts receives request (line 35)
    ↓
Controller calls: gameService.createNewRound(gameId)
    ↓
Service Updates Database:
    • Creates new round record
    • Generates joker card
    • Sets initial statistics
    ↓
Service Emits (game.service.ts lines 109-114):
    ✅ Emission #1: game:round_created → to game:${gameId}
    ↓
Service returns round object
    ↓
Controller returns HTTP 201 response (no emission) ✅ CORRECT
    ↓
✅ Event emitted only ONCE if using HTTP!
```

**BUT** if admin uses WebSocket instead:

```
Admin clicks "Create New Round" button (using WebSocket)
    ↓
Frontend: socket.emit('admin:create_round', gameId)
    ↓
Backend: game-flow.ts receives 'admin:create_round' (line 173)
    ↓
Handler calls: gameService.createNewRound(gameId)
    ↓
Service Emits (game.service.ts line 110):
    ✅ Emission #1: game:round_created → to game:${gameId}
    ↓
Handler ALSO Emits (game-flow.ts lines 182-185):
    ❌ Emission #2: game:round_created → to game:${gameId} (DUPLICATE)
```

**RESULT:** Event fires **TWICE** if using WebSocket, **ONCE** if using HTTP!

## 📋 Complete Duplication Matrix

| Event Name | Service Location | Controller Location | game-flow Location | Admin Routes | Total Emissions | Status |
|------------|-----------------|---------------------|-------------------|--------------|-----------------|--------|
| `bet:placed` | bet.service:106 | bet.controller:33 | game-flow:100 | — | **3x** | 🔴 CRITICAL |
| `user:balance_updated` | bet.service:123 | bet.controller:40 | game-flow:117 | — | **3x** | 🔴 CRITICAL |
| `round:stats_updated` | bet.service:113 | — | game-flow:108 | — | **2x** | 🔴 CRITICAL |
| `game:round_created` | game.service:110 | — | game-flow:182 | — | **2x** | 🔴 CRITICAL |
| `game:round_started` | game.service:134 | — | game-flow:204 | — | **2x** | 🔴 CRITICAL |
| `game:betting_closed` | game.service:193 | — | game-flow:226 | — | **2x** | 🔴 CRITICAL |
| `game:winner_determined` | game.service:274 | — | game-flow:248 | — | **2x** | 🔴 CRITICAL |
| `game:payouts_processed` | bet.service:204 + game.service:371 | — | game-flow:276 | — | **3x** | 🔴 CRITICAL |
| `user:payout_received` | game.service:379 | — | — | — | **1x** | ✅ CORRECT |
| `bet:cancelled` | — | — | game-flow:135 | — | **1x** | ✅ CORRECT |
| `bet_undo_success` | — | bet.controller:96 | — | — | **1x** | ✅ CORRECT |
| `bet:undone` | game.service:547 | — | — | — | **1x** | ✅ CORRECT |
| `bet:rebet_placed` | game.service:670 | — | — | — | **1x** | ✅ CORRECT |
| `game:joined` | — | — | game-flow:58 | — | **1x** | ✅ CORRECT |
| `game:player_joined` | — | — | game-flow:65 | — | **1x** | ✅ CORRECT |
| `game:player_left` | — | — | game-flow:81 | — | **1x** | ✅ CORRECT |
| `timer:update` | game.service:156 | — | — | — | **1x** | ✅ CORRECT |
| `game:dealing_started` | game.service:217 | — | — | — | **1x** | ✅ CORRECT |
| `game:card_dealt` | game.service:240 | — | — | — | **1x** | ✅ CORRECT |
| `game:round_2_announcement` | game.service:287 | — | — | — | **1x** | ✅ CORRECT |
| `payment:deposit_approved` | payment.service:108 | — | — | — | **1x** | ✅ CORRECT |
| `payment:deposit_rejected` | payment.service:168 | — | — | — | **1x** | ✅ CORRECT |
| `payment:withdrawal_requested` | payment.service:316 | — | — | — | **1x** | ✅ CORRECT |
| `payment:withdrawal_approved` | payment.service:358 | — | — | — | **1x** | ✅ CORRECT |
| `payment:withdrawal_rejected` | payment.service:405 | — | — | — | **1x** | ✅ CORRECT |
| `bonus:received` | payment.service:139 | — | — | — | **1x** | ✅ CORRECT |
| `bonus:referral_earned` | payment.service:245 | — | — | — | **1x** | ✅ CORRECT |
| `stream:paused` | — | — | — | admin.routes:103 | **1x** | ✅ CORRECT |
| `stream:resumed` | — | — | — | admin.routes:125 | **1x** | ✅ CORRECT |
| `stream:loop-mode` | — | — | — | admin.routes:144 | **1x** | ✅ CORRECT |

**Summary:**
- 🔴 **8 events** emit 2-3 times (CRITICAL)
- ✅ **21 events** emit once (CORRECT)

## 🎯 Root Cause Analysis

### Why This Happened:

1. ✅ **Service-first design implemented correctly** - Services emit after DB operations
2. ❌ **Controllers added redundant emissions** - Thought they needed to broadcast too
3. ❌ **WebSocket handlers added redundant emissions** - Independent implementation without checking services
4. ❌ **No single source of truth enforcement** - Multiple layers allowed to emit
5. ❌ **No integration testing** - Duplication not caught before deployment

### Architectural Intent vs Reality:

**INTENDED ARCHITECTURE:**
```
┌─────────────┐
│   CLIENT    │ (Frontend)
└──────┬──────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌─────────────┐            ┌──────────────┐
│ HTTP API    │            │  WebSocket   │
│ Controller  │            │  Handler     │
└──────┬──────┘            └──────┬───────┘
       │                          │
       │ Call service method      │ Call service method
       │ Return HTTP response     │ Return confirmation
       │                          │
       └──────────┬───────────────┘
                  │
                  ▼
          ┌──────────────┐
          │   SERVICE    │
          │  (Business   │
          │    Logic)    │
          └──────┬───────┘
                 │
                 ├──────────────────────┐
                 ▼                      ▼
          ┌──────────┐          ┌──────────────┐
          │ DATABASE │          │ EMIT EVENTS  │
          │  UPDATE  │          │ (Socket.io)  │
          └──────────┘          └──────────────┘
                                        │
                                        ▼
                                 ┌─────────────┐
                                 │ ALL CLIENTS │
                                 │ (via rooms) │
                                 └─────────────┘

✅ Single emission point
✅ Consistent behavior (HTTP or WebSocket)
✅ Easy to test and maintain
```

**ACTUAL ARCHITECTURE (BROKEN):**
```
┌─────────────┐
│   CLIENT    │
└──────┬──────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌─────────────┐            ┌──────────────┐
│ Controller  │            │ game-flow.ts │
└──────┬──────┘            └──────┬───────┘
       │                          │
       ├──────────┬───────────────┤
       │          │               │
       ▼          ▼               ▼
  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │ SERVICE │  │ SERVICE │  │ SERVICE │
  │  EMIT   │  │  EMIT   │  │  EMIT   │
  └────┬────┘  └────┬────┘  └────┬────┘
       │           │              │
       ▼           ▼              ▼
   Emission    Emission       Emission
      #1          #2             #3
       │           │              │
       └───────────┴──────────────┘
                   │
                   ▼
            ┌─────────────┐
            │   CLIENTS   │
            │ (3x events) │
            └─────────────┘

❌ Multiple emission points
❌ Inconsistent behavior (HTTP ≠ WebSocket)
❌ Hard to debug and maintain
❌ Race conditions possible
```

## 💡 Why Services Should Be Single Source

### Benefits of Service-Only Emissions:

1. **Single Responsibility Principle**
   - Services handle business logic + real-time notifications
   - Controllers handle HTTP request/response
   - WebSocket handlers handle connection management

2. **Consistency**
   - Same events emitted whether called via HTTP or WebSocket
   - Predictable behavior across all entry points

3. **Testability**
   - Test service once, all entry points covered
   - Easy to mock Socket.io for unit tests

4. **Maintainability**
   - One place to update event names/payloads
   - Easy to trace event flow

5. **Performance**
   - Events emitted once, not 2-3 times
   - Reduced network traffic
   - Lower server CPU usage

## 🔧 Required Fixes

### Priority 1: Remove Duplicates from game-flow.ts

**File:** [`backend/src/websocket/game-flow.ts`](backend/src/websocket/game-flow.ts)

**Lines to Remove:**

```typescript
// ❌ REMOVE Lines 99-118 (bet:place handler emissions)
socket.emit('bet:placed', { bet, message: 'Bet placed successfully' });

const round = await gameService.getRoundById(roundId);
if (round) {
  io.to(`game:${round.gameId}`).emit('round:stats_updated', {
    roundId,
    totalAndarBets: round.totalAndarBets,
    totalBaharBets: round.totalBaharBets,
  });
}

const balance = await userService.getBalance(socket.userId);
socket.emit('user:balance_updated', balance);

// ❌ REMOVE Lines 181-185 (admin:create_round handler emission)
io.to(`game:${gameId}`).emit('game:round_created', {
  round,
  message: 'New round created',
});

// ❌ REMOVE Lines 203-207 (admin:start_round handler emission)
io.to(`game:${round.gameId}`).emit('game:round_started', {
  round,
  message: 'Betting is now open!',
});

// ❌ REMOVE Lines 225-229 (admin:close_betting handler emission)
io.to(`game:${round.gameId}`).emit('game:betting_closed', {
  round,
  message: 'Betting is closed',
});

// ❌ REMOVE Lines 247-252 (admin:deal_cards handler emission)
io.to(`game:${round.round.gameId}`).emit('game:winner_determined', {
  round,
  winningSide: round.winningSide,
  message: `Winner: ${round.winningSide?.toUpperCase()}!`,
});

// ❌ REMOVE Lines 275-285 (admin:process_payouts handler emissions)
io.to(`game:${gameId}`).emit('game:payouts_processed', {
  roundId,
  message: 'Payouts have been processed',
});

for (const bet of roundBets) {
  const balance = await userService.getBalance(bet.userId);
  io.to(`user:${bet.userId}`).emit('user:balance_updated', balance);
}
```

**Keep:** Only error emissions and user-specific confirmations that don't duplicate service events

### Priority 2: Remove Duplicates from bet.controller.ts

**File:** [`backend/src/controllers/bet.controller.ts`](backend/src/controllers/bet.controller.ts)

**Lines to Remove:**

```typescript
// ❌ REMOVE Lines 26-42 (placeBet method emissions)
const io = req.app.get('io') as SocketIOServer;
if (io) {
  const round = await gameService.getRoundById(roundId);
  if (round) {
    io.to(`game:${round.gameId}`).emit('bet:placed', {
      bet,
      userId,
    });

    const balance = await userService.getBalance(userId);
    io.to(`user:${userId}`).emit('user:balance_updated', balance);
  }
}

// ❌ REMOVE Lines 88-100 (cancelBet method emissions)
const io = req.app.get('io') as SocketIOServer;
if (io) {
  const balance = await userService.getBalance(userId);
  io.to(`user:${userId}`).emit('user:balance_updated', balance);
  
  io.to(`user:${userId}`).emit('bet_undo_success', {
    betId,
    userId,
    refundedAmount: parseFloat(bet.amount),
  });
}
```

**Note:** `bet_undo_success` event is not emitted by service, so it can be kept if needed, but should be moved to service for consistency.

### Priority 3: Verify Stream Control Events

**File:** [`backend/src/routes/admin.routes.ts`](backend/src/routes/admin.routes.ts)

**Lines:** 102-103, 124-125, 143-144

These are stream control events that may not be in services. Need to verify if they should be:
- Moved to a stream service
- Kept in routes (if they're simple toggles)

## ✅ Correct Implementation Pattern

### Services Emit, Handlers Don't

```typescript
// ✅ CORRECT: Service emits
export class BetService {
  async placeBet(...) {
    // DB operations
    await db.insert(bets).values({...});
    
    // Emit events
    if (this.io) {
      this.io.to(`user:${userId}`).emit('bet:placed', { bet });
      this.io.to(`game:${gameId}`).emit('round:stats_updated', { stats });
    }
    
    return bet;
  }
}

// ✅ CORRECT: Controller just calls service
export class BetController {
  async placeBet(req, res, next) {
    const bet = await betService.placeBet(...);
    // NO EMISSION HERE - service already did it
    res.status(201).json({ message: 'Bet placed', bet });
  }
}

// ✅ CORRECT: WebSocket handler just calls service
socket.on('bet:place', async (data) => {
  const bet = await betService.placeBet(...);
  // NO EMISSION HERE - service already did it
  // Only send user-specific confirmation if needed
  socket.emit('bet:confirmed', { betId: bet.id });
});
```

## 📝 Testing After Fixes

### Test Scenarios:

**1. Place Bet via WebSocket**
```javascript
socket.emit('bet:place', { roundId, betSide: 'andar', amount: 100 });

// ✅ Should receive ONCE:
// - bet:placed
// - round:stats_updated
// - user:balance_updated

// ❌ Should NOT receive twice!
```

**2. Place Bet via HTTP**
```javascript
POST /api/bets/place
{ roundId, betSide: 'andar', amount: 100 }

// ✅ Should receive ONCE (same as WebSocket):
// - bet:placed
// - round:stats_updated
// - user:balance_updated
```

**3. Admin Creates Round via WebSocket**
```javascript
socket.emit('admin:create_round', gameId);

// ✅ Should receive ONCE:
// - game:round_created
```

**4. Admin Creates Round via HTTP**
```javascript
POST /api/games/:gameId/rounds

// ✅ Should receive ONCE:
// - game:round_created
```

**5. Admin Deals Cards**
```javascript
socket.emit('admin:deal_cards', roundId);

// ✅ Should receive (each ONCE):
// - game:dealing_started
// - game:card_dealt (multiple times, one per card)
// - game:winner_determined
// - game:payouts_processed
// - user:balance_updated (for winners)
```

## 📊 Comparison with Legacy System

### Legacy System (andar_bahar/)

The legacy system had similar architecture but used **custom WebSocket implementation** with Supabase Realtime. Events were emitted from:

1. **Server handlers** directly after DB operations
2. **Supabase real-time subscriptions** for database changes

This caused different problems:
- Events arrived in wrong order
- Race conditions between handler emissions and DB subscriptions
- Inconsistent state updates

### New System (Improvement)

The new system's **service-first architecture is correct**, but the implementation had:
- ✅ Better separation of concerns (services, controllers, handlers)
- ✅ Socket.io for more reliable WebSocket
- ✅ Room-based broadcasting
- ❌ Duplicate emissions (fixable)

**After fixes, new system will be significantly better than legacy.**

## 🎯 Summary

**Current State:**
- 🔴 8 critical events emit 2-3 times
- 🔴 Will cause UI bugs, race conditions, performance issues
- 🔴 Inconsistent behavior between HTTP and WebSocket paths

**Required Action:**
1. Remove all emissions from `game-flow.ts` handlers (except error/confirmation messages)
2. Remove all emissions from `bet.controller.ts`
3. Keep only service emissions
4. Test thoroughly

**Expected Result After Fixes:**
- ✅ All events emit exactly once
- ✅ Consistent behavior (HTTP = WebSocket)
- ✅ Clean, maintainable architecture
- ✅ Better than legacy system

## 🔗 Related Files

### Services (Keep Emissions):
- [`backend/src/services/bet.service.ts`](backend/src/services/bet.service.ts)
- [`backend/src/services/game.service.ts`](backend/src/services/game.service.ts)
- [`backend/src/services/payment.service.ts`](backend/src/services/payment.service.ts)

### Controllers (Remove Emissions):
- [`backend/src/controllers/bet.controller.ts`](backend/src/controllers/bet.controller.ts)

### WebSocket Handlers (Remove Emissions):
- [`backend/src/websocket/game-flow.ts`](backend/src/websocket/game-flow.ts)

### Other:
- [`backend/src/routes/admin.routes.ts`](backend/src/routes/admin.routes.ts) - Review stream events
- [`backend/src/websocket/index.ts`](backend/src/websocket/index.ts) - Appears unused, consider deleting

---

**Analysis completed:** 2025-12-06T14:40:00Z
**Analyst:** Kilo Code (Deep Architecture Review)
**Status:** 🔴 CRITICAL FIXES REQUIRED BEFORE DEPLOYMENT