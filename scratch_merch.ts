import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function check() {
  const merchants = await prisma.merchant.findMany({ 
    where: { name: { contains: 'Hotel' } },
    include: { coupons: { where: { status: 'ACTIVE' }, select: { id: true, status: true } } }
  });
  console.log('Merchants Status & Coupons:', merchants.map(m => ({ name: m.name, status: m.status, couponsCount: m.coupons.length })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
