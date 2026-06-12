/**
 * Render Build Script
 *
 * This script runs during Render's build phase to:
 * 1. Ensure Prisma v6 is installed (NOT v7 which has breaking changes)
 * 2. Generate Prisma Client with PostgreSQL provider
 * 3. Push schema to PostgreSQL database (creates tables)
 * 4. Build Next.js
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

// Step 1: Force install Prisma v6 (NOT v7 which breaks schema)
try {
  console.log('📦 Ensuring Prisma v6 is installed (pinning to avoid v7 breaking changes)...');
  execSync('npm install prisma@6 @prisma/client@6 --save', { stdio: 'inherit' });
  console.log('✅ Prisma v6 confirmed');
} catch (error) {
  console.error('⚠️ Prisma v6 install warning:', error.message);
  // Continue — it might already be installed
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
  console.log('⚠️ No PostgreSQL DATABASE_URL found. Set it in Render Environment Variables.');
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

console.log('✅ Render build complete!');
