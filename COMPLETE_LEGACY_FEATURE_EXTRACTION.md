# 🎮 Complete Legacy System Feature Extraction

## Table of Contents
1. [Partner System](#partner-system)
2. [Andar Bahar Game Rules](#andar-bahar-game-rules)
3. [Betting & Payout System](#betting--payout-system)
4. [Authentication & User Management](#authentication--user-management)
5. [Bonus & Referral System](#bonus--referral-system)
6. [WhatsApp Payment System](#whatsapp-payment-system)
7. [Game Statistics & Analytics](#game-statistics--analytics)
8. [Admin Panel Features](#admin-panel-features)
9. [Real-time & WebSocket](#real-time--websocket)
10. [UI/UX & Frontend](#uiux--frontend)

---

## 1. Partner System

### 1.1 Two-Tier Commission Structure ⭐⭐⭐ CRITICAL

**Location**: `andar_bahar/shared/schema.ts:449-450`

```typescript
share_percentage: 50.00  // Hidden multiplier (25-75% range)
commission_rate: 10.00   // Visible rate to partner
```

**Calculation**:
```
Real Profit: 1000 INR (actual house earnings)
↓ (× share_percentage = 50%)
Shown Profit: 500 INR (partner sees this in dashboard)
↓ (× commission_rate = 10%)
Partner Earns: 50 INR (credited to partner wallet)

Effective Rate: 5% of real profit
House Keeps: 950 INR (95% of real profit)
```

### 1.2 Game History Manipulation ⭐⭐⭐ CRITICAL

**Location**: `andar_bahar/server/routes/partner.ts:236-242`

```typescript
const sharePercentage = partnerData?.share_percentage || 50;
const shareMultiplier = sharePercentage / 100;

// ALL financial values multiplied (hidden from partner)
const totalBets = parseFloat(game.total_bets) * shareMultiplier;
const totalWinnings = parseFloat(game.total_winnings) * shareMultiplier;
const houseEarnings = parseFloat(game.house_earnings) * shareMultiplier;
const andarTotalBet = parseFloat(game.andar_total_bet) * shareMultiplier;
const baharTotalBet = parseFloat(game.bahar_total_bet) * shareMultiplier;
const profitLoss = parseFloat(game.profit_loss) * shareMultiplier;
```

**Rules**:
- Partner NEVER sees `share_percentage` in any API
- All partner-facing endpoints apply multiplier
- Only admin sees real vs shown values
- Cards/non-financial data remain unchanged

### 1.3 Partner Wallet System

**Tables**: `partners`, `partner_wallets`, `partner_wallet_transactions`

**Features**:
- Real-time balance updates after each game
- Separate pending/available balance
- Minimum withdrawal: ₹100
- Withdrawal approval workflow
- Transaction history with filters

### 1.4 Partner Dashboard Data

**Endpoints**:
- `GET /api/partner/wallet/stats` - Dashboard overview
- `GET /api/partner/game-history` - Game list (manipulated values)
- `GET /api/partner/wallet/earnings` - Per-game earnings
- `GET /api/partner/wallet/transactions` - Wallet transactions
- `GET /api/partner/wallet/withdrawals` - Withdrawal requests

**Stats Shown** (all manipulated):
- Total earnings (lifetime)
- Available balance
- Pending balance
- Total players referred
- Active players (placed bets)
- Games played count
- Commission rate (10% - visible)

**Stats Hidden**:
- Share percentage (50% - invisible)
- Real profit values
- Actual commission percentage (5% effective)

---

## 2. Andar Bahar Game Rules

### 2.1 Payout Rules ⭐⭐⭐ CRITICAL

**Location**: `andar_bahar/server/game.ts:115-138`

#### Round 1 (First Card Match)
```typescript
if (winningSide === 'andar') {
  payout = betAmount * 2;  // 1:1 odds (bet + winnings)
  // Example: Bet 100 → Win 100 → Payout 200
} else if (winningSide === 'bahar') {
  payout = betAmount * 1;  // 1:0 refund only
  // Example: Bet 100 → Win 0 → Payout 100 (refund)
}
```

#### Round 2 (Second Card Match)
```typescript
if (winningSide === 'andar') {
  // Standard 1:1 for Andar bets
  totalAndar = round1Andar + round2Andar;
  payout = totalAndar * 2;
} else if (winningSide === 'bahar') {
  // Special: Round 1 Bahar gets 1:1, Round 2 Bahar refunded
  round1Payout = round1Bahar * 2;  // 1:1
  round2Payout = round2Bahar * 1;  // Refund
  payout = round1Payout + round2Payout;
}
```

#### Round 3+ (All Subsequent Matches)
```typescript
// Standard 1:1 for both sides
totalBetsOnWinningSide = round1 + round2 + round3 + ...;
payout = totalBetsOnWinningSide * 2;  // All bets get 1:1
```

### 2.2 Game Flow

1. **Betting Phase** (30 seconds)
   - Players place bets on Andar or Bahar
   - Real-time bet totals update
   - Countdown timer

2. **Card Reveal**
   - Joker card revealed first
   - Cards dealt alternately to Andar/Bahar
   - First match wins

3. **Payout Phase**
   - Automatic payout calculation
   - Balance updates
   - Statistics tracking
   - Partner commission calculation

4. **Next Round**
   - 5-second break
   - New betting phase starts

### 2.3 Betting Constraints

```typescript
MIN_BET = 10 INR
MAX_BET = 100,000 INR
BETTING_TIME = 30 seconds
BREAK_TIME = 5 seconds
```

### 2.4 Multi-Round Accumulation

**Critical Feature**: Bets accumulate across rounds of same game

```typescript
// Player can bet on multiple rounds before winner is found
userBets = {
  round1: { andar: 100, bahar: 50 },
  round2: { andar: 200, bahar: 0 },
  round3: { andar: 0, bahar: 150 }
}

// When Andar wins on round 3:
totalAndarBets = 100 + 200 + 0 = 300
payout = 300 * 2 = 600
```

---

## 3. Betting & Payout System

### 3.1 Balance Management ⭐⭐⭐ CRITICAL

**Dual Balance System**:
```typescript
user.balance        // Main wallet (deposits, winnings)
user.bonusBalance   // Locked bonus (requires wagering)
```

**Bet Deduction Priority**:
1. Use bonus balance first
2. Then use main balance
3. Fail if insufficient combined balance

**Location**: `andar_bahar/server/game.ts:55-68`

```typescript
let amountFromBonus = 0;
let amountFromMain = 0;

if (userBonusBalance > 0) {
  amountFromBonus = Math.min(userBonusBalance, amount);
  amountFromMain = amount - amountFromBonus;
} else {
  amountFromMain = amount;
}
```

### 3.2 Atomic Operations ⭐⭐⭐ CRITICAL

**All balance updates use SQL-level atomicity**:

```typescript
// WRONG (race condition):
const newBalance = oldBalance + amount;
UPDATE users SET balance = newBalance;

// CORRECT (atomic):
UPDATE users SET balance = balance + amount WHERE id = userId;
```

**Location**: `andar_bahar/server/game.ts:190-195`

### 3.3 Payout Processing

**Idempotency**: Each bet settled exactly once
- Bet status: `pending` → `won`/`lost`/`refunded`
- Re-processing prevented by status check
- Transaction records created

### 3.4 Bonus Wagering Tracking

**Location**: `andar_bahar/server/game.ts:228-262`

```typescript
// Only track wagering when bonus used
if (amountFromBonus > 0) {
  bonusWageringProgress += amountFromBonus;
  
  if (bonusWageringProgress >= wageringRequirement) {
    bonusStatus = 'unlocked';
    // Bonus converted to main balance
  }
}
```

**Rules**:
- Only wagered amount counts (not winnings)
- Only applies when bonus balance used
- Typical requirement: 10x bonus amount
- Must be completed before withdrawal

---

## 4. Authentication & User Management

### 4.1 Signup Flow

**Location**: `andar_bahar/server/auth.ts:20-103`

**Steps**:
1. Validate input (username, phone, password)
2. Check existing user/phone
3. Generate referral code (unique)
4. Hash password (bcrypt)
5. Create user record
6. Award signup bonus (₹500)
7. Process referrer bonus (if referral code used)
8. Generate JWT tokens
9. Return user + tokens

**Signup Bonus**:
```typescript
signupBonus = 500 INR (to bonus balance)
wageringRequirement = 500 * 10 = 5000 INR
status = 'active' (immediately usable)
```

### 4.2 Referral System ⭐⭐ IMPORTANT

**When user signs up with referral code**:

```typescript
// 1. Find referrer by code
const referrer = await getUserByReferralCode(referralCode);

// 2. Link user to referrer
newUser.referredBy = referrer.id;

// 3. Award referral bonus to referrer
referrerBonus = 200 INR (to bonus balance)
wageringRequirement = 200 * 5 = 1000 INR
status = 'pending' (must be approved first)

// 4. Create referral record
INSERT INTO referrals (referrer_id, referred_id, bonus, status)
```

**Referral Bonus Conditions**:
- Referee must complete first deposit (any amount)
- Then referrer bonus status: `pending` → `active`
- Referrer can then use bonus after wagering

### 4.3 JWT Token System

**Access Token**:
```typescript
expiresIn: '1h'
payload: { userId, role, username }
```

**Refresh Token**:
```typescript
expiresIn: '7d'
payload: { userId, tokenVersion }
stored in: users.refreshToken (hashed)
```

### 4.4 Role System

**Roles**: `player`, `partner`, `admin`

**Separate Auth Systems**:
- Players: `/api/auth/*`
- Partners: `/api/partner/auth/*`
- Admin: `/api/admin/auth/*`

**Middleware**:
- `requireAuth` - Verify player JWT
- `requirePartnerAuth` - Verify partner JWT
- `requireAdmin` - Verify admin JWT + role check

---

## 5. Bonus & Referral System

### 5.1 Bonus Types

#### Signup Bonus
```typescript
amount: 500 INR
type: 'signup'
wageringRequirement: 5000 INR (10x)
status: 'active' (immediate)
expiresAt: 30 days
```

#### Referral Bonus (Referrer)
```typescript
amount: 200 INR
type: 'referral'
wageringRequirement: 1000 INR (5x)
status: 'pending' (until referee deposits)
expiresAt: 60 days
```

#### Deposit Bonus (Manual Admin Award)
```typescript
amount: variable
type: 'deposit'
wageringRequirement: amount * 5
status: 'active'
expiresAt: 30 days
```

### 5.2 Bonus Lifecycle

```
┌─────────┐      wagering       ┌──────────┐     convert     ┌───────────┐
│ pending ├─────────────────────→│  active  ├────────────────→│ completed │
└─────────┘   (deposit done)     └──────────┘  (fully used)   └───────────┘
     │                                 │
     │ expire                          │ expire
     ↓                                 ↓
┌──────────┐                      ┌──────────┐
│ expired  │                      │ expired  │
└──────────┘                      └──────────┘
```

### 5.3 Wagering Progress Tracking

**Location**: `andar_bahar/server/game.ts:228-262`

```typescript
// After each bet using bonus
UPDATE user_bonuses 
SET wagering_progress = wagering_progress + bet_amount
WHERE user_id = userId AND status = 'active'

// Check if unlocked
IF wagering_progress >= wagering_requirement THEN
  status = 'completed'
  bonus_balance → main_balance (convert)
  bonus_balance = 0
END IF
```

### 5.4 Referral Dashboard

**User sees**:
- Referral code (shareable link)
- Total referrals count
- Active referrals (deposited)
- Pending bonus amount
- Total earned from referrals

**Location**: Player dashboard `/referral` page

---

## 6. WhatsApp Payment System

### 6.1 Deposit Flow ⭐⭐⭐ CRITICAL

**Location**: `andar_bahar/server/routes/payments.ts`

**Steps**:
1. User initiates deposit request
2. System shows admin WhatsApp number
3. User sends payment screenshot to admin
4. User uploads screenshot in app
5. Admin receives notification
6. Admin views pending deposits
7. Admin approves/rejects with reason
8. Balance updated (if approved)
9. User notified via in-app notification

**Deposit Request Schema**:
```typescript
{
  userId: string
  amount: number
  paymentMethod: 'upi' | 'bank_transfer'
  transactionId: string (optional)
  screenshotUrl: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy: userId (admin)
  approvedAt: timestamp
  rejectionReason: string (if rejected)
}
```

### 6.2 Withdrawal Flow

**Steps**:
1. User requests withdrawal (min ₹100)
2. System validates:
   - Sufficient main balance
   - No active bonuses blocking
   - User verified (KYC)
3. Amount moved to pending
4. Admin receives notification
5. Admin verifies & processes payment
6. Admin updates status with transaction ID
7. User notified

**Withdrawal Request Schema**:
```typescript
{
  userId: string
  amount: number
  withdrawalMethod: 'upi' | 'bank_transfer'
  bankName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  processedBy: userId (admin)
  processedAt: timestamp
  transactionId: string (external)
  rejectionReason: string
}
```

### 6.3 Admin WhatsApp Integration

**Config**:
```typescript
adminWhatsappNumber: '+91XXXXXXXXXX'
supportWhatsappNumber: '+91XXXXXXXXXX'
```

**Display**:
- Shown on deposit page
- Click-to-open WhatsApp with prefilled message
- Template: "Hi, I want to deposit ₹{amount}. Transaction ID: {id}"

---

## 7. Game Statistics & Analytics

### 7.1 Real-time Statistics

**Per Game**:
- Total rounds played
- Total bets placed
- Total bet amount (₹)
- Total payouts (₹)
- House earnings (bet - payout)
- Profit/Loss
- Unique players
- Andar bet count/amount
- Bahar bet count/amount

**Per Round**:
- Round number
- Joker card
- Winning side
- Winning card
- Total bets on Andar/Bahar
- Number of bets
- Betting start/end time
- Round start/end time

### 7.2 User Statistics

**Tracked per user**:
```typescript
{
  totalBets: number
  totalWins: number
  totalLosses: number
  totalWagered: decimal (₹)
  totalWinnings: decimal (₹)
  biggestWin: decimal (₹)
  currentStreak: number (+ win, - loss)
  longestStreak: number
  lastBetAt: timestamp
}
```

### 7.3 Partner Statistics

**Real values (admin only)**:
- Real profit per game
- Real total bets
- Real total payouts
- Actual commission rate

**Shown values (partner sees)**:
- Shown profit (× share_percentage)
- Shown total bets (× share_percentage)
- Shown total payouts (× share_percentage)
- Visible commission rate (10%)

### 7.4 Analytics Dashboard (Admin)

**Metrics**:
- Daily/Weekly/Monthly revenue
- Player acquisition
- Retention rate
- Average bet size
- Win/Loss ratio
- Most profitable games
- Partner performance
- Payment statistics
- Bonus utilization

---

## 8. Admin Panel Features

### 8.1 User Management

**Actions**:
- View all users (paginated, searchable)
- User details (profile, stats, transactions)
- Suspend/Ban user
- Adjust balance (add/subtract with reason)
- Award manual bonuses
- View referral tree
- Reset password
- Verify KYC documents

### 8.2 Payment Management

**Deposit Approvals**:
- View pending deposits
- Filter by date/amount/user
- Approve with balance credit
- Reject with reason
- View screenshot proof
- Transaction history

**Withdrawal Processing**:
- View pending withdrawals
- Verify user details
- Process payment externally
- Mark completed with transaction ID
- Reject with reason
- Batch processing

### 8.3 Game Management

**Controls**:
- Start/Stop game
- Set betting time
- Set min/max bet limits
- View live game status
- Manual winner declaration (emergency)
- View round history
- Cancel round (refund all bets)

### 8.4 Partner Management

**Actions**:
- Approve/Reject partner applications
- View partner details
- Adjust share_percentage (25%, 50%, 75%)
- View partner earnings (real + shown)
- Process partner withdrawals
- Suspend partner
- View referred players
- Export partner reports

### 8.5 Analytics & Reports

**Reports**:
- Daily financial summary
- User activity report
- Game performance report
- Partner commission report
- Payment processing report
- Bonus utilization report
- Retention & churn report

**Export**: CSV, Excel, PDF formats

---

## 9. Real-time & WebSocket

### 9.1 WebSocket Events ⭐⭐⭐ CRITICAL

**Location**: `andar_bahar/server/socket.ts`

**Client → Server**:
```typescript
'join-game'      // Join game room
'place-bet'      // Place bet on Andar/Bahar
'leave-game'     // Leave game room
```

**Server → Client**:
```typescript
'game-state'     // Full game state (on join)
'betting-open'   // Betting phase started
'betting-closed' // Betting phase ended
'card-revealed'  // New card revealed (joker or playing)
'round-result'   // Round winner announced
'balance-update' // User balance changed
'bet-confirmed'  // Bet placed successfully
'bet-error'      // Bet failed (insufficient balance, etc.)
'payout'         // Winnings credited
```

### 9.2 Game State Broadcast

**Sent to all players in room**:
```typescript
{
  gameId: string
  status: 'betting' | 'playing' | 'completed'
  roundNumber: number
  jokerCard: string | null
  cardsRevealed: string[]
  totalAndarBets: number
  totalBaharBets: number
  bettingEndsAt: timestamp
  timeRemaining: number
}
```

### 9.3 Personal State (User-specific)

**Sent only to individual user**:
```typescript
{
  userId: string
  balance: number
  bonusBalance: number
  currentBets: {
    andar: number
    bahar: number
  }
  potentialWin: number
}
```

### 9.4 Live Updates

**Real-time features**:
- Bet counter (Andar/Bahar totals)
- Timer countdown
- Card animations
- Balance updates
- Payout notifications
- Other players' bets (anonymous)

---

## 10. UI/UX & Frontend

### 10.1 Mobile vs Desktop

**Mobile Specific** (< 768px):
- Vertical layout
- Bottom betting panel
- Simplified card display
- Touch-optimized buttons
- Fullscreen video
- Collapsible history

**Desktop** (≥ 768px):
- Horizontal layout
- Side panels for betting & history
- Larger card displays
- Hover effects
- Multi-column layout

### 10.2 Theme System

**Royal Gold Theme**:
```css
Primary: #FFD700 (Gold)
Secondary: #1a1a2e (Dark Navy)
Accent: #E74C3C (Red for Bahar)
Success: #16A34A (Green for Andar)
Background: Gradient (Navy → Black)
```

**Components**:
- Gold borders on cards
- Animated gradients
- Particle effects
- Smooth transitions
- Glass morphism panels

### 10.3 Key Pages

**Player App**:
1. Login/Signup (with referral code input)
2. Home Dashboard (balance, quick play)
3. Game Room (main game interface)
4. Wallet (deposit/withdrawal)
5. Transaction History
6. Game History
7. Bonuses (active, completed)
8. Referral Dashboard
9. Profile & Settings
10. Support (WhatsApp link)

**Partner Dashboard**:
1. Dashboard (earnings overview)
2. Players (referred users)
3. Earnings (per-game breakdown)
4. Payouts (withdrawal requests)
5. Statistics (graphs & charts)
6. Settings (profile, bank details)

**Admin Panel**:
1. Dashboard (overview metrics)
2. Users (manage all users)
3. Payments (deposits & withdrawals)
4. Games (live control & history)
5. Partners (manage partners)
6. Bonuses (award & track)
7. Analytics (reports & charts)
8. Settings (system config)

### 10.4 Critical UX Features

**Game Room**:
- Clear bet buttons (Andar Green, Bahar Red)
- Bet amount selector (quick select: 100, 500, 1000, custom)
- Visual feedback on bet placement
- Countdown timer (prominent)
- Real-time balance update
- Win/Loss animations
- Sound effects (optional)
- Auto-scroll game history

**Responsive Betting**:
- Double-tap to quick bet (mobile)
- Keyboard shortcuts (desktop: A for Andar, B for Bahar)
- Bet confirmation (optional setting)
- Undo last bet (before betting closes)

---

## 11. Database Schema Critical Points

### 11.1 Indexing Strategy

**Critical Indexes**:
```sql
-- User lookups
CREATE INDEX users_username_idx ON users(username);
CREATE INDEX users_referral_code_idx ON users(referral_code);

-- Bet queries
CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_round_id_idx ON bets(round_id);
CREATE INDEX bets_status_idx ON bets(status);

-- Partner queries
CREATE INDEX partner_commissions_partner_id_idx ON partner_commissions(partner_id);
CREATE INDEX referrals_referrer_id_idx ON referrals(referrer_id);

-- Transactions
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_created_at_idx ON transactions(created_at);
```

### 11.2 Data Integrity

**Constraints**:
- User balance never negative
- Bet amount within min/max limits
- Referral code unique
- Partner code unique
- Transaction amounts always positive
- Status transitions validated

**Triggers**:
- Update user statistics after bet settlement
- Calculate partner commission after round completion
- Award referral bonus on first deposit
- Expire old bonuses daily

---

## 12. Security Features

### 12.1 Authentication Security

**Password**:
- Bcrypt hashing (salt rounds: 10)
- Minimum 6 characters
- No password history (legacy allows reuse)

**JWT**:
- Access token: 1 hour
- Refresh token: 7 days
- Token rotation on refresh
- Blacklist on logout

### 12.2 API Security

**Rate Limiting**:
```typescript
login: 5 attempts / 15 minutes
place-bet: 100 requests / minute
deposit-request: 10 requests / hour
```

**Input Validation**:
- All inputs sanitized
- SQL injection prevention (parameterized queries)
- XSS prevention (escape output)
- CSRF tokens (for state-changing requests)

### 12.3 Financial Security

**Transaction Atomicity**:
- All balance updates in transactions
- Rollback on error
- Idempotency keys for payouts
- Double-spend prevention

**Audit Trail**:
- All balance changes logged
- Admin actions logged
- Failed login attempts logged
- Suspicious activity flagged

---

## 13. Performance Optimizations

### 13.1 Database

**Query Optimization**:
- Proper indexes on all foreign keys
- Pagination on all lists (default: 50 items)
- Aggregate queries for statistics
- Batch processing for payouts

**Caching**:
- Redis for active game state
- User session caching
- Referral code → user ID mapping
- Game configuration

### 13.2 WebSocket

**Optimization**:
- Room-based broadcasting (don't send to all users)
- Debounce rapid updates (balance, bets)
- Compress large payloads
- Heartbeat ping every 30s

### 13.3 Frontend

**Optimization**:
- Lazy loading routes
- Image optimization (WebP, lazy load)
- Code splitting per page
- Virtualized lists (game history)
- Memoized components
- Debounced search inputs

---

## 14. Scalability Requirements

### 14.1 Concurrent Users

**Target**: 10,000 concurrent players

**Architecture**:
- Horizontal scaling (multiple servers)
- Load balancer (Nginx)
- Redis pub/sub for WebSocket
- Database connection pooling
- CDN for static assets

### 14.2 Database Scaling

**Strategies**:
- Read replicas for analytics
- Partition game_statistics by month
- Archive old game_history (> 6 months)
- Separate database for partner data

---

## ✅ Implementation Checklist

### Phase 1: Core Systems
- [ ] Two-tier partner commission structure
- [ ] Andar Bahar payout rules (Round 1/2/3+)
- [ ] Atomic balance operations
- [ ] Bonus wagering tracking
- [ ] WebSocket real-time updates

### Phase 2: Partner Features
- [ ] Game history manipulation
- [ ] Partner dashboard (shown values only)
- [ ] Commission calculation per round
- [ ] Withdrawal system
- [ ] Admin partner management

### Phase 3: Payment System
- [ ] WhatsApp deposit flow
- [ ] Screenshot upload & approval
- [ ] Withdrawal request & processing
- [ ] Transaction history
- [ ] Admin payment dashboard

### Phase 4: Bonus & Referral
- [ ] Signup bonus (₹500)
- [ ] Referral system (₹200)
- [ ] Wagering progress tracking
- [ ] Bonus expiration
- [ ] Referral dashboard

### Phase 5: UI/UX
- [ ] Mobile-optimized game room
- [ ] Responsive betting interface
- [ ] Real-time animations
- [ ] Royal gold theme
- [ ] Touch gestures

### Phase 6: Admin Panel
- [ ] User management
- [ ] Payment approvals
- [ ] Game controls
- [ ] Partner management
- [ ] Analytics dashboard

### Phase 7: Testing & Launch
- [ ] Load testing (10K users)
- [ ] Security audit
- [ ] Payment flow testing
- [ ] WebSocket stress testing
- [ ] Production deployment

---

**Document Status**: Complete ✅
**Last Updated**: 2024-12-01
**Total Features Extracted**: 150+
**Priority Features**: 25 (marked with ⭐)