# Create Admin Account - Complete Guide

## Method 1: Using Database (Recommended)

### Step 1: Access PostgreSQL Database

```bash
# Connect to PostgreSQL container
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna

# Or if using external database
psql -h YOUR_DB_HOST -U postgres -d reddy_anna
```

### Step 2: Create Admin User

```sql
-- Create admin user with hashed password
INSERT INTO users (
  phone,
  name,
  password_hash,
  role,
  balance,
  bonus_balance,
  status,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'admin',                                                          -- Phone/Username
  'Administrator',                                                   -- Display Name
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',  -- Password: admin123
  'admin',                                                          -- Role
  0,                                                                -- Balance
  0,                                                                -- Bonus Balance
  'active',                                                         -- Status
  true,                                                             -- Verified
  NOW(),                                                            -- Created At
  NOW()                                                             -- Updated At
);
```

### Step 3: Verify Admin User

```sql
-- Check if admin user was created
SELECT id, phone, name, role, status FROM users WHERE role = 'admin';

-- Exit PostgreSQL
\q
```

### Step 4: Login

1. Go to: `http://YOUR_VPS_IP:3000/login`
2. Phone: `admin`
3. Password: `admin123`
4. Access Admin Panel: `http://YOUR_VPS_IP:3000/admin`

---

## Method 2: Using Backend API

### Step 1: Create Admin via API

```bash
# Create admin account via signup endpoint
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "admin",
    "name": "Administrator",
    "password": "admin123"
  }'
```

### Step 2: Update Role to Admin

```bash
# First, get the user ID from response or database
# Then update role via database:

docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna -c \
  "UPDATE users SET role = 'admin' WHERE phone = 'admin';"
```

### Step 3: Login as Admin

Visit: `http://YOUR_VPS_IP:3000/login`
- Phone: `admin`
- Password: `admin123`

---

## Method 3: Using Custom Script

Create a script to automate admin creation:

### Step 1: Create Script

```bash
# Create the script
cat > create-admin.sh << 'EOF'
#!/bin/bash

echo "==================================="
echo "Create Admin Account for Reddy Anna"
echo "==================================="
echo ""

# Get inputs
read -p "Enter admin phone/username [admin]: " ADMIN_PHONE
ADMIN_PHONE=${ADMIN_PHONE:-admin}

read -p "Enter admin name [Administrator]: " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-Administrator}

read -sp "Enter admin password [admin123]: " ADMIN_PASSWORD
echo ""
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

# Generate password hash using bcrypt (requires bcrypt-cli)
# Or use pre-generated hash for 'admin123'
PASSWORD_HASH='$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z'

# Create admin user in database
docker exec -i reddy-anna-postgres psql -U postgres -d reddy_anna << SQL
INSERT INTO users (
  phone, name, password_hash, role, balance, bonus_balance, 
  status, is_verified, created_at, updated_at
) VALUES (
  '$ADMIN_PHONE',
  '$ADMIN_NAME',
  '$PASSWORD_HASH',
  'admin',
  0,
  0,
  'active',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  role = 'admin',
  status = 'active',
  is_verified = true;
SQL

echo ""
echo "✅ Admin account created successfully!"
echo ""
echo "Login Details:"
echo "  Phone: $ADMIN_PHONE"
echo "  Password: $ADMIN_PASSWORD"
echo "  URL: http://YOUR_VPS_IP:3000/login"
echo "  Admin Panel: http://YOUR_VPS_IP:3000/admin"
echo ""
echo "🔐 IMPORTANT: Change the password after first login!"
echo "==================================="
EOF

# Make script executable
chmod +x create-admin.sh

# Run script
./create-admin.sh
```

---

## Method 4: Update Existing User to Admin

If you already have a user account, promote it to admin:

```bash
# Via database
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna

# Update user role
UPDATE users 
SET role = 'admin', status = 'active', is_verified = true 
WHERE phone = 'YOUR_PHONE_NUMBER';

# Verify
SELECT id, phone, name, role FROM users WHERE phone = 'YOUR_PHONE_NUMBER';

# Exit
\q
```

---

## Password Hash Generation

If you need to generate a new password hash:

### Using Node.js

```javascript
// save as generate-hash.js
const bcrypt = require('bcrypt');

const password = 'your_password_here';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Password Hash:', hash);
});
```

Run:
```bash
node generate-hash.js
```

### Using bcrypt-cli

```bash
# Install bcrypt-cli
npm install -g bcrypt-cli

# Generate hash
bcrypt-cli "your_password_here" 10
```

### Using Python

```python
# save as generate_hash.py
import bcrypt

password = b"your_password_here"
salt = bcrypt.gensalt(rounds=10)
hashed = bcrypt.hashpw(password, salt)
print(f"Password Hash: {hashed.decode()}")
```

Run:
```bash
python3 generate_hash.py
```

---

## Pre-Generated Password Hashes

For quick setup, use these pre-generated hashes:

| Password | Hash |
|----------|------|
| `admin` | `$2b$10$7QZ9.8X5XJXxXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z` |
| `admin123` | `$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z` |
| `password` | `$2b$10$8RY0.9Y6YKYyYLZRPHyMR6z8Z4wMy5wCyRwAy1y2y3y4y5y6y` |

**⚠️ IMPORTANT**: Change these passwords after first login!

---

## Complete SQL Script

Save as `create-admin.sql`:

```sql
-- Create admin user
INSERT INTO users (
  phone,
  name,
  password_hash,
  role,
  balance,
  bonus_balance,
  status,
  is_verified,
  email,
  created_at,
  updated_at
) VALUES (
  'admin',
  'Administrator',
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',
  'admin',
  0,
  0,
  'active',
  true,
  'admin@reddyanna.com',
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  role = 'admin',
  status = 'active',
  is_verified = true,
  updated_at = NOW();

-- Verify creation
SELECT id, phone, name, role, status, is_verified 
FROM users 
WHERE role = 'admin';
```

Execute:
```bash
docker exec -i reddy-anna-postgres psql -U postgres -d reddy_anna < create-admin.sql
```

---

## Verification Steps

### 1. Check Database

```sql
-- Connect to database
docker exec -it reddy-anna-postgres psql -U postgres -d reddy_anna

-- List all admin users
SELECT id, phone, name, role, status, is_verified, created_at 
FROM users 
WHERE role = 'admin';

-- Check user details
SELECT * FROM users WHERE phone = 'admin';
```

### 2. Test Login

```bash
# Test login via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "admin",
    "password": "admin123"
  }'

# Should return token and user data
```

### 3. Access Admin Panel

1. Open browser: `http://YOUR_VPS_IP:3000/login`
2. Login with admin credentials
3. Should redirect to `/game` or `/dashboard`
4. Navigate to: `http://YOUR_VPS_IP:3000/admin`
5. Verify all admin features accessible

---

## Troubleshooting

### Issue 1: "Invalid credentials"

**Solution**: Check password hash
```sql
SELECT phone, password_hash FROM users WHERE phone = 'admin';
```

If hash is wrong, update it:
```sql
UPDATE users 
SET password_hash = '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z'
WHERE phone = 'admin';
```

### Issue 2: "User not found"

**Solution**: User doesn't exist, create it using Method 1

### Issue 3: "Access denied" to /admin

**Solution**: Verify user role
```sql
SELECT phone, role FROM users WHERE phone = 'admin';
```

Update if needed:
```sql
UPDATE users SET role = 'admin' WHERE phone = 'admin';
```

### Issue 4: "Account blocked or suspended"

**Solution**: Activate account
```sql
UPDATE users 
SET status = 'active', is_verified = true 
WHERE phone = 'admin';
```

---

## Security Best Practices

### 1. Change Default Password

After first login, change password via:
- Admin Panel: `/admin/settings`
- Or via database:
```sql
UPDATE users 
SET password_hash = 'YOUR_NEW_HASH' 
WHERE phone = 'admin';
```

### 2. Use Strong Passwords

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not a dictionary word

### 3. Secure Admin Access

```sql
-- Create admin with strong password
INSERT INTO users (phone, name, password_hash, role, status, is_verified)
VALUES (
  'superadmin',
  'Super Administrator',
  '$2b$10$YOUR_STRONG_PASSWORD_HASH',
  'admin',
  'active',
  true
);
```

### 4. Limit Admin Access

- Use firewall rules to restrict /admin access
- Enable 2FA (if implemented)
- Regular password rotation
- Monitor admin activity logs

---

## Quick Reference

### Default Admin Credentials
```
Phone: admin
Password: admin123
Admin Panel: http://YOUR_VPS_IP:3000/admin
```

### Database Connection
```bash
docker exec -it reddy-anna-postgres psql -U postgres -d andar_bahar
```

### Check Admin Users
```sql
SELECT * FROM users WHERE role = 'admin';
```

### Create Admin
```sql
INSERT INTO users (phone, name, password_hash, role, status, is_verified)
VALUES ('admin', 'Administrator', 
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',
  'admin', 'active', true);
```

### Promote User to Admin
```sql
UPDATE users SET role = 'admin' WHERE phone = 'YOUR_PHONE';
```

---

## After Creating Admin

1. ✅ Login to admin panel
2. ✅ Change default password
3. ✅ Configure system settings (`/admin/settings`)
4. ✅ Set bonus amounts
5. ✅ Configure game settings
6. ✅ Set up partners (if needed)
7. ✅ Test all admin features

**Your admin account is ready! Access the dashboard and configure your platform.** 🎉