import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { calculateCycleBalance } from "@/domain/cycle-balance";
import { WhatIfSimulator } from "@/components/what-if-simulator";
import Link from "next/link";

export default async function WhatIfPage() {
  const user = await requireUser(true);

  let cycle = await prisma.pocketMoneyCycle.findFirst({
    where: { userId: user.id, status: "active" },
    include: { incomes: true },
  });

  if (!cycle) {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);

    cycle = await prisma.pocketMoneyCycle.create({
      data: {
        userId: user.id,
        label: "Current Cycle",
        startDate: now,
        endDate: nextMonth,
        expectedAmount: 0,
        frequency: "monthly",
        emergencyReserveAmount: 0,
        status: "active",
      },
      include: { incomes: true },
    });
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.id, archivedAt: null },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
  });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
  });

  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: {
      userId: user.id,
      active: true,
    },
  });

  const balance = calculateCycleBalance({
    accounts,
    cycle,
    transactions: transactions as any,
    goals,
    recurringExpenses,
  });

  const safeToSpend = calculateSafeToSpend({
    availableBalance: balance.availableBalance,
    cycleEndDate: cycle.endDate,
    today: new Date(),
    emergencyReserve: cycle.emergencyReserveAmount,
    upcomingExpenses: balance.upcomingExpenses,
  });

  const totalMonthlyRecurring = recurringExpenses.reduce((acc, r) => acc + r.amount, 0);

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">What-If Simulator</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Model financial scenarios, income gigs & spending cuts
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-semibold bg-surface-container text-primary px-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Dashboard
        </Link>
      </div>

      <WhatIfSimulator
        currentBalance={balance.availableBalance}
        currentSafeToSpend={safeToSpend.safeToSpendToday}
        daysRemaining={safeToSpend.daysRemaining}
        emergencyReserve={cycle.emergencyReserveAmount}
        currentMonthlyRecurring={totalMonthlyRecurring}
      />
    </main>
  );
}
