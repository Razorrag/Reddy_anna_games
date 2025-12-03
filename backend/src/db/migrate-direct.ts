import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const runDirectMigration = async () => {
  console.log('🔄 Running database migrations directly...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@postgres:5432/reddy_anna',
  });

  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'migrations', '0001_create_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing migration SQL...');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✓ Migration completed successfully');
    console.log('✓ Database schema created');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`✓ Created ${result.rows.length} tables:`);
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runDirectMigration();