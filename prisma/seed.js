require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding demo data...')

  // Clean up existing data to make this idempotent
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  // 1. Create a User and Profile
  const user = await prisma.user.create({
    data: {
      profile: {
        create: {
          displayName: 'Demo Student [DEMO]',
          currency: 'INR',
          locale: 'en-IN',
          personalityMode: 'Friendly',
          onboardingCompletedAt: new Date(),
        },
      },
    },
  })

  // 2. Create System Default Categories
  const categoriesToCreate = [
    { name: 'Food', icon: 'pizza', colorToken: '--color-expense' },
    { name: 'Transport', icon: 'bus', colorToken: '--color-expense' },
    { name: 'College', icon: 'book', colorToken: '--color-expense' },
    { name: 'Entertainment', icon: 'film', colorToken: '--color-expense' },
    { name: 'Personal', icon: 'user', colorToken: '--color-expense' },
    { name: 'Hostel', icon: 'home', colorToken: '--color-expense' },
    { name: 'Pocket Money', icon: 'coins', colorToken: '--color-income' },
  ]

  const categories = []
  for (const c of categoriesToCreate) {
    const created = await prisma.category.create({
      data: {
        name: c.name,
        icon: c.icon,
        colorToken: c.colorToken,
        isSystemDefault: true,
      },
    })
    categories.push(created)
  }

  // 3. Create Accounts
  const accountCash = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Cash [DEMO]',
      type: 'cash',
      startingBalance: 0,
    },
  })

  const accountUPI = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Bank UPI [DEMO]',
      type: 'upi',
      startingBalance: 0,
    },
  })

  // 4. Create a Pocket Money Cycle (Current Month)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const cycle = await prisma.pocketMoneyCycle.create({
    data: {
      userId: user.id,
      label: 'August Cycle [DEMO]',
      startDate: startOfMonth,
      endDate: endOfMonth,
      expectedAmount: 1000000, // 10,000 INR in paise
      frequency: 'monthly',
      status: 'active',
      carryForwardAmount: 50000, // 500 INR
    },
  })

  // 5. Create Income (Pocket Money Received)
  await prisma.income.create({
    data: {
      userId: user.id,
      cycleId: cycle.id,
      amount: 1000000,
      sourceType: 'pocket_money',
      receivedAt: startOfMonth,
      note: 'Monthly pocket money from parents [DEMO]',
    },
  })

  // 6. Add some transactions
  const foodCategory = categories.find((c) => c.name === 'Food')
  const transportCategory = categories.find((c) => c.name === 'Transport')
  
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: accountUPI.id,
      categoryId: foodCategory.id,
      type: 'expense',
      amount: 25000, // 250 INR
      occurredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      merchant: 'College Canteen [DEMO]',
      paymentMethod: 'UPI',
    },
  })

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: accountCash.id,
      categoryId: transportCategory.id,
      type: 'expense',
      amount: 4000, // 40 INR
      occurredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      merchant: 'Auto Rickshaw [DEMO]',
      paymentMethod: 'Cash',
    },
  })

  console.log('Demo data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
