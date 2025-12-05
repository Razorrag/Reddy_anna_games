import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema';

// Database configuration - supports both individual params and connection string
// Individual params are preferred to avoid URL encoding issues with special chars in password
const getPoolConfig = (): PoolConfig => {
  // If individual params are provided, use them (avoids URL encoding issues)
  if (process.env.DATABASE_HOST || process.env.POSTGRES_HOST) {
    const config: PoolConfig = {
      host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '5432'),
      database: process.env.DATABASE_NAME || process.env.POSTGRES_DB || 'reddy_anna',
      user: process.env.DATABASE_USER || process.env.POSTGRES_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
    console.log(`[DB] Connecting to ${config.host}:${config.port}/${config.database} as ${config.user}`);
    return config;
  }
  
  // Fallback to connection string if no individual params
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/reddy_anna_games';
  console.log(`[DB] Using connection string (host extracted): ${connectionString.split('@')[1]?.split('/')[0] || 'unknown'}`);
  return {
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

// Create connection pool
export const pool = new Pool(getPoolConfig());

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✓ Database connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

// Close database connection
export async function closeConnection(): Promise<void> {
  await pool.end();
  console.log('✓ Database connection closed');
}

export { schema };