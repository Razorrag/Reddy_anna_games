# 🎯 COMPLETE SYSTEM MAPPING - RAJU GARI KOSSU

**Generated:** December 3, 2025  
**Purpose:** Comprehensive mapping of all pages, functions, APIs, and database connections

---

## 📊 TABLE OF CONTENTS
1. [Frontend Pages Mapping](#frontend-pages-mapping)
2. [API Endpoints Mapping](#api-endpoints-mapping)
3. [Database Schema Mapping](#database-schema-mapping)
4. [React Hooks & Functions](#react-hooks--functions)
5. [Backend Controllers & Services](#backend-controllers--services)
6. [WebSocket Events](#websocket-events)
7. [Type Mismatches & Issues](#type-mismatches--issues)

---

## 📱 FRONTEND PAGES MAPPING

### **A. Authentication Pages** (5 pages)

| Page | Path | Functions Used | API Calls | Database Tables |
|------|------|----------------|-----------|-----------------|
| **Login** | `/login` | `useLogin` | POST `/api/auth/login` | users |
| **Signup** | `/signup` | `useSignup` | POST `/api/auth/register` | users, referrals |
| **ForgotPassword** | `/forgot-password` | `useForgotPassword` | POST `/api/auth/forgot-password` | users |
| **PartnerLoginPage** | `/partner/login` | `usePartnerLogin` | POST `/api/partners/login` | users, partners |
| **PartnerSignupPage** | `/partner/signup` | `usePartnerSignup` | POST `/api/partners/register` | users, partners |

---

### **B. Player/User Pages** (13 pages)

| Page | Path | Functions Used | API Calls | Database Tables |
|------|------|----------------|-----------|-----------------|
| **DashboardPage** | `/dashboard` | `useBalance`, `useUserBonuses`, `useUserNotifications` | GET `/api/users/balance`, GET `/api/bonuses`, GET `/api/notifications` | users, user_bonuses, notifications |
| **GameRoom** | `/game/:gameId` | `usePlaceBet`, `useCancelBet`, `useCurrentRound`, `useGameStatistics` | POST `/api/bets`, GET `/api/games/:gameId/current-round`, WebSocket | games, game_rounds, bets |
| **DepositPage** | `/deposit` | `useCreateDeposit` | POST `/api/payments/deposit` | deposits, transactions |
| **Wallet** | `/wallet` | `useBalance`, `useCreateDeposit`, `useCreateWithdrawal` | GET `/api/users/balance`, POST `/api/payments/deposit`, POST `/api/payments/withdrawal` | users, deposits, withdrawals |
| **Bonuses** | `/bonuses` | `useUserBonuses`, `useUnlockBonus` | GET `/api/bonuses`, POST `/api/bonuses/:id/unlock` | user_bonuses |
| **GameHistory** | `/history` | `useUserGameHistory` | GET `/api/games/history` | game_history, bets |
| **Referrals** | `/referrals` | `useUserReferrals` | GET `/api/users/referrals` | referrals, users |
| **Profile** | `/profile` | `useUpdateProfile`, `useBalance` | PUT `/api/users/profile`, GET `/api/users/balance` | users, user_statistics |
| **Settings** | `/settings` | `useChangePassword`, `useUpdateNotificationSettings` | POST `/api/users/password`, PUT `/api/users/settings` | users |
| **Notifications** | `/notifications` | `useUserNotifications`, `useMarkNotificationRead`, `useDeleteNotification` | GET `/api/notifications`, PUT `/api/notifications/:id/read`, DELETE `/api/notifications/:id` | notifications |
| **Transactions** | `/transactions` | `useTransactionHistory` | GET `/api/users/transactions` | transactions |
| **Verification** | `/verification` | `useUploadVerificationDocument` | POST `/api/users/documents` | users |
| **Support** | `/support` | `useSubmitSupportTicket` | POST `/api/support/ticket` | support_tickets |

---

### **C. Partner Pages** (10 pages)

| Page | Path | Functions Used | API Calls | Database Tables |
|------|------|----------------|-----------|-----------------|
| **Dashboard** | `/partner/dashboard` | `usePartnerStatistics` | GET `/api/partners/statistics` | partners, partner_commissions, partner_game_earnings |
| **EarningsHistory** | `/partner/earnings` | `usePartnerEarnings` | GET `/api/partners/earnings` | partner_game_earnings, partner_commissions |
| **MyPlayers** | `/partner/players` | `usePartnerPlayers` | GET `/api/partners/referrals` | referrals, users, user_statistics |
| **PayoutRequests** | `/partner/payouts` | `usePartnerCommissions`, `useCreatePayoutRequest`, `useCancelPayoutRequest` | GET `/api/partners/commissions`, POST `/api/partners/withdraw`, DELETE `/api/partners/payouts/:id` | partner_commissions, withdrawals |
| **ReferralStats** | `/partner/referral-stats` | `usePartnerStatistics` | GET `/api/partners/statistics` | referrals, users, bets |
| **Settings** | `/partner/settings` | `useUpdatePartnerProfile`, `useUpdatePartnerPassword`, `useUpdatePartnerPreferences` | PUT `/api/partners/profile`, POST `/api/partners/password`, PUT `/api/partners/preferences` | partners, users |
| **PartnerDashboardPage** | `/partner/overview` | `usePartnerStatistics` | GET `/api/partners/statistics` | partners, partner_game_earnings |
| **PartnerCommissionsPage** | `/partner/commissions` | `usePartnerCommissions` | GET `/api/partners/commissions` | partner_commissions |
| **PartnerPlayersPage** | `/partner/my-players` | `usePartnerPlayers` | GET `/api/partners/referrals` | referrals, users |
| **PartnerGameHistoryPage** | `/partner/game-history` | `usePartnerEarnings` | GET `/api/partners/earnings` | partner_game_earnings, game_rounds |

---

### **D. Admin Pages** (30 pages)

| Page | Path | Functions Used | API Calls | Database Tables |
|------|------|----------------|-----------|-----------------|
| **Dashboard** | `/admin` | `useAdminDashboard`, `useDashboardStats` | GET `/api/admin/dashboard` | users, games, bets, transactions |
| **UsersList** | `/admin/users` | `useUsers`, `useBulkUserAction` | GET `/api/admin/users`, POST `/api/admin/users/bulk-action` | users |
| **UserDetails** | `/admin/users/:id` | `useUserDetails`, `useUpdateUser`, `useSuspendUser`, `useBanUser`, `useVerifyUser` | GET `/api/admin/users/:id`, PUT `/api/admin/users/:id`, POST `/api/admin/users/:id/suspend`, POST `/api/admin/users/:id/ban` | users, user_statistics, transactions |
| **PartnersList** | `/admin/partners` | `usePartners`, `useSuspendPartner`, `useBanPartner` | GET `/api/admin/partners`, POST `/api/admin/partners/:id/suspend` | partners, users |
| **PartnerDetails** | `/admin/partners/:id` | `usePartnerDetails`, `useUpdatePartner`, `useProcessPayout` | GET `/api/admin/partners/:id`, PUT `/api/admin/partners/:id`, POST `/api/admin/partners/:id/payout` | partners, partner_commissions, partner_game_earnings |
| **DepositRequests** | `/admin/deposits` | `useDeposits`, `useApproveDeposit`, `useRejectDeposit` | GET `/api/admin/deposits`, POST `/api/payments/admin/deposits/:id/approve`, POST `/api/payments/admin/deposits/:id/reject` | deposits, transactions |
| **WithdrawalRequests** | `/admin/withdrawals` | `useWithdrawals`, `useApproveWithdrawal`, `useRejectWithdrawal` | GET `/api/admin/withdrawals`, POST `/api/payments/admin/withdrawals/:id/approve`, POST `/api/payments/admin/withdrawals/:id/reject` | withdrawals, transactions |
| **GameControl** | `/admin/game-control` | `useCreateRound`, `useStopRound`, `useDeclareWinner`, `useEmergencyStop` | POST `/api/games/:id/rounds`, POST `/api/games/rounds/:id/stop`, POST `/api/games/rounds/:id/winner`, POST `/api/games/:id/emergency-stop` | games, game_rounds |
| **GameHistory** | `/admin/game-history` | `useGameRounds` | GET `/api/admin/games/history` | game_rounds, bets |
| **GameSettings** | `/admin/game-settings` | `useGameSettings`, `useUpdateGameSettings` | GET `/api/admin/games/settings`, PUT `/api/admin/games/settings` | games, system_settings |
| **Analytics** | `/admin/analytics` | `useAnalytics` | GET `/api/admin/analytics` | All tables (aggregated) |
| **PaymentHistory** | `/admin/payments` | `useAnalytics` | GET `/api/admin/analytics` | deposits, withdrawals, transactions |
| **FinancialReports** | `/admin/reports` | `useAnalytics` | GET `/api/admin/analytics` | transactions, bets, deposits, withdrawals |
| **SystemSettings** | `/admin/settings` | `useSystemSettings`, `useUpdateSystemSettings` | GET `/api/admin/settings`, PUT `/api/admin/settings` | system_settings |
| **AdminStreamSettingsPage** | `/admin/stream-settings` | `useStreamSettings` | GET `/api/admin/stream/config`, POST `/api/admin/stream/pause`, POST `/api/admin/stream/resume` | system_settings |
| **AdminBonusesPage** | `/admin/bonuses` | `useUserBonuses` | GET `/api/admin/bonuses` | user_bonuses |
| **AdminTransactionsPage** | `/admin/transactions` | `useTransactions` | GET `/api/admin/transactions` | transactions |
| **AdminGameHistoryPage** | `/admin/game-history` | `useGameHistory` | GET `/api/admin/games/history` | game_history, game_rounds |
| **AdminReportsPage** | `/admin/reports` | `useFinancialReports` | GET `/api/admin/reports` | All tables |
| **AdminDashboardPage** | `/admin/overview` | `useDashboardStats` | GET `/api/admin/dashboard` | users, games, bets |
| **AdminUsersPage** | `/admin/users-list` | `useUsers` | GET `/api/admin/users` | users |
| **AdminUserDetailsPage** | `/admin/user/:id` | `useUserDetails` | GET `/api/admin/users/:id` | users, user_statistics |
| **AdminPartnersPage** | `/admin/partners-list` | `usePartners` | GET `/api/admin/partners` | partners |
| **AdminPartnerDetailsPage** | `/admin/partner/:id` | `usePartnerDetails` | GET `/api/admin/partners/:id` | partners, partner_commissions |
| **AdminDepositsPage** | `/admin/deposits-list` | `useDeposits` | GET `/api/admin/deposits` | deposits |
| **AdminWithdrawalsPage** | `/admin/withdrawals-list` | `useWithdrawals` | GET `/api/admin/withdrawals` | withdrawals |
| **AdminGameControlPage** | `/admin/game-control` | `useGameState` | GET `/api/admin/games/state` | games, game_rounds |
| **AdminAnalyticsPage** | `/admin/analytics-view` | `useAnalytics` | GET `/api/admin/analytics` | All tables |
| **AdminSettingsPage** | `/admin/system-settings` | `useSystemSettings` | GET `/api/admin/settings` | system_settings |

---

## 🔌 API ENDPOINTS MAPPING

### **A. Authentication Endpoints** (5 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| POST | `/api/auth/register` | `authController.register` | users, referrals | `{ user, token }` |
| POST | `/api/auth/login` | `authController.login` | users | `{ user, token }` |
| POST | `/api/auth/logout` | `authController.logout` | - | `{ success }` |
| GET | `/api/auth/me` | `authController.me` | users | `{ user }` |
| POST | `/api/auth/refresh` | `authController.refresh` | users | `{ token }` |

---

### **B. User Endpoints** (7 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/users/profile` | `userController.getProfile` | users | `User` |
| PUT | `/api/users/profile` | `userController.updateProfile` | users | `User` |
| GET | `/api/users/balance` | `userController.getBalance` | users | `{ mainBalance, bonusBalance }` |
| GET | `/api/users/statistics` | `userController.getStatistics` | user_statistics | `UserStatistics` |
| GET | `/api/users/transactions` | `userController.getTransactionHistory` | transactions | `PaginatedResponse<Transaction>` |
| GET | `/api/users/referrals` | `userController.getReferredUsers` | referrals, users | `Referral[]` |
| POST | `/api/users/deactivate` | `userController.deactivateAccount` | users | `{ success }` |

---

### **C. Game Endpoints** (8 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/games/:gameId` | `gameController.getActiveGame` | games | `Game` |
| GET | `/api/games/:gameId/current-round` | `gameController.getCurrentRound` | game_rounds | `GameRound` |
| POST | `/api/games/:gameId/rounds` | `gameController.createNewRound` | game_rounds | `GameRound` |
| POST | `/api/games/rounds/:roundId/start` | `gameController.startRound` | game_rounds | `GameRound` |
| POST | `/api/games/rounds/:roundId/close-betting` | `gameController.closeBetting` | game_rounds | `GameRound` |
| POST | `/api/games/rounds/:roundId/deal` | `gameController.dealCards` | game_rounds, bets | `GameRound` |
| GET | `/api/games/rounds/:roundId/statistics` | `gameController.getRoundStatistics` | bets | `RoundStatistics` |
| GET | `/api/games/:gameId/history` | `gameController.getGameHistory` | game_rounds, bets | `GameHistory[]` |

---

### **D. Bet Endpoints** (3 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| POST | `/api/bets` | `betController.placeBet` | bets, users, game_rounds | `Bet` |
| GET | `/api/bets/:roundId` | `betController.getRoundBets` | bets | `Bet[]` |
| DELETE | `/api/bets/:betId` | `betController.cancelBet` | bets, users | `{ success }` |

---

### **E. Payment Endpoints** (12 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/payments/settings` | `paymentController.getPaymentSettings` | system_settings | `PaymentSettings` |
| POST | `/api/payments/deposit` | `paymentController.createDepositRequest` | deposits | `Deposit` |
| POST | `/api/payments/deposit/:depositId/screenshot` | `paymentController.uploadDepositScreenshot` | deposits | `Deposit` |
| GET | `/api/payments/deposit/history` | `paymentController.getDepositHistory` | deposits | `Deposit[]` |
| POST | `/api/payments/withdrawal` | `paymentController.requestWithdrawal` | withdrawals | `Withdrawal` |
| GET | `/api/payments/withdrawal/history` | `paymentController.getWithdrawalHistory` | withdrawals | `Withdrawal[]` |
| GET | `/api/payments/admin/deposits/pending` | `paymentController.getPendingDeposits` | deposits | `Deposit[]` |
| POST | `/api/payments/admin/deposits/:depositId/approve` | `paymentController.approveDeposit` | deposits, transactions, users | `Deposit` |
| POST | `/api/payments/admin/deposits/:depositId/reject` | `paymentController.rejectDeposit` | deposits | `Deposit` |
| GET | `/api/payments/admin/withdrawals/pending` | `paymentController.getPendingWithdrawals` | withdrawals | `Withdrawal[]` |
| POST | `/api/payments/admin/withdrawals/:withdrawalId/approve` | `paymentController.approveWithdrawal` | withdrawals, transactions, users | `Withdrawal` |
| POST | `/api/payments/admin/withdrawals/:withdrawalId/reject` | `paymentController.rejectWithdrawal` | withdrawals | `Withdrawal` |

---

### **F. Partner Endpoints** (13 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| POST | `/api/partners/register` | `partnerController.register` | users, partners | `{ user, partner, token }` |
| POST | `/api/partners/login` | `partnerController.login` | users, partners | `{ user, token }` |
| GET | `/api/partners/profile` | `partnerController.getProfile` | partners, users | `Partner` |
| PUT | `/api/partners/profile` | `partnerController.updateProfile` | partners | `Partner` |
| GET | `/api/partners/statistics` | `partnerController.getStatistics` | partners, partner_commissions, partner_game_earnings, referrals | `PartnerStatistics` |
| GET | `/api/partners/commissions` | `partnerController.getCommissions` | partner_commissions | `PartnerCommission[]` |
| GET | `/api/partners/referrals` | `partnerController.getReferredPlayers` | referrals, users, user_statistics | `ReferredPlayer[]` |
| POST | `/api/partners/withdraw` | `partnerController.requestWithdrawal` | withdrawals, partners | `Withdrawal` |
| GET | `/api/partners/` | `partnerController.getAllPartners` | partners, users | `Partner[]` |
| POST | `/api/partners/:partnerId/approve` | `partnerController.approvePartner` | partners | `Partner` |
| POST | `/api/partners/:partnerId/deactivate` | `partnerController.deactivatePartner` | partners | `Partner` |
| POST | `/api/partners/commissions/:commissionId/pay` | `partnerController.payCommission` | partner_commissions | `PartnerCommission` |
| GET | `/api/partners/earnings` | `partnerController.getEarnings` | partner_game_earnings | `PartnerEarnings[]` |

---

### **G. Admin Endpoints** (20+ endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/admin/dashboard` | `adminController.getDashboard` | users, games, bets, transactions | `DashboardStats` |
| GET | `/api/admin/users` | `adminController.getUsers` | users | `PaginatedResponse<User>` |
| GET | `/api/admin/users/:id` | `adminController.getUser` | users, user_statistics | `UserDetailsResponse` |
| PUT | `/api/admin/users/:id` | `adminController.updateUser` | users | `User` |
| PUT | `/api/admin/users/:id/status` | `adminController.updateUserStatus` | users | `User` |
| GET | `/api/admin/games` | `adminController.getGames` | games | `Game[]` |
| GET | `/api/admin/games/:id` | `adminController.getGame` | games | `Game` |
| GET | `/api/admin/transactions` | `adminController.getTransactions` | transactions | `Transaction[]` |
| PUT | `/api/admin/transactions/:id` | `adminController.updateTransaction` | transactions | `Transaction` |
| GET | `/api/admin/analytics` | `adminController.getAnalytics` | All tables | `AnalyticsResponse` |
| GET | `/api/admin/settings` | `adminController.getSettings` | system_settings | `SystemSettings` |
| PUT | `/api/admin/settings` | `adminController.updateSettings` | system_settings | `SystemSettings` |
| GET | `/api/admin/stream/config` | `adminController.getStreamConfig` | system_settings | `StreamConfig` |
| POST | `/api/admin/stream/pause` | `adminController.pauseStream` | - | `{ success }` |
| POST | `/api/admin/stream/resume` | `adminController.resumeStream` | - | `{ success }` |
| POST | `/api/admin/stream/loop-mode` | `adminController.toggleLoopMode` | - | `{ success }` |
| GET | `/api/admin/partners` | `adminController.getPartners` | partners, users | `Partner[]` |
| GET | `/api/admin/partners/:id` | `adminController.getPartnerDetails` | partners, partner_commissions, partner_game_earnings | `PartnerDetailsResponse` |

---

### **H. Bonus Endpoints** (4 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/bonuses` | `bonusController.getUserBonuses` | user_bonuses | `Bonus[]` |
| POST | `/api/bonuses/:id/unlock` | `bonusController.unlockBonus` | user_bonuses, users | `Bonus` |
| GET | `/api/bonuses/available` | `bonusController.getAvailableBonuses` | user_bonuses | `Bonus[]` |
| POST | `/api/bonuses/claim/:type` | `bonusController.claimBonus` | user_bonuses | `Bonus` |

---

### **I. Notification Endpoints** (5 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/notifications` | `notificationController.getUserNotifications` | notifications | `Notification[]` |
| PUT | `/api/notifications/:id/read` | `notificationController.markAsRead` | notifications | `Notification` |
| DELETE | `/api/notifications/:id` | `notificationController.deleteNotification` | notifications | `{ success }` |
| POST | `/api/notifications/mark-all-read` | `notificationController.markAllAsRead` | notifications | `{ success }` |
| DELETE | `/api/notifications/clear-all` | `notificationController.clearAll` | notifications | `{ success }` |

---

### **J. Transaction Endpoints** (3 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/transactions` | `transactionController.getUserTransactions` | transactions | `PaginatedResponse<Transaction>` |
| GET | `/api/transactions/:id` | `transactionController.getTransaction` | transactions | `Transaction` |
| GET | `/api/transactions/stats` | `transactionController.getTransactionStats` | transactions | `TransactionStats` |

---

### **K. Analytics Endpoints** (5 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/analytics/dashboard` | `analyticsController.getDashboardAnalytics` | All tables | `AnalyticsResponse` |
| GET | `/api/analytics/game-performance` | `analyticsController.getGamePerformance` | games, game_rounds, bets | `GamePerformance` |
| GET | `/api/analytics/revenue` | `analyticsController.getRevenue` | transactions, deposits, withdrawals | `RevenueStats` |
| GET | `/api/analytics/users` | `analyticsController.getUserAnalytics` | users, user_statistics | `UserAnalytics` |
| GET | `/api/analytics/partners` | `analyticsController.getPartnerAnalytics` | partners, partner_commissions | `PartnerAnalytics` |

---

### **L. Stream Endpoints** (3 endpoints)

| Method | Endpoint | Controller Function | Database Tables | Response Type |
|--------|----------|---------------------|-----------------|---------------|
| GET | `/api/stream/config` | `streamController.getConfig` | system_settings | `StreamConfig` |
| POST | `/api/stream/status` | `streamController.updateStatus` | system_settings | `{ success }` |
| GET | `/api/stream/health` | `streamController.getHealth` | - | `StreamHealth` |

---

## 💾 DATABASE SCHEMA MAPPING

### **Database Tables** (18 tables)

| Table Name | Columns | Primary Key | Foreign Keys | Indexes |
|------------|---------|-------------|--------------|---------|
| **users** | id, username, email, passwordHash, phoneNumber, fullName, balance, bonusBalance, role, status, referralCode, referredBy, profileImage, lastLoginAt, createdAt, updatedAt | id (uuid) | referredBy → users.id | username_idx, email_idx, referralCode_idx |
| **games** | id, name, type, status, streamUrl, thumbnailUrl, minBet, maxBet, description, rules, createdAt, updatedAt | id (uuid) | - | - |
| **game_rounds** | id, gameId, roundNumber, status, jokerCard, winningSide, winningCard, totalAndarBets, totalBaharBets, totalBetAmount, totalPayoutAmount, bettingStartTime, bettingEndTime, startTime, endTime, createdAt | id (uuid) | gameId → games.id | gameId_idx, status_idx |
| **bets** | id, userId, roundId, gameId, betSide, amount, potentialWin, status, payoutAmount, isBonus, createdAt | id (uuid) | userId → users.id, roundId → game_rounds.id, gameId → games.id | userId_idx, roundId_idx, status_idx |
| **transactions** | id, userId, type, amount, balanceBefore, balanceAfter, status, referenceId, referenceType, description, metadata, createdAt | id (uuid) | userId → users.id | userId_idx, type_idx, createdAt_idx |
| **partners** | id, userId, partnerCode, sharePercentage, commissionRate, totalPlayers, totalCommission, pendingCommission, status, createdAt, updatedAt | id (uuid) | userId → users.id | partnerCode_idx |
| **partner_commissions** | id, partnerId, betId, userId, amount, status, paidAt, createdAt | id (uuid) | partnerId → partners.id, betId → bets.id, userId → users.id | partnerId_idx |
| **partner_game_earnings** | id, partnerId, gameId, roundId, realProfit, realTotalBets, realTotalPayouts, shownProfit, shownTotalBets, shownTotalPayouts, sharePercentage, commissionRate, earnedAmount, playerCount, status, paidAt, createdAt | id (uuid) | partnerId → partners.id, gameId → games.id, roundId → game_rounds.id | partnerId_idx, roundId_idx, status_idx |
| **referrals** | id, referrerId, referredId, referralCode, bonusEarned, status, completedAt, createdAt | id (uuid) | referrerId → users.id, referredId → users.id | referrerId_idx |
| **user_bonuses** | id, userId, bonusType, amount, wageringRequirement, wageringProgress, status, expiresAt, completedAt, createdAt | id (uuid) | userId → users.id | userId_idx, status_idx |
| **deposits** | id, userId, amount, paymentMethod, transactionId, screenshotUrl, status, approvedBy, approvedAt, rejectionReason, createdAt | id (uuid) | userId → users.id, approvedBy → users.id | userId_idx, status_idx |
| **withdrawals** | id, userId, amount, withdrawalMethod, bankName, accountNumber, ifscCode, upiId, status, processedBy, processedAt, transactionId, rejectionReason, createdAt | id (uuid) | userId → users.id, processedBy → users.id | userId_idx, status_idx |
| **game_statistics** | id, gameId, date, totalRounds, totalBets, totalBetAmount, totalPayoutAmount, totalPlayers, revenue, createdAt | id (uuid) | gameId → games.id | gameId_date_idx |
| **user_statistics** | id, userId, totalBets, totalWins, totalLosses, totalBetAmount, totalWinAmount, biggestWin, currentStreak, longestStreak, lastBetAt, createdAt, updatedAt | id (uuid) | userId → users.id | userId_idx |
| **game_history** | id, userId, gameId, roundId, betId, roundNumber, betSide, betAmount, result, payoutAmount, jokerCard, winningCard, createdAt | id (uuid) | userId → users.id, gameId → games.id, roundId → game_rounds.id, betId → bets.id | userId_idx, createdAt_idx |
| **system_settings** | id, key, value, description, updatedBy, updatedAt | id (uuid) | updatedBy → users.id | - |
| **notifications** | id, userId, title, message, type, isRead, metadata, createdAt | id (uuid) | userId → users.id | userId_idx |
| **support_tickets** | id, userId, subject, message, status, response, respondedBy, respondedAt, createdAt | id (uuid) | userId → users.id, respondedBy → users.id | userId_idx |

---

## 🎣 REACT HOOKS & FUNCTIONS

### **A. Query Hooks** (51 hooks)

| Hook Name | API Endpoint | Purpose |
|-----------|--------------|---------|
| `useAdminDashboard` | GET `/api/admin/dashboard` | Get admin dashboard stats |
| `useAnalytics` | GET `/api/admin/analytics` | Get analytics data |
| `useDashboardStats` | GET `/api/admin/dashboard` | Get dashboard statistics |
| `useDeposits` | GET `/api/admin/deposits` | Get deposit requests |
| `useGameRounds` | GET `/api/games/rounds` | Get game rounds |
| `usePartnerDetails` | GET `/api/admin/partners/:id` | Get partner details |
| `usePartners` | GET `/api/admin/partners` | Get all partners |
| `useUserDetails` | GET `/api/admin/users/:id` | Get user details |
| `useUsers` | GET `/api/admin/users` | Get all users |
| `useWithdrawals` | GET `/api/admin/withdrawals` | Get withdrawal requests |
| `useUserBonuses` | GET `/api/bonuses` | Get user bonuses |
| `useCurrentGame` | GET `/api/games/:gameId` | Get current active game |
| `useCurrentRound` | GET `/api/games/:gameId/current-round` | Get current round |
| `useGameHistory` | GET `/api/games/:gameId/history` | Get game history |
| `useGameStatistics` | GET `/api/games/:gameId/statistics` | Get game statistics |
| `useLivePlayerCount` | WebSocket | Get live player count |
| `useUserGameHistory` | GET `/api/users/game-history` | Get user game history |
| `useUserNotifications` | GET `/api/notifications` | Get user notifications |
| `usePartnerCommissions` | GET `/api/partners/commissions` | Get partner commissions |
| `usePartnerEarnings` | GET `/api/partners/earnings` | Get partner earnings |
| `usePartnerPlayers` | GET `/api/partners/referrals` | Get partner's referred players |
| `usePartnerStatistics` | GET `/api/partners/statistics` | Get partner statistics |
| `useUserReferrals` | GET `/api/users/referrals` | Get user referrals |
| `useBalance` | GET `/api/users/balance` | Get user balance |
| `useProfile` | GET `/api/users/profile` | Get user profile |
| `useTransactionHistory` | GET `/api/users/transactions` | Get transaction history |
| `useFinancialReports` | GET `/api/admin/reports` | Get financial reports |
| `useSystemSettings` | GET `/api/admin/settings` | Get system settings |
| `usePaymentSettings` | GET `/api/payments/settings` | Get payment settings |

---

### **B. Mutation Hooks** (47 hooks)

| Hook Name | API Endpoint | Purpose |
|-----------|--------------|---------|
| `useApproveDeposit` | POST `/api/payments/admin/deposits/:id/approve` | Approve deposit request |
| `useApproveWithdrawal` | POST `/api/payments/admin/withdrawals/:id/approve` | Approve withdrawal request |
| `useBanPartner` | POST `/api/admin/partners/:id/ban` | Ban a partner |
| `useBanUser` | POST `/api/admin/users/:id/ban` | Ban a user |
| `useBulkUserAction` | POST `/api/admin/users/bulk-action` | Perform bulk user actions |
| `useCreateRound` | POST `/api/games/:gameId/rounds` | Create new game round |
| `useDeclareWinner` | POST `/api/games/rounds/:roundId/winner` | Declare round winner |
| `useDeleteUser` | DELETE `/api/admin/users/:id` | Delete user |
| `useEmergencyStop` | POST `/api/games/:gameId/emergency-stop` | Emergency stop game |
| `useProcessPayout` | POST `/api/admin/partners/:id/payout` | Process partner payout |
| `useRejectDeposit` | POST `/api/payments/admin/deposits/:id/reject` | Reject deposit request |
| `useRejectWithdrawal` | POST `/api/payments/admin/withdrawals/:id/reject` | Reject withdrawal request |
| `useStopRound` | POST `/api/games/rounds/:roundId/stop` | Stop game round |
| `useSuspendPartner` | POST `/api/admin/partners/:id/suspend` | Suspend partner |
| `useSuspendUser` | POST `/api/admin/users/:id/suspend` | Suspend user |
| `useUpdateGameSettings` | PUT `/api/admin/games/settings` | Update game settings |
| `useUpdatePartner` | PUT `/api/admin/partners/:id` | Update partner details |
| `useUpdateSystemSettings` | PUT `/api/admin/settings` | Update system settings |
| `useUpdateUser` | PUT `/api/admin/users/:id` | Update user details |
| `useVerifyUser` | POST `/api/admin/users/:id/verify` | Verify user account |
| `useForgotPassword` | POST `/api/auth/forgot-password` | Request password reset |
| `useLogin` | POST `/api/auth/login` | User login |
| `useLogout` | POST `/api/auth/logout` | User logout |
| `usePartnerLogin` | POST `/api/partners/login` | Partner login |
| `usePartnerRegister` | POST `/api/partners/register` | Partner registration |
| `usePartnerSignup` | POST `/api/partners/register` | Partner signup |
| `useSignup` | POST `/api/auth/register` | User signup |
| `useUnlockBonus` | POST `/api/bonuses/:id/unlock` | Unlock bonus |
| `useCancelBet` | DELETE `/api/bets/:id` | Cancel bet |
| `usePlaceBet` | POST `/api/bets` | Place bet |
| `useDeleteNotification` | DELETE `/api/notifications/:id` | Delete notification |
| `useMarkNotificationRead` | PUT `/api/notifications/:id/read` | Mark notification as read |
| `useCancelPayoutRequest` | DELETE `/api/partners/payouts/:id` | Cancel payout request |
| `useCreatePayoutRequest` | POST `/api/partners/withdraw` | Create payout request |
| `useUpdatePartnerPassword` | POST `/api/partners/password` | Update partner password |
| `useUpdatePartnerPreferences` | PUT `/api/partners/preferences` | Update partner preferences |
| `useUpdatePartnerProfile` | PUT `/api/partners/profile` | Update partner profile |
| `useCreateDeposit` | POST `/api/payments/deposit` | Create deposit request |
| `useCreateWithdrawal` | POST `/api/payments/withdrawal` | Create withdrawal request |
| `useRequestDeposit` | POST `/api/payments/deposit` | Request deposit |
| `useRequestWithdrawal` | POST `/api/payments/withdrawal` | Request withdrawal |
| `useSubmitSupportTicket` | POST `/api/support/ticket` | Submit support ticket |
| `useChangePassword` | POST `/api/users/password` | Change user password |
| `useUpdateNotificationSettings` | PUT `/api/users/settings` | Update notification settings |
| `useUpdateProfile` | PUT `/api/users/profile` | Update user profile |
| `useUploadVerificationDocument` | POST `/api/users/documents` | Upload verification document |

---

## 🎮 BACKEND CONTROLLERS & SERVICES

### **Controllers** (11 controllers)

| Controller | Functions | Purpose |
|------------|-----------|---------|
| **AdminController** | `getDashboard`, `getUsers`, `getUser`, `updateUser`, `updateUserStatus`, `getGames`, `getTransactions`, `getAnalytics`, `getSettings`, `updateSettings` | Admin operations |
| **AuthController** | `register`, `login`, `logout`, `me`, `refresh` | Authentication |
| **UserController** | `getProfile`, `updateProfile`, `getBalance`, `getStatistics`, `getTransactionHistory`, `getReferredUsers`, `deactivateAccount` | User management |
| **GameController** | `getActiveGame`, `getCurrentRound`, `createNewRound`, `startRound`, `closeBetting`, `dealCards`, `getRoundStatistics`, `getGameHistory` | Game operations |
| **BetController** | `placeBet`, `getRoundBets`, `cancelBet` | Betting operations |
| **PaymentController** | `getPaymentSettings`, `createDepositRequest`, `uploadDepositScreenshot`, `getDepositHistory`, `requestWithdrawal`, `getWithdrawalHistory`, `approveDeposit`, `rejectDeposit`, `approveWithdrawal`, `rejectWithdrawal` | Payment processing |
| **PartnerController** | `register`, `login`, `getProfile`, `updateProfile`, `getStatistics`, `getCommissions`, `getReferredPlayers`, `requestWithdrawal`, `getAllPartners`, `approvePartner`, `deactivatePartner`, `payCommission` | Partner management |
| **BonusController** | `getUserBonuses`, `unlockBonus`, `getAvailableBonuses`, `claimBonus` | Bonus management |
| **NotificationController** | `getUserNotifications`, `markAsRead`, `deleteNotification`, `markAllAsRead`, `clearAll` | Notification management |
| **TransactionController** | `getUserTransactions`, `getTransaction`, `getTransactionStats` | Transaction operations |
| **AnalyticsController** | `getDashboardAnalytics`, `getGamePerformance`, `getRevenue`, `getUserAnalytics`, `getPartnerAnalytics` | Analytics & reports |

---

### **Services** (11 services)

| Service | Functions | Purpose |
|---------|-----------|---------|
| **AdminService** | Data aggregation, user management, system monitoring | Admin backend logic |
| **AnalyticsService** | Data analysis, report generation, statistics calculation | Analytics processing |
| **AuthService** | Token generation, password hashing, session management | Authentication logic |
| **BetService** | Bet validation, payout calculation, bet processing | Betting logic |
| **BonusService** | Bonus allocation, wagering tracking, bonus unlocking | Bonus management |
| **GameService** | Round management, card dealing, winner declaration | Game logic |
| **NotificationService** | Notification creation, push notifications, email alerts | Notification system |
| **PartnerService** | Commission calculation, earnings tracking, payout processing | Partner operations |
| **PaymentService** | Payment verification, transaction processing, balance updates | Payment processing |
| **RedisService** | Caching, session storage, real-time data | Cache management |
| **TransactionService** | Transaction logging, balance tracking, history management | Transaction handling |
| **UserService** | Profile management, statistics tracking, account operations | User operations |
| **WhatsAppService** | WhatsApp notifications, message sending | WhatsApp integration |
| **SettingsService** | System settings management, configuration updates | Settings management |
| **StreamService** | Stream configuration, status management | Stream control |

---

## 📡 WEBSOCKET EVENTS

### **Client → Server Events**

| Event | Data | Purpose |
|-------|------|---------|
| `join_game` | `{ gameId, userId }` | Join game room |
| `leave_game` | `{ gameId, userId }` | Leave game room |
| `place_bet` | `{ roundId, side, amount }` | Place bet during round |
| `heartbeat` | `{ userId }` | Keep connection alive |

---

### **Server → Client Events**

| Event | Data | Purpose |
|-------|------|---------|
| `round_update` | `{ round: GameRound }` | Round status changed |
| `bet_placed` | `{ bet, totalAndarBets, totalBaharBets }` | New bet placed |
| `balance_update` | `{ userId, mainBalance, bonusBalance }` | User balance changed |
| `winner_announce` | `{ roundId, winningSide, winningCard, totalPayout }` | Round completed |
| `betting_closed` | `{ roundId }` | Betting period ended |
| `dealing_started` | `{ roundId, jokerCard }` | Card dealing started |
| `card_dealt` | `{ roundId, card, position }` | New card dealt |
| `player_count` | `{ count }` | Active player count |
| `stream:paused` | `{ reason, duration }` | Stream paused |
| `stream:resumed` | `{ }` | Stream resumed |
| `stream:loop-mode` | `{ enabled, message }` | Loop mode toggled |

---

## ⚠️ TYPE MISMATCHES & ISSUES

### **Critical Type Issues** (320+ errors)

| Category | Count | Description | Fix Required |
|----------|-------|-------------|--------------|
| **Missing Properties in Response Types** | 180 | Backend returns snake_case, types define camelCase | Update type definitions or add transform layer |
| **Wrong Function Signatures** | 35 | Functions called with objects but expect primitives | Update API function signatures |
| **Missing React Hooks** | 5 | `useParams`, `useNavigate` not imported | Add imports |
| **Enum Mismatches** | 8 | Filter enums missing "all" option | Update enum definitions |
| **Unused Variables** | 25 | Declared but never used | Clean up or remove |
| **Missing Icon Imports** | 5 | Icons used but not imported | Add imports |
| **Property Naming Issues** | 50+ | `created_at` vs `createdAt`, `full_name` vs `fullName` | Standardize naming |

---

### **Specific Type Mismatches**

#### **1. User Types**
- **Frontend expects:** `fullName`, `createdAt`, `isVerified`
- **Backend returns:** `full_name`, `created_at`, `is_verified`

#### **2. Partner Types**
- **Frontend expects:** `PartnerStatisticsResponse` with 30+ properties
- **Backend returns:** Different structure with snake_case

#### **3. Admin Analytics**
- **Frontend expects:** `AnalyticsResponse` with `payments`, `total`, `stats`
- **Backend returns:** Different aggregated structure

#### **4. Withdrawal/Deposit Status**
- **Frontend uses:** `"all"`, `"pending"`, `"processing"`, `"completed"`, `"rejected"`
- **Backend allows:** `"pending"`, `"approved"`, `"rejected"`

---

## 🔗 DATABASE CONNECTIONS SUMMARY

### **Connection Flow:**

```
Frontend (React/TypeScript)
    ↓ HTTP/WebSocket
API Layer (Express.js)
    ↓ Controllers
Service Layer (Business Logic)
    ↓ Drizzle ORM
Database (PostgreSQL)
    ↓ Redis Cache
Cache Layer (Optional)
```

### **Critical Dependencies:**

1. **Frontend ↔ Backend:** REST API + WebSocket
2. **Backend ↔ Database:** Drizzle ORM
3. **Backend ↔ Cache:** Redis
4. **WebSocket ↔ Game Logic:** Socket.IO
5. **Auth ↔ All Routes:** JWT Middleware

---

## 📋 SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| **Total Pages** | 58 |
| **API Endpoints** | 88 |
| **Database Tables** | 18 |
| **React Hooks** | 98 |
| **Controllers** | 11 |
| **Services** | 15 |
| **WebSocket Events** | 15 |
| **Type Errors** | 320+ |

---

## ✅ RECOMMENDATIONS

### **Immediate Actions:**

1. **Fix Type Definitions:**
   - Align frontend types with backend responses
   - Standardize on camelCase or add transform layer

2. **Update API Functions:**
   - Fix function signatures to match usage
   - Add proper TypeScript types

3. **Add Missing Imports:**
   - Import React Router hooks where needed
   - Import missing icons

4. **Standardize Enums:**
   - Update filter enums to include all valid values
   - Align status enums across frontend and backend

5. **Database Consistency:**
   - Ensure all foreign keys are properly set
   - Add missing indexes for performance

6. **WebSocket Stability:**
   - Add reconnection logic
   - Implement heartbeat mechanism

---

**Document End** | Generated for Raju Gari Kossu Project
