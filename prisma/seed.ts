import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import pg from 'pg'; // Need to import pool for adapter if not using connectionString directly, wait PrismaPg takes connectionString in 7.x

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@citydeals.test' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@citydeals.test',
      passwordHash,
      role: 'ADMIN',
      acceptedTerms: true,
      onboardingCompleted: true,
    },
  });

  const provider = await prisma.user.upsert({
    where: { email: 'provider@citydeals.test' },
    update: {},
    create: {
      fullName: 'Provider User',
      email: 'provider@citydeals.test',
      passwordHash,
      role: 'ADVERTISER',
      acceptedTerms: true,
      onboardingCompleted: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@citydeals.test' },
    update: {},
    create: {
      fullName: 'Regular User',
      email: 'user@citydeals.test',
      passwordHash,
      role: 'USER',
      acceptedTerms: true,
      onboardingCompleted: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log({ admin: admin.email, provider: provider.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
