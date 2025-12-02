# Phase 12: State Management Implementation Progress

## Overview
Phase 12 focuses on implementing comprehensive state management using Zustand for client state and TanStack Query for server state, along with WebSocket real-time connectivity.

## Progress: 30% Complete

### ✅ Completed Components (10 files)

#### 1. Foundation Layer (5 files)
- **`src/lib/utils.ts`** (161 lines)
  - Utility functions: formatCurrency, formatDate, formatTime, cn, debounce, throttle, copyToClipboard
  
- **`src/lib/api.ts`** (91 lines)
  - Axios client with base configuration
  - JWT token interceptors (request/response)
  - Automatic token refresh on 401
  - Error handling and toast notifications

- **`src/lib/socket.ts`** (108 lines)
  - WebSocket client initialization
  - Connection management (connect, disconnect, reconnect)
  - Event emitters and listeners
  - Connection status tracking

- **`src/types/index.ts`** (305 lines)
  - Complete TypeScript type definitions
  - User, Game, Bet, Transaction, Bonus, Partner, Referral types
  - WebSocket event types
  - Form types and API response types

#### 2. Zustand Stores (3 files)
- **`src/store/authStore.ts`** (113 lines)
  - Authentication state management
  - Login/logout actions
  - Token persistence in localStorage
  - User profile management

- **`src/store/gameStore.ts`** (248 lines)
  - Current game and round state
  - Betting state (selected chip, side, current bets, history)
  - Card state (joker, andar cards, bahar cards)
  - Timer and round phase management
  - Stream state (loop vs live)
  - Winner celebration state
  - Comprehensive betting actions (place, undo, clear, rebet, double)

- **`src/store/userStore.ts`** (156 lines)
  - User profile and balance state
  - Transactions management
  - Bonuses and active bonus tracking
  - Referrals and referral statistics
  - Balance update actions
  - Persistence for profile and balance

- **`src/store/partnerStore.ts`** (155 lines)
  - Partner profile and statistics
  - Players list and active player tracking
  - Commissions management
  - Earnings tracking (today, week, month, total)
  - Pending and paid earnings
  - Persistence for partner data

#### 3. Context Providers (1 file)
- **`src/contexts/WebSocketContext.tsx`** (192 lines)
  - WebSocket provider component
  - Real-time event handling
  - Integration with all Zustand stores
  - Connection status tracking
  - Automatic reconnection handling
  - Event listeners for:
    - Game updates (round, cards, winner, timer)
    - Balance and transaction updates
    - Partner commission updates

#### 4. Documentation (1 file)
- **`PHASE_12_STATE_MANAGEMENT_PROGRESS.md`** (this file)

---

## 🔄 In Progress / Pending (30+ files)

### TanStack Query Hooks (~/hooks/queries/)
Need to create organized query hooks for all API endpoints:

#### User Queries (`~/hooks/queries/user/`)
- [ ] `useProfile.ts` - Fetch user profile
- [ ] `useBalance.ts` - Fetch current balance
- [ ] `useTransactions.ts` - Paginated transactions with filters
- [ ] `useBonuses.ts` - Fetch all bonuses
- [ ] `useActiveBonus.ts` - Fetch active bonus
- [ ] `useReferrals.ts` - Fetch referral list
- [ ] `useReferralStats.ts` - Fetch referral statistics
- [ ] `useStatistics.ts` - Fetch user game statistics

#### Game Queries (`~/hooks/queries/game/`)
- [ ] `useCurrentGame.ts` - Fetch current game
- [ ] `useCurrentRound.ts` - Fetch active round
- [ ] `useGameHistory.ts` - Paginated game history
- [ ] `useUserBets.ts` - Fetch user's bets for current/past rounds
- [ ] `useGameStatistics.ts` - Fetch game analytics
- [ ] `useLivePlayerCount.ts` - Fetch active players count

#### Admin Queries (`~/hooks/queries/admin/`)
- [ ] `useUsers.ts` - Paginated users list
- [ ] `useUserDetails.ts` - Individual user details
- [ ] `useDeposits.ts` - Pending/all deposits
- [ ] `useWithdrawals.ts` - Pending/all withdrawals
- [ ] `usePartners.ts` - Partners list
- [ ] `usePartnerDetails.ts` - Individual partner details
- [ ] `useDashboardStats.ts` - Admin dashboard statistics
- [ ] `useAnalytics.ts` - Game and financial analytics
- [ ] `useGameRounds.ts` - All game rounds with filters

#### Partner Queries (`~/hooks/queries/partner/`)
- [ ] `usePartnerPlayers.ts` - Players referred by partner
- [ ] `usePartnerCommissions.ts` - Commissions earned
- [ ] `usePartnerEarnings.ts` - Earnings breakdown
- [ ] `usePartnerStatistics.ts` - Partner analytics

### TanStack Query Mutations (~/hooks/mutations/)
Need to create mutation hooks for all write operations:

#### Auth Mutations (`~/hooks/mutations/auth/`)
- [ ] `useLogin.ts`
- [ ] `useSignup.ts`
- [ ] `useLogout.ts`
- [ ] `usePartnerLogin.ts`
- [ ] `usePartnerSignup.ts`

#### Game Mutations (`~/hooks/mutations/game/`)
- [ ] `usePlaceBet.ts` - Place bet with optimistic updates
- [ ] `useCancelBet.ts` - Cancel pending bet

#### Payment Mutations (`~/hooks/mutations/payment/`)
- [ ] `useCreateDeposit.ts` - Submit deposit request
- [ ] `useCreateWithdrawal.ts` - Submit withdrawal request

#### Admin Mutations (`~/hooks/mutations/admin/`)
- [ ] `useApproveDeposit.ts`
- [ ] `useRejectDeposit.ts`
- [ ] `useApproveWithdrawal.ts`
- [ ] `useRejectWithdrawal.ts`
- [ ] `useCreateRound.ts`
- [ ] `useStartRound.ts`
- [ ] `useCloseBetting.ts`
- [ ] `useDealCards.ts`
- [ ] `useProcessPayouts.ts`
- [ ] `useUpdateUser.ts`
- [ ] `useUpdateGameSettings.ts`

### Custom Hooks (~/hooks/)
General-purpose React hooks:

- [ ] `useAuth.ts` - Authentication helper hook
- [ ] `useGame.ts` - Game state helper hook
- [ ] `useWebSocket.ts` - Already created in context
- [ ] `useMediaQuery.ts` - Responsive breakpoints
- [ ] `useDebounce.ts` - Debounce values
- [ ] `useThrottle.ts` - Throttle callbacks
- [ ] `useLocalStorage.ts` - localStorage hook
- [ ] `useSessionStorage.ts` - sessionStorage hook
- [ ] `useOnClickOutside.ts` - Detect clicks outside element
- [ ] `useInterval.ts` - setInterval hook
- [ ] `useTimeout.ts` - setTimeout hook
- [ ] `useCopyToClipboard.ts` - Copy text utility
- [ ] `useCountdown.ts` - Countdown timer for betting

---

## Architecture Decisions

### State Management Strategy

#### Client State (Zustand)
- **Auth Store**: User authentication, tokens, session
- **Game Store**: Active game/round, betting UI, cards, timer
- **User Store**: Profile, transactions, bonuses, referrals
- **Partner Store**: Partner data, commissions, earnings

**Why Zustand?**
- Lightweight (1KB)
- No boilerplate
- Built-in persistence
- DevTools support
- Great TypeScript support

#### Server State (TanStack Query)
- **Queries**: Fetch data with automatic caching, refetching, and background updates
- **Mutations**: Write operations with optimistic updates and cache invalidation
- **Automatic refetching**: On window focus, network reconnection
- **Stale-while-revalidate**: Show cached data while fetching fresh data

**Why TanStack Query?**
- Automatic cache management
- Request deduplication
- Parallel queries
- Optimistic updates
- Pagination and infinite scrolling
- Prefetching support

#### Real-time (WebSocket)
- **Socket.IO Client**: For game events, balance updates, live betting
- **Context Provider**: Manages connection lifecycle and event subscriptions
- **Store Integration**: WebSocket events update Zustand stores directly

### Code Organization

```
frontend/src/
├── lib/
│   ├── utils.ts          # Utility functions
│   ├── api.ts            # Axios client
│   └── socket.ts         # WebSocket client
├── types/
│   └── index.ts          # TypeScript types
├── store/
│   ├── authStore.ts      # Auth state
│   ├── gameStore.ts      # Game state
│   ├── userStore.ts      # User state
│   └── partnerStore.ts   # Partner state
├── contexts/
│   └── WebSocketContext.tsx  # WebSocket provider
├── hooks/
│   ├── queries/
│   │   ├── user/         # User data queries
│   │   ├── game/         # Game data queries
│   │   ├── admin/        # Admin data queries
│   │   └── partner/      # Partner data queries
│   ├── mutations/
│   │   ├── auth/         # Auth mutations
│   │   ├── game/         # Game mutations
│   │   ├── payment/      # Payment mutations
│   │   └── admin/        # Admin mutations
│   └── [custom hooks]    # Utility hooks
└── components/
    └── [UI components]   # To be created in Phase 13
```

---

## Key Features Implemented

### 1. Comprehensive Betting State
- Selected chip tracking (₹2,500 to ₹100,000)
- Side selection (Andar/Bahar)
- Current bets tracking
- Bet history for undo functionality
- Total bet amount calculation
- Betting controls (undo, clear, rebet, double)

### 2. Real-time Game Flow
- Round status tracking (waiting, betting, dealing, complete)
- Card dealing animations support
- Joker card display
- Andar/Bahar card collections
- Timer countdown
- Winner celebration with payout

### 3. Stream Management
- Loop mode (idle state with uhd_30fps.mp4)
- Live mode (OvenMediaEngine WebRTC/HLS)
- Seamless transition state tracking
- Automatic mode switching based on round status

### 4. Balance Management
- Main balance and bonus balance tracking
- Real-time balance updates via WebSocket
- Transaction history
- Optimistic updates for better UX

### 5. Bonus System
- Active bonus tracking
- Wagering progress
- Auto-unlock at 30x wagering
- Bonus expiry handling

### 6. Partner System
- Earnings tracking (today, week, month, total)
- Commission calculation (2% of player bets)
- Player management
- Commission history

---

## Next Steps

### Immediate (Complete Phase 12)
1. **Create TanStack Query setup file** (`src/lib/queryClient.ts`)
2. **Implement user query hooks** (8 files)
3. **Implement game query hooks** (6 files)
4. **Implement admin query hooks** (9 files)
5. **Implement partner query hooks** (4 files)
6. **Implement mutation hooks** (~15 files)
7. **Create custom utility hooks** (~10 files)
8. **Create provider wrapper** for TanStack Query
9. **Update App.tsx** to include all providers
10. **Create comprehensive tests** for stores and hooks

### After Phase 12
- **Phase 13**: UI Component Library (60+ components)
- **Phase 14**: Authentication Pages
- **Phase 15**: Game Room Interface (most complex)
- **Phase 16-18**: Dashboards (User, Admin, Partner)
- **Phase 19**: Mobile Optimization
- **Phase 20**: OvenMediaEngine Integration
- **Phase 21**: Testing Suite
- **Phase 22**: Production Deployment

---

## Dependencies Required

All TypeScript errors are expected until dependencies are installed.

Run in `frontend/` directory:
```bash
npm install
```

This will install:
- React 18.3
- Zustand 5.0
- TanStack Query 5.62
- Socket.IO Client 4.8
- Axios 1.7
- All other dependencies from package.json

---

## Performance Considerations

### Caching Strategy
- **Stale time**: 5 minutes for user data, 30 seconds for game data
- **Cache time**: 10 minutes default
- **Refetch on focus**: Enabled for critical data
- **Refetch on reconnect**: Enabled
- **Retry logic**: 3 retries with exponential backoff

### Optimistic Updates
- Bet placement (instant UI feedback)
- Balance updates (predicted before confirmation)
- Transaction creation (show immediately)

### Code Splitting
- Lazy load pages with React.lazy()
- Route-based code splitting
- Component-level splitting for large features

---

## Testing Plan

### Unit Tests (Vitest)
- Store actions and state updates
- Utility functions
- Query/mutation hooks

### Integration Tests
- WebSocket event handling
- Store + API integration
- Optimistic update flows

### E2E Tests (Playwright)
- Complete betting flow
- Balance updates
- Real-time synchronization

---

## Status Summary

**Total Progress: 30%**
- ✅ Foundation layer (5 files) - 100%
- ✅ Zustand stores (4 files) - 100%
- ✅ WebSocket context (1 file) - 100%
- ⏳ TanStack Query hooks (0/50+ files) - 0%
- ⏳ Custom hooks (0/10 files) - 0%

**Estimated Remaining Work**: 40+ files, ~3,000 lines of code

**Next Action**: Create TanStack Query infrastructure and implement all query/mutation hooks systematically.