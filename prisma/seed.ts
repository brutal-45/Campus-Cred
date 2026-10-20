import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

async function main() {
  console.log('🌱 Seeding database...');

  // Admin credentials are supplied privately through deployment environment variables.
  const adminEmail = (process.env.ADMIN_EMAIL || 'creatorsports81@gmail.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('Set ADMIN_PASSWORD before running the seed script.');
  }
  const passwordHash = await hashPassword(adminPassword);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: 'Admin CampusCred',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isVerified: true,
      points: 0,
      level: 'Starter',
      lastActiveAt: new Date(),
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log(`   - Admin account: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
