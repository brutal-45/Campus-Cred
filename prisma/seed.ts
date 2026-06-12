import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user — ONLY allowed admin: creatorsports81@gmail.com
  const adminPassword = await hashPassword('Viraj@133');
  const admin = await db.user.upsert({
    where: { email: 'creatorsports81@gmail.com' },
    update: {},
    create: {
      fullName: 'Admin CampusCred',
      email: 'creatorsports81@gmail.com',
      passwordHash: adminPassword,
      role: 'admin',
      isVerified: true,
      points: 0,
      level: 'Starter',
      lastActiveAt: new Date(),
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log(`   - Admin: creatorsports81@gmail.com / Viraj@133`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
