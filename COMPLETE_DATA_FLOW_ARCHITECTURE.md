# 🔄 Complete Data Flow Architecture - Drizzle ORM System

## Executive Summary

This document explains how our system works WITHOUT Supabase triggers. We use **Drizzle ORM** with **PostgreSQL** and handle ALL data operations in **application code** (services layer).

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend (React)                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Game UI   │  │  Admin UI  │  │  Partner Dashboard   │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                     WebSocket + REST API
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                  Backend (Express + Drizzle ORM)              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐│
│  │ Game Service│  │  Bet Service│  │  Partner Service     ││
│  └─────────────┘  └─────────────┘  └──────────────────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐│
│  │ User Service│  │ Auth Service│  │  Payment Service     ││
│  └─────────────┘  └─────────────┘  └──────────────────────┘│
└───────────────────────────┬──────────────────────────────────┘
                            │
                   Drizzle ORM (no triggers!)
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Tables: users, games, game_rounds, bets, transactions, │ │
│  │  partners, partner_game_earnings, game_history, etc.    │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 How Drizzle ORM Works

### **NO Supabase Triggers** ❌
- No database-level triggers
- No automatic cascade updates
- No edge functions

### **YES Application Logic** ✅
- All business logic in services
- Explicit data operations
- Controlled transaction flow
- Manual cascade handling

---

## 🎮 Complete Game Flow with Data Persistence

### **Phase 1: Round Creation**

#### Service: [`game.service.ts:84-111`](backend/src/services/game.service.ts:84-111)

```typescript
async createNewRound(gameId: string) {
  // 1. Create deck and draw joker
  const deck = this.createDeck();
  const jokerCard = deck[0];
  
  // 2. Insert round into database
  const [newRound] = await db.insert(gameRounds).values({
    gameId,
    roundNumber: newRoundNumber,
    status: 'betting',
    jokerCard: jokerCard.display,
    totalAndarBets: '0.00',
    totalBaharBets: '0.00',
    totalBets: 0,
    bettingEndsAt: new Date(Date.now() + bettingDuration * 1000),
  }).returning();
  
  return newRound;
}
```

**Database Impact**:
- ✅ `game_rounds` table: New row inserted
- ✅ Real-time: WebSocket broadcasts new round to all players

---

### **Phase 2: Betting**

#### Service: [`bet.service.ts:23-128`](backend/src/services/bet.service.ts:23-128)

```typescript
async placeBet(userId, roundId, betSide, amount) {
  // 1. Validate bet
  this.validateBetAmount(amount);
  
  // 2. Check round status
  if (round.status !== 'betting') {
    throw new AppError('Betting is closed', 400);
  }
  
  // 3. Check user balance
  const canBet = await userService.canPlaceBet(userId, amount);
  
  // 4. Deduct balance (atomic operation)
  if (amountFromMain > 0) {
    await userService.updateBalance(userId, amountFromMain, 'subtract');
  }
  if (amountFromBonus > 0) {
    await userService.updateBonusBalance(userId, amountFromBonus, 'subtract');
  }
  
  // 5. Create bet record
  const [bet] = await db.insert(bets).values({
    userId, roundId, gameId, betSide, amount,
    status: 'pending',
  }).returning();
  
  // 6. Update round totals (atomic SQL operation)
  await db.update(gameRounds).set({
    totalAndarBets: sql`${gameRounds.totalAndarBets} + ${amount}`,
    totalBets: sql`${gameRounds.totalBets} + 1`,
  }).where(eq(gameRounds.id, roundId));
  
  // 7. Create transaction record
  await db.insert(transactions).values({
    userId, type: 'bet', amount, status: 'completed',
  });
  
  // 8. Track bonus wagering (if bonus used)
  if (amountFromBonus > 0) {
    await this.trackBonusWagering(userId, amountFromBonus);
  }
  
  return bet;
}
```

**Database Impact**:
- ✅ `users` table: Balance updated (atomic SQL)
- ✅ `bets` table: New bet record
- ✅ `game_rounds` table: Totals updated (atomic SQL)
- ✅ `transactions` table: Transaction logged
- ✅ `user_bonuses` table: Wagering progress updated
- ✅ Real-time: WebSocket broadcasts bet to all players in room

---

### **Phase 3: Round Completion**

#### Service: [`game.service.ts:142-203`](backend/src/services/game.service.ts:142-203)

```typescript
async dealCardsAndDetermineWinner(roundId: string) {
  // 1. Simulate card dealing
  const deck = this.createDeck();
  let winningSide = null;
  
  for (let i = 0; i < filteredDeck.length; i++) {
    const card = filteredDeck[i];
    if (card.rank === jokerRank) {
      winningSide = currentSide;
      break;
    }
    currentSide = currentSide === 'andar' ? 'bahar' : 'andar';
  }
  
  // 2. Update round with result
  const [updatedRound] = await db.update(gameRounds).set({
    status: 'completed',
    winningSide,
    cardsDealt,
    endedAt: new Date(),
  }).where(eq(gameRounds.id, roundId)).returning();
  
  return updatedRound;
}
```

**Database Impact**:
- ✅ `game_rounds` table: Status → 'completed', winner set
- ✅ Real-time: WebSocket broadcasts winner to all players

---

### **Phase 4: Payout Processing**

#### Service: [`bet.service.ts:152-226`](backend/src/services/bet.service.ts:152-226)

```typescript
async processRoundPayouts(roundId: string) {
  const round = await db.query.gameRounds.findFirst({
    where: eq(gameRounds.id, roundId),
  });
  
  const roundBets = await db.query.bets.findMany({
    where: eq(bets.roundId, roundId),
  });
  
  // Process each bet
  for (const bet of roundBets) {
    const payout = this.calculatePayout(
      betAmount, bet.betSide, round.winningSide, round.roundNumber
    );
    
    if (payout > 0) {
      // 1. Update bet status
      await db.update(bets).set({
        status: 'won',
        payout: payout.toFixed(2),
        settledAt: new Date(),
      }).where(eq(bets.id, bet.id));
      
      // 2. Credit winnings (atomic)
      await userService.updateBalance(bet.userId, payout, 'add');
      
      // 3. Create transaction
      await db.insert(transactions).values({
        userId: bet.userId,
        type: 'win',
        amount: payout.toFixed(2),
        status: 'completed',
      });
      
      // 4. Update user statistics
      await this.updateUserStatistics(bet.userId, 'win', betAmount, winnings);
    } else {
      // Lost bet
      await db.update(bets).set({
        status: 'lost',
        payout: '0.00',
        settledAt: new Date(),
      }).where(eq(bets.id, bet.id));
      
      await this.updateUserStatistics(bet.userId, 'loss', betAmount, 0);
    }
  }
  
  // 5. Calculate partner commissions (NEW: Two-tier)
  await this.calculateRoundCommissions(roundId);
}
```

**Database Impact**:
- ✅ `bets` table: All bets marked won/lost with payouts
- ✅ `users` table: Balances updated for winners
- ✅ `transactions` table: Win transactions logged
- ✅ `user_statistics` table: Stats updated
- ✅ `partner_game_earnings` table: Commission records created
- ✅ `partners` table: Total commission updated
- ✅ Real-time: WebSocket broadcasts payouts to each player

---

### **Phase 5: Partner Commission (Two-Tier)**

#### Service: [`bet.service.ts:228-326`](backend/src/services/bet.service.ts:228-326)

```typescript
private async calculateRoundCommissions(roundId: string) {
  const round = await db.query.gameRounds.findFirst({
    where: eq(gameRounds.id, roundId),
    with: { bets: { with: { user: true } } },
  });
  
  // Group bets by partner
  const partnerMap = new Map();
  
  for (const bet of round.bets) {
    if (!bet.user.referredBy) continue;
    
    const partner = await db.query.partners.findFirst({
      where: and(
        eq(partners.userId, bet.user.referredBy),
        eq(partners.status, 'active')
      ),
    });
    
    if (!partner) continue;
    
    if (!partnerMap.has(partner.id)) {
      partnerMap.set(partner.id, {
        partner,
        totalBets: 0,
        totalPayouts: 0,
        playerIds: new Set(),
      });
    }
    
    const data = partnerMap.get(partner.id);
    data.totalBets += parseFloat(bet.amount);
    data.totalPayouts += parseFloat(bet.payoutAmount);
    data.playerIds.add(bet.userId);
  }
  
  // Create commission records
  for (const [partnerId, data] of partnerMap) {
    const realProfit = data.totalBets - data.totalPayouts;
    if (realProfit <= 0) continue; // No commission on losses
    
    const sharePercentage = parseFloat(data.partner.sharePercentage);
    const commissionRate = parseFloat(data.partner.commissionRate);
    
    // Two-tier calculation
    const shownProfit = realProfit * (sharePercentage / 100);
    const earnedAmount = shownProfit * (commissionRate / 100);
    
    // Insert earning record
    await db.insert(partnerGameEarnings).values({
      partnerId, gameId: round.gameId, roundId: round.id,
      realProfit: realProfit.toFixed(2),
      realTotalBets: data.totalBets.toFixed(2),
      realTotalPayouts: data.totalPayouts.toFixed(2),
      shownProfit: shownProfit.toFixed(2),
      shownTotalBets: (data.totalBets * sharePercentage / 100).toFixed(2),
      shownTotalPayouts: (data.totalPayouts * sharePercentage / 100).toFixed(2),
      sharePercentage: sharePercentage.toFixed(2),
      commissionRate: commissionRate.toFixed(2),
      earnedAmount: earnedAmount.toFixed(2),
      playerCount: data.playerIds.size,
      status: 'pending',
    });
    
    // Update partner totals (atomic)
    await db.update(partners).set({
      totalCommission: sql`${partners.totalCommission} + ${earnedAmount}`,
      pendingCommission: sql`${partners.pendingCommission} + ${earnedAmount}`,
    }).where(eq(partners.id, partnerId));
  }
}
```

**Database Impact**:
- ✅ `partner_game_earnings` table: Per-game commission records
- ✅ `partners` table: Total/pending commission updated
- ✅ Real-time: Partner dashboard updates automatically

---

### **Phase 6: Game History & Statistics**

#### Service: [`game.service.ts:241-280`](backend/src/services/game.service.ts:241-280)

```typescript
async saveRoundToHistory(roundId: string) {
  const round = await db.query.gameRounds.findFirst({
    where: eq(gameRounds.id, roundId),
    with: { game: true },
  });
  
  const roundBets = await db.query.bets.findMany({
    where: eq(bets.roundId, roundId),
  });
  
  const totalPlayers = new Set(roundBets.map(bet => bet.userId)).size;
  const totalBetsAmount = roundBets.reduce((sum, bet) => 
    sum + parseFloat(bet.amount), 0);
  const totalPayouts = roundBets
    .filter(bet => bet.status === 'won')
    .reduce((sum, bet) => sum + parseFloat(bet.payout || '0'), 0);
  
  // Save to history
  const [history] = await db.insert(gameHistory).values({
    gameId: round.gameId,
    roundId: round.id,
    roundNumber: round.roundNumber,
    jokerCard: round.jokerCard,
    winningSide: round.winningSide,
    cardsDealt: round.cardsDealt,
    totalBets: roundBets.length,
    totalPlayers,
    totalBetsAmount: totalBetsAmount.toFixed(2),
    totalPayouts: totalPayouts.toFixed(2),
    playedAt: round.endedAt,
  }).returning();
  
  return history;
}
```

#### Service: [`game.service.ts:283-348`](backend/src/services/game.service.ts:283-348)

```typescript
async updateGameStatistics(gameId: string, roundId: string) {
  // Calculate round statistics
  const totalBetsAmount = /* calculated */;
  const totalPayouts = /* calculated */;
  const totalPlayers = /* calculated */;
  
  // Check if statistics exist for current month
  const existingStats = await db.query.gameStatistics.findFirst({
    where: and(
      eq(gameStatistics.gameId, gameId),
      sql`${gameStatistics.periodStart} >= ${monthStart}`
    ),
  });
  
  if (existingStats) {
    // Update existing statistics (atomic)
    await db.update(gameStatistics).set({
      totalRounds: existingStats.totalRounds + 1,
      totalBets: existingStats.totalBets + roundBets.length,
      totalPlayers: existingStats.totalPlayers + totalPlayers,
      totalWagered: (parseFloat(existingStats.totalWagered) + totalBetsAmount).toFixed(2),
      totalPayouts: (parseFloat(existingStats.totalPayouts) + totalPayouts).toFixed(2),
      // Calculate new averages
    }).where(eq(gameStatistics.id, existingStats.id));
  } else {
    // Create new monthly statistics
    await db.insert(gameStatistics).values({
      gameId, periodStart: monthStart, periodEnd: monthEnd,
      totalRounds: 1, totalBets: roundBets.length,
      /* ... */
    });
  }
}
```

**Database Impact**:
- ✅ `game_history` table: Complete round record
- ✅ `game_statistics` table: Monthly aggregates updated
- ✅ Admin dashboard: Real-time stats updated

---

## 🔄 Migration System with Drizzle Kit

### **How It Works**

#### 1. **Schema Definition** ([`backend/src/db/schema.ts`](backend/src/db/schema.ts))
```typescript
export const partnerGameEarnings = pgTable('partner_game_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  // ... all columns defined here
});
```

#### 2. **Generate Migration**
```bash
npm run db:generate
# Drizzle Kit reads schema.ts
# Auto-generates SQL migration in /migrations folder
```

**Output**: `migrations/0001_add_partner_game_earnings.sql`
```sql
CREATE TABLE "partner_game_earnings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "partner_id" uuid NOT NULL REFERENCES "partners"("id"),
  -- ... all columns
);

CREATE INDEX "partner_game_earnings_partner_id_idx" 
ON "partner_game_earnings"("partner_id");
```

#### 3. **Run Migration**
```bash
npm run db:migrate
# Executes: backend/src/db/migrate.ts
# Reads all migrations from /migrations folder
# Applies them in order to PostgreSQL
```

**Execution** ([`backend/src/db/migrate.ts`](backend/src/db/migrate.ts:8-26)):
```typescript
const runMigrations = async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  await migrate(db, { migrationsFolder: './migrations' });
  // Drizzle tracks applied migrations in __drizzle_migrations table
};
```

### **Migration Tracking**

Drizzle creates `__drizzle_migrations` table:
```sql
CREATE TABLE __drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash TEXT NOT NULL,
  created_at BIGINT
);
```

Prevents re-running same migration.

---

## 🚨 Why We DON'T Need Triggers

### **Legacy System (Supabase)**
```sql
-- Supabase had triggers like this:
CREATE TRIGGER update_partner_commission
AFTER INSERT ON bets
FOR EACH ROW
EXECUTE FUNCTION calculate_commission();
```

### **Our System (Drizzle + Services)**
```typescript
// We handle it in application code:
async processRoundPayouts(roundId) {
  // 1. Process all payouts
  for (const bet of roundBets) {
    await this.processBet(bet);
  }
  
  // 2. Then calculate commissions
  await this.calculateRoundCommissions(roundId);
  
  // 3. Then update statistics
  await gameService.updateGameStatistics(gameId, roundId);
  
  // 4. Then save to history
  await gameService.saveRoundToHistory(roundId);
}
```

**Advantages**:
- ✅ Full control over execution order
- ✅ Easy to debug and test
- ✅ Can add logging/monitoring
- ✅ Can wrap in transactions
- ✅ No hidden database magic

---

## 📊 Real-Time Data Flow

### **WebSocket Integration**

#### Game Server ([`backend/src/websocket/game.handler.ts`](backend/src/websocket/game.handler.ts))

```typescript
io.on('connection', (socket) => {
  socket.on('join-game', async ({ gameId, userId }) => {
    // User joins room
    socket.join(`game:${gameId}`);
    
    // Send current state
    const gameState = await gameService.getCurrentRound(gameId);
    socket.emit('game-state', gameState);
  });
  
  socket.on('place-bet', async (data) => {
    try {
      // Process bet
      const bet = await betService.placeBet(
        data.userId, data.roundId, data.betSide, data.amount
      );
      
      // Broadcast to room (all players see it)
      io.to(`game:${gameId}`).emit('bet-placed', {
        betSide: bet.betSide,
        amount: bet.amount,
        // Don't expose user details
      });
      
      // Send personal confirmation
      socket.emit('bet-confirmed', { bet });
      
      // Update personal balance
      const user = await userService.getUserById(data.userId);
      socket.emit('balance-update', {
        balance: user.balance,
        bonusBalance: user.bonusBalance,
      });
    } catch (error) {
      socket.emit('bet-error', { error: error.message });
    }
  });
});

// When round completes (called from game service)
async function broadcastRoundComplete(roundId, winningSide) {
  io.to(`game:${gameId}`).emit('round-result', {
    roundId,
    winningSide,
    timestamp: new Date(),
  });
  
  // Process payouts
  await betService.processRoundPayouts(roundId);
  
  // Broadcast individual payouts
  const winners = await getWinners(roundId);
  for (const winner of winners) {
    io.to(`user:${winner.userId}`).emit('payout', {
      amount: winner.payout,
      newBalance: winner.newBalance,
    });
  }
}
```

---

## 🎯 Complete Data Flow Summary

### **Single Bet Journey**

```
1. Player Clicks "Bet ₹100 on Andar"
   ↓
2. Frontend → WebSocket → Backend
   ↓
3. bet.service.placeBet()
   ├─ Validate bet
   ├─ Check balance (atomic read)
   ├─ Deduct balance (atomic UPDATE users SET balance = balance - 100)
   ├─ Insert bet record (INSERT INTO bets)
   ├─ Update round totals (atomic UPDATE game_rounds)
   ├─ Create transaction (INSERT INTO transactions)
   └─ Track bonus wagering (UPDATE user_bonuses)
   ↓
4. WebSocket broadcasts to room
   ├─ All players see: "New bet placed on Andar"
   └─ Better sees: "Bet confirmed, new balance: ₹900"
   ↓
5. Round completes (dealer reveals winner)
   ↓
6. game.service.dealCardsAndDetermineWinner()
   └─ UPDATE game_rounds SET status='completed', winning_side='andar'
   ↓
7. bet.service.processRoundPayouts()
   ├─ For each bet:
   │  ├─ Calculate payout
   │  ├─ UPDATE bets SET status='won', payout=200
   │  ├─ UPDATE users SET balance = balance + 200 (atomic)
   │  ├─ INSERT INTO transactions (win record)
   │  └─ UPDATE user_statistics (atomic)
   ├─ Calculate partner commissions:
   │  ├─ Group bets by partner
   │  ├─ Calculate real vs shown profit
   │  ├─ INSERT INTO partner_game_earnings
   │  └─ UPDATE partners (totalCommission, pendingCommission)
   └─ Done
   ↓
8. game.service.saveRoundToHistory()
   └─ INSERT INTO game_history (complete round record)
   ↓
9. game.service.updateGameStatistics()
   └─ UPDATE game_statistics (monthly aggregates)
   ↓
10. WebSocket broadcasts results
    ├─ All players: "Round complete, Andar wins!"
    └─ Winners: "You won ₹200! New balance: ₹1,100"
```

---

## 🔒 Atomic Operations (Critical!)

### **All balance updates are atomic**:

```typescript
// WRONG (race condition possible):
const user = await getUser(userId);
const newBalance = parseFloat(user.balance) + amount;
await updateUser(userId, { balance: newBalance });

// CORRECT (atomic SQL operation):
await db.update(users)
  .set({ balance: sql`${users.balance} + ${amount}` })
  .where(eq(users.id, userId));
```

**Why atomic matters**:
- Multiple users betting simultaneously
- Payout processing for multiple winners
- Partner commission calculations
- No race conditions or lost updates

---

## 📋 Migration Checklist

### **To Apply Two-Tier Commission System**:

1. ✅ **Update schema** ([`backend/src/db/schema.ts`](backend/src/db/schema.ts))
   - Added `sharePercentage` to partners table
   - Created `partnerGameEarnings` table

2. ⏳ **Generate migration**:
   ```bash
   cd backend
   npm run db:generate
   # Creates: migrations/0001_two_tier_commission.sql
   ```

3. ⏳ **Review generated SQL**:
   ```bash
   cat migrations/0001_*.sql
   # Verify: ALTER TABLE partners, CREATE TABLE partner_game_earnings
   ```

4. ⏳ **Run migration**:
   ```bash
   npm run db:migrate
   # Applies changes to PostgreSQL
   ```

5. ⏳ **Verify schema**:
   ```sql
   \d partners
   \d partner_game_earnings
   SELECT * FROM __drizzle_migrations;
   ```

6. ✅ **Update services** (Already done!)
   - [`bet.service.ts`](backend/src/services/bet.service.ts) - Two-tier calculation
   - [`partner.service.ts`](backend/src/services/partner.service.ts) - Game history methods

7. ⏳ **Test flow**:
   - Place bets → Complete round → Check partner_game_earnings table
   - Verify real vs shown values
   - Check partner totals updated

---

## 🎯 Key Takeaways

### **No Triggers, All Services**
- ✅ Drizzle ORM = Schema + Migrations + Queries
- ✅ NO database triggers
- ✅ ALL logic in application services
- ✅ Explicit data flow (easy to understand)
- ✅ Full control over execution order

### **Atomic Operations**
- ✅ Use SQL-level operations for balance updates
- ✅ Prevent race conditions
- ✅ Ensure data integrity

### **Real-Time Updates**
- ✅ WebSocket for live game updates
- ✅ Broadcast to rooms (efficient)
- ✅ Personal vs public events

### **Migration Strategy**
- ✅ Schema changes in `schema.ts`
- ✅ Drizzle Kit auto-generates SQL
- ✅ Track with `__drizzle_migrations`
- ✅ No manual SQL needed (but available if wanted)

---

**System Status**: Fully operational with Drizzle ORM ✅  
**No Supabase Dependencies**: Independent PostgreSQL system ✅  
**Migration Ready**: Two-tier commission system prepared ✅