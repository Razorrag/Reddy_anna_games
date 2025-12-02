# 🔄 Legacy vs New Partner System Analysis

## Executive Summary

**Current Issue**: New system has simplified single-tier commission (2% of wagering), but legacy uses sophisticated two-tier structure (5% effective rate with hidden multiplier).

**Required Action**: Upgrade new system to match legacy's two-tier commission model with game history manipulation.

---

## 📊 Legacy System (Andar Bahar)

### Commission Structure
```typescript
// TWO-TIER SYSTEM
partners.share_percentage: 50.00  // Hidden from partner (50%)
partners.commission_rate: 10.00   // Visible to partner (10%)

// EFFECTIVE CALCULATION
real_profit = 1000 INR (actual house earnings)
shown_profit = real_profit × (share_percentage / 100)
             = 1000 × 0.50 = 500 INR (partner sees this)
earned_amount = shown_profit × (commission_rate / 100)
              = 500 × 0.10 = 50 INR (partner earns this)

// ACTUAL RATE
effective_rate = (50% × 10%) = 5% of real profit
```

### Key Features

#### 1. **Hidden Share Percentage**
- Partner NEVER sees `share_percentage` field
- All financial data in game history multiplied by share percentage
- Partner thinks they're seeing 100% of profit when actually seeing 50%

#### 2. **Game History Manipulation**
**Location**: `andar_bahar/server/routes/partner.ts:236-242`

```typescript
// Apply share percentage to ALL financial values
const shareMultiplier = sharePercentage / 100; // 0.50

const totalBets = parseFloat(game.total_bets) * shareMultiplier;
const totalWinnings = parseFloat(game.total_winnings) * shareMultiplier;
const houseEarnings = parseFloat(game.house_earnings) * shareMultiplier;
const andarTotalBet = parseFloat(game.andar_total_bet) * shareMultiplier;
const baharTotalBet = parseFloat(game.bahar_total_bet) * shareMultiplier;
const profitLoss = parseFloat(game.profit_loss) * shareMultiplier;
const housePayout = parseFloat(game.house_payout) * shareMultiplier;
```

#### 3. **Commission Calculation**
**What Partner Sees**:
- Game shows 500 INR profit (after hidden 50% multiplier)
- Commission rate: 10%
- Earns: 50 INR (10% of shown profit)

**Reality**:
- Actual game profit: 1000 INR
- Partner earns: 50 INR (5% of real profit)
- House keeps: 950 INR (95% of real profit)

#### 4. **Prevents Gaming the System**
- Partner can't discover real profit by checking raw data
- All partner-facing APIs apply share multiplier
- Only admin sees true financial values

---

## 🆕 Current New System (Recreation)

### Schema
**Location**: `backend/src/db/schema.ts:119-132`

```typescript
export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  partnerCode: varchar('partner_code', { length: 20 }).unique().notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 4 })
    .default('0.0200').notNull(), // Only 2%, simplified
  totalPlayers: integer('total_players').default(0).notNull(),
  totalCommission: decimal('total_commission', { precision: 12, scale: 2 })
    .default('0.00').notNull(),
  // MISSING: share_percentage field!
  // ...
});
```

### Commission Calculation
**Location**: `backend/src/services/bet.service.ts:266-310`

```typescript
private async calculatePartnerCommission(
  userId: string,
  betAmount: number,
  gameId: string
) {
  // SIMPLIFIED: Only calculates 2% of bet amount
  const commissionAmount = betAmount * this.PARTNER_COMMISSION_RATE; // 2%
  
  await db.insert(partnerCommissions).values({
    partnerId: partner.id,
    gameId,
    playerId: userId,
    betAmount: betAmount.toFixed(2),
    commissionRate: (this.PARTNER_COMMISSION_RATE * 100).toFixed(2),
    commissionAmount: commissionAmount.toFixed(2),
    status: 'pending',
  });
}
```

### Issues
1. ❌ No `share_percentage` field in schema
2. ❌ Commission on bet amount, not profit
3. ❌ No game history manipulation
4. ❌ Single-tier system (too transparent)
5. ❌ No per-game commission tracking

---

## 🎯 Required Changes

### Phase 1: Database Schema Updates

#### 1.1 Update Partners Table
```typescript
export const partners = pgTable('partners', {
  // ... existing fields ...
  sharePercentage: decimal('share_percentage', { precision: 5, scale: 2 })
    .default('50.00').notNull(), // Hidden multiplier
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 })
    .default('10.00').notNull(), // Visible rate (changed from 0.0200 to 10.00)
  // ...
});
```

#### 1.2 Create Partner Game Earnings Table
```typescript
export const partnerGameEarnings = pgTable('partner_game_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  roundId: uuid('round_id').references(() => gameRounds.id).notNull(),
  
  // Real values (admin only)
  realProfit: decimal('real_profit', { precision: 12, scale: 2 }).notNull(),
  realTotalBets: decimal('real_total_bets', { precision: 12, scale: 2 }).notNull(),
  realTotalPayouts: decimal('real_total_payouts', { precision: 12, scale: 2 }).notNull(),
  
  // Shown values (partner sees these)
  shownProfit: decimal('shown_profit', { precision: 12, scale: 2 }).notNull(),
  shownTotalBets: decimal('shown_total_bets', { precision: 12, scale: 2 }).notNull(),
  shownTotalPayouts: decimal('shown_total_payouts', { precision: 12, scale: 2 }).notNull(),
  
  // Commission calculation
  sharePercentage: decimal('share_percentage', { precision: 5, scale: 2 }).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  earnedAmount: decimal('earned_amount', { precision: 10, scale: 2 }).notNull(),
  
  // Metadata
  playerCount: integer('player_count').default(0).notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index('partner_game_earnings_partner_id_idx').on(table.partnerId),
  roundIdIdx: index('partner_game_earnings_round_id_idx').on(table.roundId),
}));
```

### Phase 2: Update Bet Service

**Location**: `backend/src/services/bet.service.ts`

```typescript
// Change commission calculation to run AFTER round completion
async processRoundPayouts(roundId: string) {
  // ... existing payout logic ...
  
  // Calculate partner commissions based on round profit
  await this.calculateRoundCommissions(roundId);
}

private async calculateRoundCommissions(roundId: string) {
  const round = await db.query.gameRounds.findFirst({
    where: eq(gameRounds.id, roundId),
    with: { bets: { with: { user: true } } }
  });
  
  // Calculate house profit for this round
  const totalBets = parseFloat(round.totalBetAmount);
  const totalPayouts = parseFloat(round.totalPayoutAmount);
  const houseProfit = totalBets - totalPayouts;
  
  if (houseProfit <= 0) return; // No commission on losses
  
  // Get all partners with players in this round
  const partnerMap = new Map();
  
  for (const bet of round.bets) {
    if (!bet.user.referredBy) continue;
    
    const partner = await db.query.partners.findFirst({
      where: and(
        eq(partners.userId, bet.user.referredBy),
        eq(partners.isActive, true)
      )
    });
    
    if (!partner) continue;
    
    if (!partnerMap.has(partner.id)) {
      partnerMap.set(partner.id, {
        partner,
        totalBets: 0,
        totalPayouts: 0,
        playerCount: new Set()
      });
    }
    
    const data = partnerMap.get(partner.id);
    data.totalBets += parseFloat(bet.amount);
    data.totalPayouts += parseFloat(bet.payoutAmount);
    data.playerCount.add(bet.userId);
  }
  
  // Create commission records for each partner
  for (const [partnerId, data] of partnerMap) {
    const realProfit = data.totalBets - data.totalPayouts;
    if (realProfit <= 0) continue;
    
    const sharePercentage = parseFloat(data.partner.sharePercentage);
    const commissionRate = parseFloat(data.partner.commissionRate);
    
    // Calculate shown profit (what partner sees)
    const shownProfit = realProfit * (sharePercentage / 100);
    const earnedAmount = shownProfit * (commissionRate / 100);
    
    await db.insert(partnerGameEarnings).values({
      partnerId,
      gameId: round.gameId,
      roundId: round.id,
      realProfit: realProfit.toFixed(2),
      realTotalBets: data.totalBets.toFixed(2),
      realTotalPayouts: data.totalPayouts.toFixed(2),
      shownProfit: shownProfit.toFixed(2),
      shownTotalBets: (data.totalBets * sharePercentage / 100).toFixed(2),
      shownTotalPayouts: (data.totalPayouts * sharePercentage / 100).toFixed(2),
      sharePercentage: sharePercentage.toFixed(2),
      commissionRate: commissionRate.toFixed(2),
      earnedAmount: earnedAmount.toFixed(2),
      playerCount: data.playerCount.size,
      status: 'pending',
    });
    
    // Update partner totals
    await db.update(partners)
      .set({
        totalCommission: sql`${partners.totalCommission} + ${earnedAmount}`,
        pendingCommission: sql`${partners.pendingCommission} + ${earnedAmount}`,
      })
      .where(eq(partners.id, partnerId));
  }
}
```

### Phase 3: Update Partner Service

**Add game history manipulation**:

```typescript
async getPartnerGameHistory(
  partnerId: string,
  filters?: { startDate?: Date; endDate?: Date }
) {
  const partner = await this.getPartnerById(partnerId);
  const shareMultiplier = parseFloat(partner.sharePercentage) / 100;
  
  let query = db.query.partnerGameEarnings.findMany({
    where: eq(partnerGameEarnings.partnerId, partnerId),
    orderBy: [desc(partnerGameEarnings.createdAt)],
    with: {
      round: {
        columns: {
          roundNumber: true,
          jokerCard: true,
          winningSide: true,
          winningCard: true,
        },
      },
    },
  });
  
  const earnings = await query;
  
  // Return SHOWN values only (hide real values)
  return earnings.map(e => ({
    id: e.id,
    roundId: e.roundId,
    roundNumber: e.round.roundNumber,
    jokerCard: e.round.jokerCard,
    winningSide: e.round.winningSide,
    winningCard: e.round.winningCard,
    totalBets: e.shownTotalBets, // Partner sees reduced amount
    totalPayouts: e.shownTotalPayouts, // Partner sees reduced amount
    profit: e.shownProfit, // Partner sees reduced amount
    commissionRate: e.commissionRate, // Partner sees this (10%)
    earned: e.earnedAmount, // Partner earns this
    playerCount: e.playerCount,
    createdAt: e.createdAt,
    // sharePercentage HIDDEN - partner never knows about this!
  }));
}
```

### Phase 4: Migration Script

```sql
-- Add share_percentage to partners table
ALTER TABLE partners 
ADD COLUMN share_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00;

-- Update commission_rate format (from 0.0200 to 10.00)
UPDATE partners SET commission_rate = commission_rate * 500; -- 0.02 → 10.00

-- Create partner_game_earnings table
CREATE TABLE partner_game_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),
  game_id UUID NOT NULL REFERENCES games(id),
  round_id UUID NOT NULL REFERENCES game_rounds(id),
  real_profit DECIMAL(12,2) NOT NULL,
  real_total_bets DECIMAL(12,2) NOT NULL,
  real_total_payouts DECIMAL(12,2) NOT NULL,
  shown_profit DECIMAL(12,2) NOT NULL,
  shown_total_bets DECIMAL(12,2) NOT NULL,
  shown_total_payouts DECIMAL(12,2) NOT NULL,
  share_percentage DECIMAL(5,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  earned_amount DECIMAL(10,2) NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  status transaction_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX partner_game_earnings_partner_id_idx ON partner_game_earnings(partner_id);
CREATE INDEX partner_game_earnings_round_id_idx ON partner_game_earnings(round_id);
```

---

## 📋 Benefits of Two-Tier System

### 1. **Risk Management**
- House can adjust share_percentage per partner (25%, 50%, 75%)
- High-risk partners get lower share (25% = 2.5% effective rate)
- Trusted partners get higher share (75% = 7.5% effective rate)

### 2. **Partner Motivation**
- Partner sees "10% commission" (sounds good!)
- Actually earns 5% (sustainable for business)
- Partner thinks they're getting fair deal

### 3. **Flexibility**
- Can change share_percentage without renegotiating visible commission_rate
- Partner dashboard always shows same 10% rate
- Admin adjusts backend multiplier silently

### 4. **Security**
- Partner can't reverse-engineer real profit
- All APIs apply share multiplier
- No data leakage of real financial values

---

## 🎯 Implementation Priority

1. **HIGH**: Update database schema (add share_percentage, create partner_game_earnings)
2. **HIGH**: Modify bet.service.ts commission calculation
3. **HIGH**: Update partner.service.ts with game history manipulation
4. **MEDIUM**: Create migration script
5. **MEDIUM**: Update partner dashboard to show manipulated history
6. **LOW**: Add admin controls to adjust share_percentage per partner

---

## 📊 Example Scenarios

### Scenario 1: Standard Partner (50% share, 10% commission)
```
Round completes:
- Total bets: 10,000 INR
- Total payouts: 6,000 INR
- Real profit: 4,000 INR

Partner sees:
- Total bets: 5,000 INR (×0.50)
- Total payouts: 3,000 INR (×0.50)
- Shown profit: 2,000 INR (×0.50)
- Commission (10%): 200 INR

Reality:
- Partner earned: 200 INR (5% of real 4,000 INR profit)
- House kept: 3,800 INR (95% of real profit)
```

### Scenario 2: High-Risk Partner (25% share, 10% commission)
```
Same round:
- Real profit: 4,000 INR

Partner sees:
- Shown profit: 1,000 INR (×0.25)
- Commission (10%): 100 INR

Reality:
- Partner earned: 100 INR (2.5% of real profit)
- House kept: 3,900 INR (97.5% of real profit)
```

### Scenario 3: VIP Partner (75% share, 10% commission)
```
Same round:
- Real profit: 4,000 INR

Partner sees:
- Shown profit: 3,000 INR (×0.75)
- Commission (10%): 300 INR

Reality:
- Partner earned: 300 INR (7.5% of real profit)
- House kept: 3,700 INR (92.5% of real profit)
```

---

## ✅ Validation Checklist

- [ ] Schema has `sharePercentage` field (default: 50.00)
- [ ] Schema has `partnerGameEarnings` table
- [ ] Commission calculated on round profit, not bet amount
- [ ] Game history shows manipulated values to partner
- [ ] Partner APIs hide `sharePercentage` field
- [ ] Admin APIs show real and shown values
- [ ] Migration script updates existing partners
- [ ] Tests cover two-tier calculation
- [ ] Partner dashboard displays shown values only
- [ ] Admin can adjust share percentage per partner

---

**Status**: Ready for implementation
**Estimated Effort**: 4-6 hours
**Risk**: Low (isolated to partner system)