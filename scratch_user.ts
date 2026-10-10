import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function check() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'aa@lnovic.com' },
    select: { id: true, email: true, notificationsPaused: true } 
  });
  console.log('User notificationsPaused:', user);
}

check().catch(console.error).finally(() => prisma.$disconnect());
