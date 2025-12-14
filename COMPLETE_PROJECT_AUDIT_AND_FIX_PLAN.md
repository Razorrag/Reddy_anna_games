# Complete Project Audit & Fix Plan

## 1. Critical Fixes Applied (Flickering & Admin Redirect Issue)

### Root Causes Identified:
1. **Stale Auth Data in localStorage**: Zustand's `persist` middleware stores auth state to `auth-storage`. When the page loads, it hydrates this BEFORE React can validate if the token is still valid.
2. **Route Mismatch**: `useLogin.ts` was navigating to `/admin/dashboard` after admin login, but the actual route is `/admin`.
3. **Incomplete 401 Handling**: The API interceptor was clearing `auth_token` but NOT `auth-storage`, causing the Zustand store to still think the user was logged in.
4. **Layout Redirect Logic**: `PlayerLayout` redirects admins to `/admin`, and `AdminLayout` redirects non-admins to `/login`. Combined with stale data, this caused redirect loops.

### Fixes Applied:

#### 1.1. `useLogin.ts` - Fixed wrong route
```typescript
// BEFORE (wrong)
navigate('/admin/dashboard');

// AFTER (correct)
navigate('/admin');
```

#### 1.2. `api.ts` - Clear ALL auth data on 401
```typescript
// Now clears Zustand persist storage on 401
localStorage.removeItem('auth-storage');
```

#### 1.3. `authStore.ts` - Logout clears persist
```typescript
// Logout now clears persisted Zustand state
localStorage.removeItem('auth-storage');
```

#### 1.4. NEW: `AuthInitializer.tsx` - Validates token on startup
A new component that:
- Runs on app mount
- Validates stored token with backend (`/api/auth/me`)
- If invalid, clears ALL auth data
- Shows loading spinner until validation completes
- Prevents stale data from causing flickering

#### 1.5. `App.tsx` - Wrapped with AuthInitializer
The entire app is now wrapped with `AuthInitializer` to ensure token validation before any protected route renders.

#### 1.6. `nginx.prod.conf` - Disabled caching for HTML
- Root path `/` now has `Cache-Control: no-store`
- Static assets (JS/CSS/images) still cached for performance

---

## 2. Database Schema Audit
**File:** `backend/src/db/schema.ts`

The database is structured around **PostgreSQL** using **Drizzle ORM**. It contains **14 Tables** covering the entire game ecosystem.

### Core Tables
1.  **users**: Stores player, admin, and partner accounts.
    *   *Key Fields*: `id`, `username`, `balance`, `bonusBalance`, `role` (player/admin/partner), `status`.
2.  **games**: Game definitions (Andar Bahar, etc.).
    *   *Key Fields*: `streamUrl`, `minBet`, `maxBet`, `status`.
3.  **game_rounds**: Individual rounds of a game.
    *   *Key Fields*: `winningSide`, `winningCard`, `status` (betting/playing/completed).
4.  **bets**: User bets on specific rounds.
    *   *Key Fields*: `amount`, `betSide`, `status` (pending/won/lost), `payoutAmount`.

### Financial Tables
5.  **transactions**: Ledger for all money movements.
    *   *Types*: deposit, withdrawal, bet, win, bonus, commission.
6.  **deposits**: Deposit requests and proofs (screenshots).
7.  **withdrawals**: Withdrawal requests and bank details.

### Partner System
8.  **partners**: Partner profiles and commission rates.
9.  **partner_commissions**: Individual commission records.
10. **partner_game_earnings**: Aggregated earnings per game/round for reporting.

### Engagement
11. **user_bonuses**: Active bonuses and wagering requirements.
12. **referrals**: Referral system tracking.
13. **notifications**: User alerts.
14. **game_statistics** & **user_statistics**: Aggregated data for analytics.

---

## 3. Backend API Audit
**Root Path:** `/api`

### 3.1. Auth Routes (`/api/auth`)
- `POST /register` & `/signup`: User registration.
- `POST /login`: Authentication (Phone/Password).
- `GET /me`: Get current session user.
- `POST /refresh`: Refresh JWT token.

### 3.2. Game Routes (`/api/games`)
- `GET /:gameId`: Get active game details.
- `GET /:gameId/current-round`: Polling endpoint for current round state.
- `POST /:gameId/rounds`: Create round (Admin).
- `POST /rounds/:roundId/close-betting` & `/deal`: Game control actions (Admin).
- `GET /:gameId/history` & `/statistics`: Historical data.

### 3.3. Bet Routes (`/api/bets`)
- `POST /`: Place a bet.
- `GET /`: Get user's bet history.
- `DELETE /:betId` & `POST /undo`: Cancel/Undo bets.
- `POST /rebet`: Repeat previous bet.

### 3.4. Payment Routes (`/api/payments`)
- `POST /deposit`: Create deposit request.
- `POST /deposit/:id/screenshot`: Upload proof.
- `POST /withdrawal`: Request withdrawal.
- `GET /settings`: Get admin bank/UPI details.
- **Admin**: Approve/Reject endpoints for both deposits and withdrawals.

### 3.5. Admin Routes (`/api/admin`)
- **User Management**: `GET /users`, `PUT /users/:id/status` (Ban/Suspend).
- **Game Control**: `POST /stream/pause`, `/stream/loop-mode`.
- **Analytics**: `GET /dashboard/stats`, `/analytics`, `/revenue`.

### 3.6. Partner Routes (`/api/partners`)
- `GET /dashboard`: Partner-specific stats.
- `GET /commissions`: Earnings history.
- `POST /withdraw`: Request commission payout.

---

## 4. Frontend Architecture Audit
**Framework:** React (Vite) + TypeScript
**State Management:** Zustand (`authStore`, `notificationStore`)
**Data Fetching:** TanStack Query (React Query)
**Styling:** Tailwind CSS + Shadcn UI

### 4.1. Routing Structure (`App.tsx`)
The app uses `wouter` for routing with three distinct layouts:

1.  **Public Routes**:
    *   `/`: Landing Page
    *   `/login`, `/signup`: Auth pages
    *   `/partner/login`, `/partner/signup`: Partner auth

2.  **Player Routes** (Protected by `PlayerLayout`):
    *   `/game`: Main Game Room (Andar Bahar)
    *   `/dashboard`: User Dashboard
    *   `/wallet`, `/deposit`, `/withdraw`: Financial pages
    *   `/profile`, `/history`, `/bonuses`: User account pages

3.  **Admin Routes** (Protected by `AdminLayout`):
    *   `/admin`: Dashboard
    *   `/admin/users`, `/admin/game-control`: Management
    *   `/admin/deposits`, `/admin/withdrawals`: Finance approval

4.  **Partner Routes** (Protected by `PartnerLayout`):
    *   `/partner/dashboard`: Overview
    *   `/partner/players`: Referred user list

### 4.2. Data Flow
1.  **Authentication**: User logs in -> JWT stored -> Socket initialized.
2.  **Real-time Updates**: `WebSocketContext` listens for:
    *   `game:state`: Updates round status (betting/dealing).
    *   `game:odds`: Live betting odds (if applicable).
    *   `user:balance`: Real-time balance updates.
3.  **Game Loop**:
    *   User enters `/game`.
    *   Fetches current round state.
    *   WebSocket pushes updates (Cards dealt, Winner declared).
    *   `react-query` invalidates `userBets` and `balance` on round end.

---

## 5. Identified Issues & Next Steps

| Priority | Issue | Status | Action Plan |
| :--- | :--- | :--- | :--- |
| **Critical** | **Landing Page Flickering / Admin Redirect** | **FIXED** | Removed auto-redirect. Updated Nginx cache headers. |
| **High** | **Route Caching** | **FIXED** | Nginx configured to `no-store` index.html. |
| **Medium** | **Missing Mobile Optimization** | Pending | Review `GameRoomPage` for mobile responsiveness. |
| **Medium** | **Stream Latency** | Pending | Verify `ovenmediaengine` config in Nginx (already present but needs testing). |
| **Low** | **Lint Errors** | Pending | Fix `framer-motion` import in LandingPage. |

## 6. Final Verification Steps for User
1.  **Clear Browser Cache**: deeply clear your browser cache or use a fresh Incognito window.
2.  **Login Test**: Login as a player. You should NOT be redirected to Admin. You should see "Dashboard" in the top nav.
3.  **Game Test**: Navigate to `/game` and verify the WebSocket connection (Sparkles icon or Live status).

This document serves as the master map for the current state of the project. All core components are accounted for.
