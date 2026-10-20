// Render-specific build entrypoint. Keep database schema changes separate from builds.
/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync } = require('node:child_process');

console.log('Generating Prisma Client...');
execFileSync('npx', ['prisma', 'generate'], { stdio: 'inherit' });

console.log('Building Next.js...');
execFileSync('npx', ['next', 'build'], { stdio: 'inherit' });

console.log('Render build complete. Apply database changes separately with `npm run db:push`.');
