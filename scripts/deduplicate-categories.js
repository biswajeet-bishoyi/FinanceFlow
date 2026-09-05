require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDuplicates() {
  console.log('Cleaning up duplicate categories...');

  // Get all categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  const seen = new Map();
  const toDelete = [];

  for (const cat of categories) {
    // Key by userId (or 'system') + lowercase name
    const owner = cat.userId || 'system';
    const key = `${owner}:${cat.name.trim().toLowerCase()}`;

    if (seen.has(key)) {
      toDelete.push(cat.id);
    } else {
      seen.set(key, cat.id);
    }
  }

  console.log(`Found ${toDelete.length} duplicate category rows to remove`);

  for (const id of toDelete) {
    // Check if transactions reference this category before deleting
    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (txCount === 0) {
      await prisma.category.delete({ where: { id } });
    }
  }

  console.log('Cleanup complete!');
  await prisma.$disconnect();
}

cleanDuplicates().catch(console.error);
