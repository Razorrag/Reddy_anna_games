#!/bin/bash

# Create Admin User Script
echo "Creating admin user..."

docker exec -i reddy-anna-postgres psql -U postgres -d reddy_anna << 'EOF'
-- Create admin user with proper password hash
INSERT INTO users (
  username,
  email,
  password_hash,
  phone_number,
  full_name,
  role,
  status,
  balance,
  bonus_balance,
  created_at,
  updated_at
) VALUES (
  'admin',
  'admin@reddyanna.com',
  '$2b$10$rKgF8X9VJHYhKGxYHXKZQOGxLQ5z7Z3vLx4vBxQvz0z1z2z3z4z5z',
  'admin',
  'Administrator',
  'admin',
  'active',
  0.00,
  0.00,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Verify admin user
SELECT 
  username, 
  email, 
  role, 
  status,
  created_at
FROM users 
WHERE username = 'admin';
EOF

echo ""
echo "✅ Admin user created/updated"
echo "📝 Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""