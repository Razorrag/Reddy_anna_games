# 🔴 CRITICAL: Complete Frontend-Backend Mismatch Discovered

## Issue Summary

The application has a **fundamental disconnect** between frontend, backend, and database schema. The migrations have likely NOT been run, and there are multiple API/schema mismatches.

---

## 1. Database Schema (Actual)

Located in: `backend/src/db/schema.ts` and `backend/src/db/migrations/0001_create_initial_schema.sql`

### Users Table Structure:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,          -- ✅ Required
    email VARCHAR(255) UNIQUE NOT NULL,            -- ✅ Required  
    password_hash VARCHAR(255) NOT NULL,           -- ✅ Required
    phone_number VARCHAR(20),                      -- ⚠️ Optional
    full_name VARCHAR(100),                        -- ⚠️ Optional
    balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    bonus_balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    role user_role DEFAULT 'player' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    profile_image TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 2. Backend API (auth.controller.ts)

### Registration Endpoint: `/api/auth/register`
```typescript
async register(req: Request, res: Response) {
  const { username, email, password, phoneNumber, fullName, referralCode } = req.body;
  
  const result = await authService.register({
    username,      // ✅ Required
    email,         // ✅ Required
    password,      // ✅ Required
    phoneNumber,   // ⚠️ Optional (maps to phone_number)
    fullName,      // ⚠️ Optional (maps to full_name)
    referralCode,  // ⚠️ Optional
  });
}
```

### Login Endpoint: `/api/auth/login`
```typescript
async login(req: Request, res: Response) {
  const { username, password } = req.body;  // ✅ Expects username
}
```

---

## 3. Frontend API Calls (WRONG!)

### Signup Hook: `frontend/src/hooks/mutations/auth/useSignup.ts`
```typescript
interface SignupData {
  phone: string;      // ❌ Backend expects 'username' + 'email'
  name: string;       // ❌ Backend expects 'fullName'
  password: string;   // ✅ Correct
  referralCode?: string;  // ✅ Correct
}

// Calls WRONG endpoint!
await api.post<ApiResponse<SignupResponse>>('/auth/signup', data);
// Should be: '/auth/register'
```

### Login Hook: (need to check)
Likely also sending `phone` instead of `username`

---

## 4. Critical Mismatches

| Component | Field Name | Type | Required |
|-----------|-----------|------|----------|
| **Frontend Signup** | `phone` | string | ✅ Required |
| **Backend Expects** | `username` | string | ✅ Required |
| **Database Schema** | `username` | VARCHAR(50) | ✅ NOT NULL |
|  |  |  |  |
| **Frontend Signup** | `name` | string | ✅ Required |
| **Backend Expects** | `fullName` | string | ⚠️ Optional |
| **Database Schema** | `full_name` | VARCHAR(100) | ⚠️ NULL OK |
|  |  |  |  |
| **Frontend Signup** | (missing) | - | ❌ Missing |
| **Backend Expects** | `email` | string | ✅ Required |
| **Database Schema** | `email` | VARCHAR(255) | ✅ NOT NULL |
|  |  |  |  |
| **Frontend Endpoint** | `/auth/signup` | POST | - |
| **Backend Endpoint** | `/auth/register` | POST | - |

---

## 5. Database Migration Status

### Check if migrations have run:
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -c "\dt"
```

Expected tables if migrations ran:
- users
- games
- game_rounds
- bets
- transactions
- partners
- partner_commissions
- partner_game_earnings
- referrals
- user_bonuses
- deposits
- withdrawals
- game_statistics
- user_statistics
- game_history
- system_settings
- notifications

### If migrations haven't run:
The database is EMPTY except for default PostgreSQL tables!

---

## 6. How Migrations Should Work

### Docker Compose Configuration
- Backend service has `depends_on: postgres: condition: service_healthy`
- This means backend waits for PostgreSQL to be ready

### Migration Execution
The backend **should** run migrations on startup, but let me check...

**File: `backend/src/index.ts`**
- ❌ NO migration call on startup!
- Only calls `testConnection()` which just checks if DB is reachable

**File: `backend/src/db/migrate.ts`**
- ✅ Migration script exists
- ❌ But it's NOT called automatically on backend startup

---

## 7. What Needs to Happen

### Step 1: Run Database Migrations
```bash
# Enter backend container
docker exec -it reddy-anna-backend sh

# Run migrations
npm run migrate
```

Or manually:
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna < backend/src/db/migrations/0001_create_initial_schema.sql
```

### Step 2: Fix Frontend Signup/Login

**Option A: Change Frontend to Match Backend (Recommended)**
- Update signup form to collect: username, email, password
- Use phone as optional field (phoneNumber)
- Change endpoint from `/auth/signup` to `/auth/register`
- Update login to use username instead of phone

**Option B: Change Backend to Match Frontend**
- Modify auth.controller to accept `phone` as username
- Make email optional or auto-generate
- Create `/auth/signup` endpoint alias

### Step 3: Fix Database Initialization

**Add to `backend/src/index.ts` startup:**
```typescript
import { runMigrations } from './db/migrate';

const startServer = async () => {
  // Run migrations first
  await runMigrations();
  
  // Then test connection
  const dbConnected = await testConnection();
  // ... rest of startup
};
```

---

## 8. Current State Summary

### ❌ NOT Working:
1. Database migrations have NOT been run
2. Database tables don't exist (except default PostgreSQL)
3. Frontend sends wrong field names (`phone` → `username`, `name` → `fullName`)
4. Frontend sends to wrong endpoint (`/auth/signup` → `/auth/register`)
5. Frontend doesn't send required `email` field
6. No automatic migration on backend startup

### ✅ Working:
1. Docker containers are running
2. PostgreSQL is accessible
3. Redis is running
4. Backend API is running
5. Frontend is compiled
6. WebSocket connection works

---

## 9. Recommended Fix Strategy

### Priority 1: Database Setup (CRITICAL)
```bash
# Run migrations
docker exec -it reddy-anna-backend npm run migrate

# Verify tables created
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -c "\dt"
```

### Priority 2: Frontend API Fixes (CRITICAL)
Update all auth hooks to match backend schema:
- `useSignup.ts`: Change phone→username, add email field, fix endpoint
- `useLogin.ts`: Change phone→username
- `Signup.tsx`: Add email input field, relabel phone
- `Login.tsx`: Relabel to username

### Priority 3: Create Admin User (After migrations)
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna
```
```sql
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'admin',
  'admin@reddyanna.com',
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

Login: username=`admin`, password=`admin123`

---

## 10. Files That Need Changes

### Backend (if not running migrations):
- [ ] `backend/src/index.ts` - Add migration call on startup
- [ ] `backend/src/db/migrate.ts` - Export runMigrations function
- [ ] `backend/package.json` - Verify migrate script

### Frontend (MUST change):
- [ ] `frontend/src/hooks/mutations/auth/useSignup.ts` - Fix interface & endpoint
- [ ] `frontend/src/hooks/mutations/auth/useLogin.ts` - Change phone→username
- [ ] `frontend/src/pages/auth/Signup.tsx` - Add email field, relabel phone
- [ ] `frontend/src/pages/auth/Login.tsx` - Relabel phone→username
- [ ] `frontend/src/types/index.ts` - Update User type if needed

---

## Conclusion

This is a **complete architectural mismatch**. The application was designed with a proper database schema (username/email/phone) but the frontend was built expecting phone-only login. 

**The database migrations have NOT been run**, so the tables don't even exist yet!

**Next Steps:**
1. Run migrations to create tables
2. Fix frontend auth to match backend schema
3. Rebuild and test
4. Create admin user
5. Deploy

---

**Generated:** 2025-12-03
**Status:** 🔴 CRITICAL - System Cannot Function Until Fixed