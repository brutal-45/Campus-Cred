/**
 * Seed script to create the admin user for CampusCred
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'creatorsports81@gmail.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('Set ADMIN_PASSWORD before running the admin seed script.');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Upsert admin user — create if not exists, update if exists
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,         // Update password in case it changed
      role: 'admin',
      isVerified: true,
      fullName: 'CampusCred Admin',
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'CampusCred Admin',
      role: 'admin',
      isVerified: true,
      campusCredScore: 1000,
      level: 'Legend',
    },
  });

  console.log('✅ Admin user seeded:', admin.email, '| Role:', admin.role);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
