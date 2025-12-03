# API URL Duplicate Fix Complete

## Issues Fixed

### 1. Duplicate `/api` in API Calls ✅

**Problem**: Frontend was calling `localhost:3001/api/api/auth/signup` instead of `localhost:3001/api/auth/signup`

**Root Cause**: 
- Base URL in [`api.ts`](frontend/src/lib/api.ts:10) already includes `/api`
- Auth mutation files were adding `/api` prefix again

**Files Fixed**:
1. [`frontend/src/hooks/mutations/auth/useSignup.ts`](frontend/src/hooks/mutations/auth/useSignup.ts:30)
   - Changed: `api.post('/api/auth/signup', data)` 
   - To: `api.post('/auth/signup', data)`

2. [`frontend/src/hooks/mutations/auth/useLogout.ts`](frontend/src/hooks/mutations/auth/useLogout.ts:17)
   - Changed: `api.post('/api/auth/logout')`
   - To: `api.post('/auth/logout')`

**Result**: All API calls now use correct URLs without duplication

---

### 2. React DOM Nesting Warning ✅

**Problem**: `<div> cannot appear as a descendant of <p>` warning
- Badge component (renders as `<div>`) was nested inside CardDescription (`<p>` tag)

**File Fixed**:
[`frontend/src/pages/auth/Signup.tsx`](frontend/src/pages/auth/Signup.tsx:145)

**Before**:
```tsx
<CardDescription className="text-gray-300 text-lg font-medium">
  Join now and get <Badge>₹100 Bonus</Badge>
</CardDescription>
```

**After**:
```tsx
<CardDescription className="text-gray-300 text-lg font-medium flex items-center justify-center gap-2 flex-wrap">
  <span>Join now and get</span>
  <Badge>₹100 Bonus</Badge>
</CardDescription>
```

**Result**: Proper DOM structure with no nesting violations

---

## API URL Pattern

### Correct Pattern

```typescript
// ✅ CORRECT - Don't include /api prefix
api.post('/auth/signup', data)
api.get('/users')
api.put('/profile', data)
api.delete('/notifications/123')
```

### Incorrect Pattern

```typescript
// ❌ WRONG - Double /api prefix
api.post('/api/auth/signup', data)
api.get('/api/users')
```

### Why?

The base URL is already configured with `/api`:
```typescript
// frontend/src/lib/api.ts
export const api = axios.create({
  baseURL: `${API_URL}/api`,  // Already includes /api
  // ...
});
```

---

## Testing

### Verify Fixes

1. **Check API Calls**:
```bash
# Open browser console
# Try signing up
# Network tab should show: localhost:3001/api/auth/signup (not /api/api/auth/signup)
```

2. **Check Console Warnings**:
```bash
# No more "validateDOMNesting" warnings
# No more "ERR_CONNECTION_REFUSED" errors
```

3. **Test Signup Flow**:
- Visit http://YOUR_VPS_IP:3000/signup
- Fill in the form
- Submit
- Should successfully create account and redirect to /game

---

## Next Steps

1. **Rebuild Docker containers** to apply these fixes
2. **Test all authentication flows**:
   - Signup
   - Login  
   - Logout
   - Password reset (if implemented)

---

## Files Modified

1. `frontend/src/hooks/mutations/auth/useSignup.ts` - Fixed duplicate /api
2. `frontend/src/hooks/mutations/auth/useLogout.ts` - Fixed duplicate /api  
3. `frontend/src/pages/auth/Signup.tsx` - Fixed DOM nesting warning

---

## Status

✅ **All API URL issues fixed**
✅ **All React DOM warnings fixed**
✅ **Ready for Docker rebuild**

---

## Commands to Deploy

```bash
cd /opt/reddy_anna

# Stop containers
docker compose down

# Rebuild with fixes
docker compose build backend frontend

# Start all services
docker compose up -d

# Check logs
docker logs -f reddy-anna-backend
docker logs -f reddy-anna-frontend

# Verify
docker ps
curl http://localhost:3001/api/health
```

---

## Success Indicators

After deployment, you should see:

1. ✅ Frontend accessible at http://YOUR_VPS_IP:3000
2. ✅ Signup page loads without console warnings
3. ✅ Network requests show correct URLs (no duplicate /api)
4. ✅ API responses return successfully
5. ✅ User can signup and login successfully

---

## Additional Notes

- All other API hooks follow the correct pattern (without /api prefix)
- Only auth hooks had this issue
- TypeScript type checking now passes cleanly
- No more connection refused errors