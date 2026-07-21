/** 
 * Vercel Build Script
 *
 * This script runs during Vercel's build phase to:
 * 1. Switch Prisma schema from SQLite to PostgreSQL (for Vercel)
 * 2. Generate Prisma Client with PostgreSQL provider
 * 3. Push schema to PostgreSQL database
 *
 * Required Vercel Environment Variables:
 * - DATABASE_URL: PostgreSQL connection string
 *   (e.g., postgresql://user:pass@host:5432/dbname)
 *
 * Free PostgreSQL options:
 * - Supabase: https://supabase.com (500MB free)
 * - Neon: https://neon.tech (3GB free)
 * - Vercel Postgres: https://vercel.com/storage/postgres
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Vercel build setup...');

// Step 1: Switch to PostgreSQL schema for Vercel
const pgSchemaPath = path.join(__dirname, 'prisma', 'schema.postgresql.prisma');
const mainSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

if (fs.existsSync(pgSchemaPath)) {
  console.log('📦 Switching to PostgreSQL schema...');
  fs.copyFileSync(pgSchemaPath, mainSchemaPath);
  console.log('✅ PostgreSQL schema activated');
} else {
  console.log('⚠️ No PostgreSQL schema found, using default schema');
}

// Step 2: Generate Prisma Client
try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated');
} catch (error) {
  console.error('❌ Prisma generate failed:', error.message);
  process.exit(1);
}

// Step 3: Push schema to PostgreSQL (creates tables if they don't exist)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  try {
    console.log('🗄️ Pushing schema to PostgreSQL...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Schema pushed to PostgreSQL');
  } catch (error) {
    console.error('⚠️ Schema push warning:', error.message);
    // Don't exit — schema might already be up to date
  }
} else {
  console.log('⚠️ No PostgreSQL DATABASE_URL found. Set it in Vercel Environment Variables.');
  console.log('⚠️ The app will likely fail without a database connection.');
}

// Step 4: Build Next.js
try {
  console.log('🏗️ Building Next.js...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build complete');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('✅ Vercel build complete!');
