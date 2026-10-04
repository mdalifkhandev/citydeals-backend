import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 12);

  // 1. Seed Areas
  const areaMadrid = await prisma.area.upsert({
    where: { slug: 'madrid-centro' },
    update: {},
    create: {
      name: 'Madrid Centro',
      slug: 'madrid-centro',
      city: 'Madrid',
      state: 'Madrid',
      latitude: 40.416775,
      longitude: -3.703790,
      radiusMeters: 15000,
    },
  });

  const areaBarcelona = await prisma.area.upsert({
    where: { slug: 'barcelona-centro' },
    update: {},
    create: {
      name: 'Barcelona Centro',
      slug: 'barcelona-centro',
      city: 'Barcelona',
      state: 'Catalonia',
      latitude: 41.387917,
      longitude: 2.169919,
      radiusMeters: 15000,
    },
  });

  // 2. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@citydeals.test' },
    update: {
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    create: {
      fullName: 'Admin User',
      email: 'admin@citydeals.test',
      passwordHash,
      role: 'ADMIN',
      acceptedTerms: true,
      onboardingCompleted: true,
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  const provider = await prisma.user.upsert({
    where: { email: 'provider@citydeals.test' },
    update: {
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    create: {
      fullName: 'Provider User',
      email: 'provider@citydeals.test',
      passwordHash,
      role: 'ADVERTISER',
      acceptedTerms: true,
      onboardingCompleted: true,
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@citydeals.test' },
    update: {
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
    create: {
      fullName: 'Regular User',
      email: 'user@citydeals.test',
      passwordHash,
      role: 'USER',
      acceptedTerms: true,
      onboardingCompleted: true,
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.updateMany({
    where: { email: 'sparktech301@gmail.com' },
    data: {
      areaId: areaMadrid.id,
      profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  // 3. Seed Categories
  const categoriesData = [
    { name: 'Restaurants', slug: 'restaurants', sortOrder: 1, iconUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100' },
    { name: 'Shopping', slug: 'shopping', sortOrder: 2, iconUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100' },
    { name: 'Groceries', slug: 'groceries', sortOrder: 3, iconUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100' },
    { name: 'Electronics', slug: 'electronics', sortOrder: 4, iconUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
    { name: 'Beauty', slug: 'beauty', sortOrder: 5, iconUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100' },
    { name: 'Travel', slug: 'travel', sortOrder: 6, iconUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100' },
    { name: 'Fitness', slug: 'fitness', sortOrder: 7, iconUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, iconUrl: cat.iconUrl, sortOrder: cat.sortOrder },
      create: {
        name: cat.name,
        slug: cat.slug,
        iconUrl: cat.iconUrl,
        sortOrder: cat.sortOrder,
        status: 'ACTIVE',
      },
    });
  }

  // 4. Seed Merchants
  const merchantTaqueria = await prisma.merchant.upsert({
    where: { id: 'm-taqueria-madrid' },
    update: {},
    create: {
      id: 'm-taqueria-madrid',
      name: 'La Taqueria Madrid',
      titleText: 'Authentic Tacos & Mexican Drinks',
      description: 'Handmade tacos, fresh margaritas and gourmet croquettes in the heart of Madrid.',
      logoUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&auto=format&fit=crop&q=80',
      address: 'Calle de la Luna 14, 28004 Madrid',
      phone: '+34 912 345 678',
      email: 'hola@taqueriamadrid.com',
      areaId: areaMadrid.id,
      categoryId: categories['restaurants'].id,
      ownerId: provider.id,
      latitude: 40.4225,
      longitude: -3.7058,
      status: 'ACTIVE',
    },
  });

  const merchantBoutique = await prisma.merchant.upsert({
    where: { id: 'm-urban-style' },
    update: {},
    create: {
      id: 'm-urban-style',
      name: 'Urban Style Boutique',
      titleText: 'Trending European Streetwear',
      description: 'Chic urban collections, contemporary jackets, and curated accessories for modern living.',
      logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&auto=format&fit=crop&q=80',
      address: 'Gran Vía 42, 28013 Madrid',
      phone: '+34 913 456 789',
      email: 'info@urbanstylemadrid.com',
      areaId: areaMadrid.id,
      categoryId: categories['shopping'].id,
      ownerId: provider.id,
      latitude: 40.4201,
      longitude: -3.7065,
      status: 'ACTIVE',
    },
  });

  const merchantFresh = await prisma.merchant.upsert({
    where: { id: 'm-fresh-market' },
    update: {},
    create: {
      id: 'm-fresh-market',
      name: 'Fresh Market Organics',
      titleText: 'Farm Fresh Organic Supermarket',
      description: 'Daily harvest organic fruits, vegetables, artisan sourdough, and local dairy products.',
      logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
      address: 'Calle de Fuencarral 68, 28004 Madrid',
      phone: '+34 914 567 890',
      email: 'orders@freshmarketmadrid.com',
      areaId: areaMadrid.id,
      categoryId: categories['groceries'].id,
      ownerId: provider.id,
      latitude: 40.4260,
      longitude: -3.7015,
      status: 'ACTIVE',
    },
  });

  const merchantTech = await prisma.merchant.upsert({
    where: { id: 'm-techzone' },
    update: {},
    create: {
      id: 'm-techzone',
      name: 'TechZone Store',
      titleText: 'Smart Electronics & Gadgets Hub',
      description: 'Authorised retailer for premium audio gear, wireless smart devices, and wearable gadgets.',
      logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
      address: 'Calle de Preciados 18, 28013 Madrid',
      phone: '+34 915 678 901',
      email: 'support@techzonemadrid.com',
      areaId: areaMadrid.id,
      categoryId: categories['electronics'].id,
      ownerId: provider.id,
      latitude: 40.4185,
      longitude: -3.7050,
      status: 'ACTIVE',
    },
  });

  const merchantSpa = await prisma.merchant.upsert({
    where: { id: 'm-serenity-spa' },
    update: {},
    create: {
      id: 'm-serenity-spa',
      name: 'Serenity Spa & Wellness',
      titleText: 'Luxury Personal Care & Relaxation',
      description: 'Full body restorative massages, organic facial treatments, and premium hair therapies.',
      logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=120&auto=format&fit=crop&q=80',
      address: 'Calle de Alcalá 25, 28014 Madrid',
      phone: '+34 916 789 012',
      email: 'relax@serenityspamadrid.com',
      areaId: areaMadrid.id,
      categoryId: categories['beauty'].id,
      ownerId: provider.id,
      latitude: 40.4178,
      longitude: -3.6995,
      status: 'ACTIVE',
    },
  });

  // 5. Seed Coupons
  const couponsData = [
    {
      shareSlug: 'buy-2-main-dishes-free-croquettes',
      title: 'Buy 2 main dishes',
      description: '& get 1 order of croquettes for free.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      couponCode: 'TACOFREE',
      merchantId: merchantTaqueria.id,
      categoryId: categories['restaurants'].id,
      isWhitelisted: true,
      redemptionLimit: 200,
    },
    {
      shareSlug: 'nationwide-fast-food-deals-bogo',
      title: 'Nationwide Fast Food Deals',
      description: 'Exclusive coupons, $6 Big Box & BOGO 50% Off.',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
      couponCode: 'FAST50',
      merchantId: merchantTaqueria.id,
      categoryId: categories['restaurants'].id,
      isWhitelisted: false,
      redemptionLimit: 150,
    },
    {
      shareSlug: 'special-summer-slush-floats',
      title: 'Special Summer Treats',
      description: 'Get $2.50 Slush Floats & 1/2 Price Drinks all summer.',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      couponCode: 'SUMMER25',
      merchantId: merchantTaqueria.id,
      categoryId: categories['restaurants'].id,
      isWhitelisted: true,
      redemptionLimit: 300,
    },
    {
      shareSlug: 'spring-casual-fashion-half-price',
      title: 'Spring Fashion 50% Discount',
      description: '50% off on all trending dresses, designer denim & casual wear.',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      couponCode: 'SPRING50',
      merchantId: merchantBoutique.id,
      categoryId: categories['shopping'].id,
      isWhitelisted: true,
      redemptionLimit: 100,
    },
    {
      shareSlug: 'fresh-organic-groceries-discount',
      title: 'Fresh Organic Produce 20% Off',
      description: 'Save 20% on any basket over €25 of local fresh organic farm produce.',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      couponCode: 'ORGANIC20',
      merchantId: merchantFresh.id,
      categoryId: categories['groceries'].id,
      isWhitelisted: false,
      redemptionLimit: 500,
    },
    {
      shareSlug: 'smart-tech-and-gadgets-discount',
      title: 'Smart Tech & Gadgets Discount',
      description: 'Up to 35% off on smart accessories, bluetooth headphones & wireless chargers.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      couponCode: 'TECH35',
      merchantId: merchantTech.id,
      categoryId: categories['electronics'].id,
      isWhitelisted: true,
      redemptionLimit: 80,
    },
    {
      shareSlug: 'complimentary-hair-spa-treatment',
      title: 'Complimentary Hair Spa Treatment',
      description: 'Free revitalizing hair treatment & scalp massage with any facial service.',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      couponCode: 'SPAGIFT',
      merchantId: merchantSpa.id,
      categoryId: categories['beauty'].id,
      isWhitelisted: false,
      redemptionLimit: 50,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { shareSlug: c.shareSlug },
      update: {
        title: c.title,
        description: c.description,
        imageUrl: c.imageUrl,
        couponCode: c.couponCode,
        isWhitelisted: c.isWhitelisted,
        status: 'ACTIVE',
      },
      create: {
        title: c.title,
        description: c.description,
        imageUrl: c.imageUrl,
        couponCode: c.couponCode,
        shareSlug: c.shareSlug,
        status: 'ACTIVE',
        areaId: areaMadrid.id,
        merchantId: c.merchantId,
        categoryId: c.categoryId,
        isWhitelisted: c.isWhitelisted,
        redemptionLimit: c.redemptionLimit,
      },
    });
  }

  console.log('Database seeded successfully with Categories, Merchants, and Active Coupons!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
