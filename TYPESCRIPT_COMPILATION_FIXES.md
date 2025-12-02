# TypeScript Compilation Fixes Required

## Summary
200+ TypeScript errors due to mismatched property names between code and database schema.

## Files to Fix

### 1. backend/src/services/game.service.ts
**Issues:**
- Line 50: `eq(games.isActive, true)` → Should be `eq(games.status, 'active')`
- Line 58: `eq(games.isActive, true)` → Should be `eq(games.status, 'active')`
- Line 107: `bettingEndsAt` → Property doesn't exist in schema
- Line 106: `totalBets` → Property doesn't exist in schema  
- Line 132: `status: 'in_progress'` → Should be `status: 'playing'`
- Line 195: `cardsDealt` → Property doesn't exist in schema
- Line 196: `endedAt` → Should be `endTime`
- Line 262: `bet.payout` → Should be `bet.payoutAmount`
- Line 271: `round.cardsDealt` → Property doesn't exist
- Line 276: `playedAt` → Should use `createdAt`
- Line 301: `bet.payout` → Should be `bet.payoutAmount`
- Line 314-315: `periodStart`, `periodEnd` → Don't exist, should use `date`
- Line 327: `totalWagered` → Should be `totalBetAmount`
- Line 329: `averageBetSize` → Property doesn't exist
- Line 344: `totalWagered` → Should be `totalBetAmount`
- Line 345: `averageBetSize` → Property doesn't exist
- Line 366: `periodStart` → Should be `date`

### 2. backend/src/services/user.service.ts
**Issues:**
- Line 37: `totalWinnings` → Should be `totalWinAmount`
- Line 190: `isActive` → Should be `status`
- Line 208: `isActive` → Should be `status`  
- Line 224: `isActive` → Should be `status`

### 3. backend/src/services/payment.service.ts
**Issues:**
- Line 52-57: Multiple property mismatches in deposits table
  - `paymentScreenshot` → Should be `screenshotUrl`
  - `paymentGatewayOrderId` → Should be `transactionId`
  - `metadata` → Property doesn't exist
- Line 92: `paymentScreenshot` → Should be `screenshotUrl`
- Line 107: `deposits.createdAt` → Need to use desc()
- Line 143: `processedBy` → Should be `approvedBy`
- Line 144: `completedAt` → Should be `approvedAt`
- Line 182: `processedBy` → Should be `approvedBy`
- Line 184-186: `metadata` → Property doesn't exist
- Line 256-259: `wageringCompleted`, `metadata` → Don't exist
- Line 640: `processedAt` → Don't exist on deposits
- Line 644: `paymentGatewayPaymentId` → Should be `transactionId`
- Line 721: `processedAt` → Should use `approvedAt`
- Line 723-726: `metadata` → Property doesn't exist

### 4. backend/src/services/notification.service.ts
**Issues:**
- Query builder type mismatches in where clauses

### 5. backend/src/websocket/game-flow.ts
**Issues:**
- Multiple `possibly undefined` errors on bet and round objects

## Schema Reference

### games table
- id, name, type, status, streamUrl, thumbnailUrl, minBet, maxBet, description, rules, createdAt, updatedAt

### gameRounds table  
- id, gameId, roundNumber, status, jokerCard, winningSide, winningCard
- totalAndarBets, totalBaharBets, totalBetAmount, totalPayoutAmount
- bettingStartTime, bettingEndTime, startTime, endTime, createdAt

### bets table
- id, userId, roundId, gameId, betSide, amount, potentialWin, status, payoutAmount, isBonus, createdAt

### deposits table
- id, userId, amount, paymentMethod, transactionId, screenshotUrl, status
- approvedBy, approvedAt, rejectionReason, createdAt

### withdrawals table
- id, userId, amount, withdrawalMethod, bankName, accountNumber, ifscCode, upiId
- status, processedBy, processedAt, transactionId, rejectionReason, createdAt

### users table
- id, username, email, passwordHash, phoneNumber, fullName
- balance, bonusBalance, role, status, referralCode, referredBy
- profileImage, lastLoginAt, createdAt, updatedAt

### userStatistics table
- id, userId, totalBets, totalWins, totalLosses
- totalBetAmount, totalWinAmount, biggestWin
- currentStreak, longestStreak, lastBetAt, createdAt, updatedAt

### gameStatistics table
- id, gameId, date, totalRounds, totalBets
- totalBetAmount, totalPayoutAmount, totalPlayers, revenue, createdAt

### userBonuses table
- id, userId, bonusType, amount, wageringRequirement, wageringProgress
- status, expiresAt, completedAt, createdAt

## Status Enums
- roundStatusEnum: 'betting' | 'playing' | 'completed' | 'cancelled'
- transactionStatusEnum: 'pending' | 'completed' | 'failed' | 'cancelled'
- userStatusEnum: 'active' | 'suspended' | 'banned'
- gameStatusEnum: 'active' | 'inactive' | 'maintenance'