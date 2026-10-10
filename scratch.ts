import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function check() {
  const notifications = await prisma.notification.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 5 
  });
  console.log('Recent Notifications:', notifications.map(n => ({ title: n.title, createdAt: n.createdAt, body: n.body })));
}

check().catch(console.error).finally(() => prisma.$disconnect());