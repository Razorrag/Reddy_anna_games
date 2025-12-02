# 🎯 Two-Tier Partner Commission System - Implementation Complete

## Overview

Successfully upgraded the partner commission system from a simple single-tier model to the legacy's sophisticated two-tier structure.

---

## ✅ Changes Implemented

### 1. Database Schema Updates

#### **File**: `backend/src/db/schema.ts`

**Partners Table - Added Fields**:
```typescript
sharePercentage: decimal('share_percentage', { precision: 5, scale: 2 })
  .default('50.00').notNull()  // Hidden multiplier (25-75%)
  
commissionRate: decimal('commission_rate', { precision: 5, scale: 2 })
  .default('10.00').notNull()  // Changed from 0.0200 to 10.00
```

**New Table - Partner Game Earnings**:
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
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 2. Bet Service Updates

#### **File**: `backend/src/services/bet.service.ts`

**Removed**:
- `PARTNER_COMMISSION_RATE` constant (old 2% model)
- `calculatePartnerCommission()` method (per-bet calculation)

**Added**:
- `calculateRoundCommissions()` method - Two-tier calculation after round completion

**New Logic**:
```typescript
// Group all bets by partner
// Calculate per-partner: totalBets, totalPayouts, realProfit

// Two-tier calculation
const shownProfit = realProfit * (sharePercentage / 100);
const earnedAmount = shownProfit * (commissionRate / 100);

// Store in partner_game_earnings table
// Update partner totals
```

**Key Improvements**:
- Commission calculated on **profit**, not wagering
- Only positive profits earn commission
- Commission calculated **per round** (after all payouts)
- Tracks real vs shown values separately

### 3. Partner Service Updates

#### **File**: `backend/src/services/partner.service.ts`

**Added Import**:
```typescript
import { partnerGameEarnings } from '../db/schema';
```

**New Methods**:

#### `getPartnerGameHistory(partnerId, filters, limit, offset)`
Returns game history with **SHOWN values only** (for partner dashboard):
```typescript
{
  totalBets: shownTotalBets,      // After share_percentage multiplier
  totalPayouts: shownTotalPayouts, // After share_percentage multiplier
  profit: shownProfit,             // After share_percentage multiplier
  commissionRate: 10.00,           // Visible to partner
  earned: earnedAmount,            // What partner actually earns
  // sharePercentage HIDDEN
  // real_* values HIDDEN
}
```

#### `getPartnerGameHistoryAdmin(partnerId, filters, limit, offset)`
Returns game history with **ALL values** (for admin panel):
```typescript
{
  // Real values (what actually happened)
  realTotalBets, realTotalPayouts, realProfit,
  
  // Shown values (what partner sees)
  shownTotalBets, shownTotalPayouts, shownProfit,
  
  // Commission structure (visible to admin only)
  sharePercentage: 50.00,
  commissionRate: 10.00,
  effectiveRate: 5.00,  // = (50 * 10) / 100
  earnedAmount,
}
```

### 4. Database Migration Script

#### **File**: `backend/src/db/migrations/add-two-tier-partner-commission.sql`

**Migration Steps**:
1. Add `share_percentage` column to partners table (default: 50.00)
2. Update `commission_rate` format (0.0200 → 10.00)
3. Create `partner_game_earnings` table with indexes
4. Create helper function `calculate_partner_commission_two_tier()`
5. Add constraints and documentation

**PostgreSQL Function**:
```sql
CREATE OR REPLACE FUNCTION calculate_partner_commission_two_tier(
  p_partner_id UUID,
  p_round_id UUID,
  p_real_profit DECIMAL,
  p_real_bets DECIMAL,
  p_real_payouts DECIMAL,
  p_player_count INTEGER
) RETURNS UUID
```

Automatically calculates and stores commission using two-tier structure.

---

## 📊 How It Works

### Example Calculation

**Scenario**: Partner with 50% share, 10% commission rate

```
Game Round Completes:
├─ Real total bets: ₹10,000
├─ Real total payouts: ₹6,000
└─ Real profit: ₹4,000

Step 1: Apply share_percentage (hidden from partner)
├─ Shown total bets: ₹10,000 × 50% = ₹5,000
├─ Shown total payouts: ₹6,000 × 50% = ₹3,000
└─ Shown profit: ₹4,000 × 50% = ₹2,000

Step 2: Apply commission_rate (visible to partner)
└─ Earned amount: ₹2,000 × 10% = ₹200

Result:
├─ Partner sees in dashboard: ₹2,000 profit, 10% commission = ₹200
├─ Partner actually earns: ₹200 (5% of real ₹4,000 profit)
└─ House keeps: ₹3,800 (95% of real profit)
```

### Partner Tiers

**Admin can adjust share_percentage per partner**:

| Tier | Share % | Commission % | Effective Rate | Partner Sees | Partner Earns |
|------|---------|--------------|----------------|--------------|---------------|
| Low  | 25%     | 10%          | 2.5%           | ₹1,000 profit | ₹100         |
| Standard | 50% | 10%          | 5.0%           | ₹2,000 profit | ₹200         |
| High | 75%     | 10%          | 7.5%           | ₹3,000 profit | ₹300         |

*Based on ₹4,000 real profit example*

---

## 🔒 Security Features

### 1. Information Hiding
- Partner **NEVER** sees `share_percentage` in any API response
- Partner **NEVER** sees `real_*` values (only `shown_*` values)
- All partner endpoints filter out sensitive fields

### 2. Data Integrity
- Real and shown values stored separately
- Snapshots of rates at time of game (prevents retroactive changes)
- Immutable historical records

### 3. Admin Transparency
- Admin sees both real and shown values side-by-side
- Can track effective commission rates
- Can audit partner earnings

---

## 🎯 API Endpoints

### Partner Endpoints (Hide Real Values)

```typescript
GET /api/partner/game-history
// Returns: shown_* values only
{
  games: [{
    totalBets: 5000,      // shown value (×0.50)
    totalPayouts: 3000,   // shown value (×0.50)
    profit: 2000,         // shown value (×0.50)
    commissionRate: 10,   // visible
    earned: 200,          // visible
  }]
}

GET /api/partner/stats
// Returns: aggregated shown values
{
  totalEarnings: 5000,
  pendingCommission: 1200,
  paidCommission: 3800,
  // Based on shown values only
}
```

### Admin Endpoints (Show All Values)

```typescript
GET /api/admin/partners/:id/earnings
// Returns: real + shown values
{
  earnings: [{
    realProfit: 4000,           // actual
    shownProfit: 2000,          // partner sees
    sharePercentage: 50,        // hidden multiplier
    commissionRate: 10,         // visible rate
    earnedAmount: 200,          // actual earning
    effectiveRate: 5,           // calculated
  }]
}

PATCH /api/admin/partners/:id
// Admin can adjust share_percentage
{
  sharePercentage: 75  // Increase to 75% for VIP partner
}
```

---

## 📝 Migration Instructions

### Step 1: Run Database Migration

```bash
# Using PostgreSQL client
psql -U your_user -d your_database -f backend/src/db/migrations/add-two-tier-partner-commission.sql

# Or using Drizzle Kit
npm run db:generate
npm run db:migrate
```

### Step 2: Verify Schema Changes

```sql
-- Check partners table
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'partners' 
AND column_name IN ('share_percentage', 'commission_rate');

-- Check new table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'partner_game_earnings';
```

### Step 3: Update Existing Partners

```sql
-- Set share_percentage for all existing partners
UPDATE partners 
SET share_percentage = 50.00 
WHERE share_percentage IS NULL;

-- Convert old commission_rate format
UPDATE partners 
SET commission_rate = 10.00 
WHERE commission_rate < 1.00;
```

### Step 4: Test Commission Calculation

```typescript
// Place bets and complete a round
// Check partner_game_earnings table

SELECT 
  pg.id,
  pg.real_profit,
  pg.shown_profit,
  pg.earned_amount,
  p.partner_code
FROM partner_game_earnings pg
JOIN partners p ON p.id = pg.partner_id
ORDER BY pg.created_at DESC
LIMIT 10;
```

---

## 🧪 Testing Checklist

- [ ] Migration runs successfully
- [ ] New columns added to partners table
- [ ] partner_game_earnings table created with indexes
- [ ] Old partners updated with default values
- [ ] Commission calculated correctly after round completion
- [ ] Partner sees only shown_* values in API
- [ ] Admin sees both real and shown values
- [ ] share_percentage hidden from partner APIs
- [ ] Earnings update partner totals correctly
- [ ] Multiple partners per round handled correctly

---

## 📈 Performance Considerations

### Indexes Created
```sql
CREATE INDEX partner_game_earnings_partner_id_idx ON partner_game_earnings(partner_id);
CREATE INDEX partner_game_earnings_round_id_idx ON partner_game_earnings(round_id);
CREATE INDEX partner_game_earnings_status_idx ON partner_game_earnings(status);
CREATE INDEX partner_game_earnings_created_at_idx ON partner_game_earnings(created_at DESC);
```

### Query Optimization
- Partner game history: Indexed by partner_id + created_at
- Commission lookups: Indexed by round_id
- Status filtering: Indexed for pending/paid queries

---

## 🔄 Backward Compatibility

### Old Commission Records
- Existing `partner_commissions` table **NOT modified**
- Old records remain for historical reference
- New system uses `partner_game_earnings` table

### Gradual Migration
1. Old system continues to work during transition
2. New commissions go to new table
3. Old commissions can be archived after verification period

---

## 🎉 Benefits of Two-Tier System

### For Business
1. **Flexible Revenue Control**: Adjust share_percentage per partner
2. **Partner Retention**: Partners see attractive 10% rate
3. **Sustainable Economics**: Actually pay 2.5-7.5% based on tier
4. **Risk Management**: Lower share for untested partners

### For Partners
1. **Transparent Rate**: Always see 10% commission rate
2. **Clear Earnings**: See per-game breakdown
3. **Fair Calculation**: Based on profit, not wagering
4. **Predictable Income**: Consistent rate shown

### For Platform
1. **Audit Trail**: Complete history of real vs shown values
2. **Admin Control**: Adjust rates without renegotiation
3. **Scalability**: Support different partner tiers
4. **Security**: Partners can't discover real financials

---

## 📚 Documentation Created

1. **LEGACY_VS_NEW_PARTNER_SYSTEM.md** - Deep analysis of commission structure
2. **COMPLETE_LEGACY_FEATURE_EXTRACTION.md** - Full system documentation
3. **TWO_TIER_COMMISSION_IMPLEMENTATION_SUMMARY.md** - This file

---

## ✅ Implementation Status

| Component | Status | File |
|-----------|--------|------|
| Database Schema | ✅ Complete | `backend/src/db/schema.ts` |
| Migration Script | ✅ Complete | `backend/src/db/migrations/add-two-tier-partner-commission.sql` |
| Bet Service | ✅ Complete | `backend/src/services/bet.service.ts` |
| Partner Service | ✅ Complete | `backend/src/services/partner.service.ts` |
| Partner API Routes | ⏳ Pending | `backend/src/routes/partner.routes.ts` |
| Admin API Routes | ⏳ Pending | `backend/src/routes/admin.routes.ts` |
| Partner Dashboard UI | ⏳ Pending | `frontend/src/pages/partner/*` |
| Admin Panel UI | ⏳ Pending | `frontend/src/pages/admin/*` |
| Testing | ⏳ Pending | `backend/src/__tests__/*` |

---

## 🚀 Next Steps

1. **Add API Routes**: Create endpoints for partner/admin to fetch earnings
2. **Update Frontend**: Display manipulated values in partner dashboard
3. **Admin UI**: Show real vs shown values in admin panel
4. **Testing**: Unit tests for commission calculation
5. **Documentation**: API documentation with examples

---

**Implementation Date**: 2024-12-01  
**Status**: Backend Complete ✅  
**Next Phase**: API Routes & Frontend Integration