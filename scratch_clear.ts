import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function clearCooldowns() {
  const result = await prisma.notificationCooldown.deleteMany({});
  console.log('Cleared cooldowns:', result.count);
}

clearCooldowns().catch(console.error).finally(() => prisma.$disconnect());
