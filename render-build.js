/**
 * Render Build Script
 *
 * This script runs during Render's build phase to:
 * 1. Generate Prisma Client with PostgreSQL provider
 * 2. Push schema to PostgreSQL database (creates tables)
 * 3. Build Next.js
 *
 * Required Render Environment Variables:
 * - DATABASE_URL: PostgreSQL connection string
 *   (e.g., postgresql://user:pass@host:5432/dbname)
 * - JWT_SECRET: Strong random string for access tokens
 * - JWT_REFRESH_SECRET: Strong random string for refresh tokens
 *
 * Get free PostgreSQL on Render:
 * - Render PostgreSQL: https://render.com/docs/databases
 */

const { execSync } = require('child_process');

console.log('🚀 Running Render build setup...');

// Step 1: Generate Prisma Client
try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated');
} catch (error) {
  console.error('❌ Prisma generate failed:', error.message);
  process.exit(1);
}

// Step 2: Push schema to PostgreSQL (creates tables if they don't exist)
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
  console.log('⚠️ No PostgreSQL DATABASE_URL found. Set it in Render Environment Variables.');
}

// Step 3: Build Next.js
try {
  console.log('🏗️ Building Next.js...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build complete');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('✅ Render build complete!');
