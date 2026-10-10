import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function check() {
  const merchant = await prisma.merchant.findFirst({ where: { name: 'Gulshan Hotel' } });
  
  if (merchant) {
    const distanceMeters = 967.5;
    const isWithinRadius = distanceMeters <= merchant.radiusMeters;
    
    console.log(`distanceMeters:`, distanceMeters, typeof distanceMeters);
    console.log(`merchant.radiusMeters:`, merchant.radiusMeters, typeof merchant.radiusMeters);
    console.log(`isWithinRadius:`, isWithinRadius);
    
    const isWithinRadiusConverted = distanceMeters <= Number(merchant.radiusMeters);
    console.log(`isWithinRadiusConverted:`, isWithinRadiusConverted);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
