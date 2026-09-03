require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixIcons() {
  console.log('Fixing category icons in database...');

  const iconFixes = [
    { nameMatch: 'Food', icon: 'restaurant' },
    { nameMatch: 'Transport', icon: 'directions_bus' },
    { nameMatch: 'College', icon: 'school' },
    { nameMatch: 'Entertainment', icon: 'movie' },
    { nameMatch: 'Personal', icon: 'person' },
    { nameMatch: 'Hostel', icon: 'home' },
    { nameMatch: 'Pocket Money', icon: 'payments' },
    { nameMatch: 'Shopping', icon: 'shopping_bag' },
    { nameMatch: 'Bills', icon: 'receipt' },
  ];

  for (const item of iconFixes) {
    const updated = await prisma.category.updateMany({
      where: { name: { contains: item.nameMatch, mode: 'insensitive' } },
      data: { icon: item.icon },
    });
    console.log(`Updated ${updated.count} categories for ${item.nameMatch} -> ${item.icon}`);
  }

  // Also fix any leftover pizza, coins, film, bus, book, user icons
  await prisma.category.updateMany({ where: { icon: 'pizza' }, data: { icon: 'restaurant' } });
  await prisma.category.updateMany({ where: { icon: 'coins' }, data: { icon: 'payments' } });
  await prisma.category.updateMany({ where: { icon: 'film' }, data: { icon: 'movie' } });
  await prisma.category.updateMany({ where: { icon: 'bus' }, data: { icon: 'directions_bus' } });
  await prisma.category.updateMany({ where: { icon: 'book' }, data: { icon: 'school' } });
  await prisma.category.updateMany({ where: { icon: 'user' }, data: { icon: 'person' } });

  console.log('Icon fix complete.');
  await prisma.$disconnect();
}

fixIcons().catch(console.error);
