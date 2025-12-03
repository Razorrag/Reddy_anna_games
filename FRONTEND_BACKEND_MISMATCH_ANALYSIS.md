# 🔴 Critical Frontend-Backend Field Name Mismatches

## Executive Summary

After deep analysis, I've discovered **multiple critical field name mismatches** between frontend, backend, and database that will cause the application to fail.

---

## 1. User Object Mismatch

### Frontend Expects (`frontend/src/types/index.ts:9-22`)
```typescript
interface User {
  id: string;
  phone: string;           // ❌ Backend returns: username/phoneNumber
  name: string;            // ❌ Backend returns: fullName
  email: string | null;    // ✅ Matches
  role: 'player' | 'admin' | 'partner';  // ✅ Matches
  mainBalance: number;     // ❌ Backend returns: balance
  bonusBalance: number;    // ✅ Matches
  referralCode: string;    // ✅ Matches
  referredBy: string | null;  // ✅ Matches
  isActive: boolean;       // ❌ Backend returns: status (enum)
  createdAt: string;       // ✅ Matches
  updatedAt: string;       // ✅ Matches
}
```

### Backend Returns (`backend/src/services/auth.service.ts:230-242`)
```typescript
{
  id: user.id,
  username: user.username,      // ⚠️  Frontend expects: phone
  email: user.email,
  phoneNumber: user.phoneNumber,  // ⚠️  Frontend expects: phone
  fullName: user.fullName,      // ⚠️  Frontend expects: name
  role: user.role,
  referralCode: user.referralCode,
  balance: user.balance,        // ⚠️  Frontend expects: mainBalance
  bonusBalance: user.bonusBalance,
}
```

### Database Schema (`backend/src/db/schema.ts:17-38`)
```sql
username VARCHAR(50)        -- Contains phone number
email VARCHAR(255)
phone_number VARCHAR(20)    -- Also contains phone (redundant)
full_name VARCHAR(100)      -- User's actual name
balance DECIMAL(12, 2)      -- Main balance
bonus_balance DECIMAL(12, 2)
role user_role
status user_status          -- 'active', 'suspended', 'banned'
referral_code VARCHAR(20)
referred_by UUID
```

---

## 2. Balance Update Mismatch

### Frontend Store (`frontend/src/store/authStore.ts:69-79`)
```typescript
updateBalance: (mainBalance, bonusBalance) => {
  set({ 
    user: { 
      ...user, 
      mainBalance,      // ❌ Expects mainBalance
      bonusBalance 
    } 
  });
}
```

### WebSocket Events (`backend/src/websocket/game-flow.ts:354`)
```typescript
notifyBalanceUpdate(io, userId, {
  balance,           // ❌ Sends balance, not mainBalance
  bonusBalance
});
```

---

## 3. Complete Field Mapping

| Frontend Field | Backend Field | Database Column | Status |
|----------------|---------------|-----------------|--------|
| `id` | `id` | `id` | ✅ Match |
| `phone` | `username` / `phoneNumber` | `username` / `phone_number` | ❌ Mismatch |
| `name` | `fullName` | `full_name` | ❌ Mismatch |
| `email` | `email` | `email` | ✅ Match |
| `role` | `role` | `role` | ✅ Match |
| `mainBalance` | `balance` | `balance` | ❌ Mismatch |
| `bonusBalance` | `bonusBalance` | `bonus_balance` | ✅ Match |
| `referralCode` | `referralCode` | `referral_code` | ✅ Match |
| `referredBy` | `referredBy` | `referred_by` | ✅ Match |
| `isActive` | `status` | `status` | ❌ Different Type |
| `createdAt` | `createdAt` | `created_at` | ✅ Match |
| `updatedAt` | `updatedAt` | `updated_at` | ✅ Match |

---

## 4. Impact Analysis

### Authentication Flow
**Current Behavior:**
1. User signs up/logs in
2. Backend returns `{ username, fullName, balance, ... }`
3. Frontend expects `{ phone, name, mainBalance, ... }`
4. Frontend stores undefined values
5. **UI displays `undefined` or crashes**

### Balance Updates
**Current Behavior:**
1. User places bet or wins
2. Backend emits `{ balance, bonusBalance }`
3. Frontend expects `{ mainBalance, bonusBalance }`
4. Frontend's `updateBalance()` sets `user.mainBalance` to undefined
5. **Balance never updates in UI**

### User Profile
**Current Behavior:**
1. User views profile
2. Frontend reads `user.phone` and `user.name`
3. Values are undefined
4. **Profile shows empty fields**

---

## 5. Solution Strategy

### Option A: Fix Backend to Match Frontend (Recommended)

**Pros:**
- Frontend is already built and working
- Consistent naming convention (camelCase)
- Less files to change

**Cons:**
- Need to map database snake_case to camelCase
- Need to rename balance → mainBalance

**Implementation:**
1. Update auth service user response
2. Update WebSocket balance events
3. Add mapping layer in all user queries
4. No database changes needed

### Option B: Fix Frontend to Match Backend

**Pros:**
- Matches database schema
- Less backend changes

**Cons:**
- Need to update many frontend files
- Inconsistent naming (balance vs mainBalance)
- More refactoring needed

---

## 6. Required Backend Changes (Option A)

### File 1: `backend/src/services/auth.service.ts`

**Current response:**
```typescript
return {
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    fullName: user.fullName,
    role: user.role,
    referralCode: user.referralCode,
    balance: user.balance,
    bonusBalance: user.bonusBalance,
  },
  token,
};
```

**Fixed response:**
```typescript
return {
  user: {
    id: user.id,
    phone: user.phoneNumber || user.username,  // Map to phone
    name: user.fullName || user.username,      // Map to name
    email: user.email,
    role: user.role,
    mainBalance: parseFloat(user.balance),     // Map to mainBalance
    bonusBalance: parseFloat(user.bonusBalance),
    referralCode: user.referralCode,
    referredBy: user.referredBy,
    isActive: user.status === 'active',        // Map status to boolean
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  },
  token,
};
```

### File 2: `backend/src/websocket/game-flow.ts`

**Current emission:**
```typescript
io.to(`user:${userId}`).emit('user:balance_updated', {
  balance,
  bonusBalance
});
```

**Fixed emission:**
```typescript
io.to(`user:${userId}`).emit('user:balance_updated', {
  mainBalance: balance,    // Rename balance → mainBalance
  bonusBalance
});
```

### File 3: `backend/src/services/user.service.ts`

**Current response:**
```typescript
return {
  balance: parseFloat(user.balance),
  bonusBalance: parseFloat(user.bonusBalance),
};
```

**Fixed response:**
```typescript
return {
  mainBalance: parseFloat(user.balance),    // Rename
  bonusBalance: parseFloat(user.bonusBalance),
};
```

### File 4: All API endpoints returning user objects

Need to add mapping layer for:
- `/api/users/me` - GET current user
- `/api/users/:id` - GET user by ID
- `/api/admin/users` - GET all users
- Any other user queries

---

## 7. Response Format Standards

### Auth Responses
```typescript
// Signup/Login/Me
{
  "message": "Success",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+1234567890",
      "name": "John Doe",
      "email": "1234567890@reddyanna.local",
      "role": "player",
      "mainBalance": 100.00,
      "bonusBalance": 50.00,
      "referralCode": "ABC12345",
      "referredBy": null,
      "isActive": true,
      "createdAt": "2025-12-03T00:00:00Z",
      "updatedAt": "2025-12-03T00:00:00Z"
    },
    "token": "eyJ..."
  }
}
```

### Balance Update Events
```typescript
// WebSocket: user:balance_updated
{
  "mainBalance": 150.00,
  "bonusBalance": 50.00
}
```

### Transaction Responses
```typescript
{
  "id": "uuid",
  "userId": "uuid",
  "type": "bet",
  "amount": 10.00,
  "balanceBefore": 100.00,
  "balanceAfter": 90.00,
  "createdAt": "2025-12-03T00:00:00Z"
}
```

---

## 8. Testing Checklist

After implementing fixes, test:

- [ ] Signup creates user with correct field names
- [ ] Login returns user with phone, name, mainBalance
- [ ] Profile page displays phone and name correctly
- [ ] Balance displays correctly on dashboard
- [ ] Betting updates mainBalance via WebSocket
- [ ] Winning updates mainBalance correctly
- [ ] Deposit updates mainBalance
- [ ] Withdrawal reduces mainBalance
- [ ] Bonus balance displays and updates
- [ ] Admin panel shows users with correct fields
- [ ] Referral system uses correct phone field
- [ ] All API responses match frontend types

---

## 9. Priority Fixes

### Critical (Breaks Authentication):
1. ✅ Auth service user response mapping
2. ✅ Login/signup field mapping
3. ❌ balance → mainBalance in responses
4. ❌ username → phone in responses
5. ❌ fullName → name in responses

### High (Breaks Features):
6. ❌ WebSocket balance updates
7. ❌ User service balance queries
8. ❌ Transaction balance fields
9. ❌ Admin user queries

### Medium (UX Issues):
10. ❌ Profile page data
11. ❌ Leaderboard displays
12. ❌ Referral displays

---

## 10. Estimated Impact

**Without fixes:**
- 🔴 Authentication appears to work but stores undefined values
- 🔴 Balance never updates in UI
- 🔴 Profile shows empty fields
- 🔴 Game winnings don't reflect in balance
- 🔴 Deposits/withdrawals show incorrect amounts
- 🔴 WebSocket events fail silently

**With fixes:**
- ✅ Complete authentication flow
- ✅ Real-time balance updates
- ✅ Accurate user profiles
- ✅ Correct game winnings
- ✅ Proper transaction tracking
- ✅ Working WebSocket communication

---

## Conclusion

The system has **5 critical field name mismatches** that must be fixed for the application to function:

1. **balance → mainBalance** (most critical - affects all features)
2. **username → phone** (breaks user identification)
3. **fullName → name** (breaks user display)
4. **status → isActive** (breaks user status checks)
5. **phoneNumber vs phone** (inconsistent naming)

**Recommended Approach:** Fix backend to match frontend (Option A)
**Estimated Time:** 2-3 hours to fix all mappings
**Risk Level:** Medium (requires careful testing of all user flows)

---

Generated: 2025-12-03
Status: 🔴 CRITICAL - Must Fix Before Production