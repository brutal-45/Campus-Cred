/**
 * Render Build Script
 *
 * Runs during Render's build phase:
 * 1. Force-install Prisma v6 (avoids v7 breaking changes)
 * 2. Generate Prisma Client
 * 3. Push schema to PostgreSQL
 * 4. Build Next.js
 */

const { execSync } = require('child_process');

function run(cmd, label, allowFail = false) {
  console.log(`\n▶ ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${label} — done`);
    return true;
  } catch (error) {
    console.error(allowFail ? `⚠️ ${label} — warning (continuing)` : `❌ ${label} — FAILED`);
    if (!allowFail) process.exit(1);
    return false;
  }
}

console.log('🚀 CampusCred — Render Build\n');

// Step 1: Force Prisma v6
run('npm install prisma@6 @prisma/client@6 --save-exact', 'Install Prisma v6', true);

// Step 2: Generate Prisma Client
run('npx prisma@6 generate', 'Generate Prisma Client');

// Step 3: Push DB schema (only if PostgreSQL URL is set)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  run('npx prisma@6 db push --accept-data-loss', 'Push schema to PostgreSQL', true);
} else {
  console.log('⚠️  No PostgreSQL DATABASE_URL set — skipping DB push');
}

// Step 4: Build Next.js (MUST succeed)
run('next build', 'Build Next.js');

console.log('\n✅ CampusCred — Render Build Complete!\n');
