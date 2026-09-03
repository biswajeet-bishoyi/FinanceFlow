import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { calculateCycleBalance } from "@/domain/cycle-balance";
import { AffordabilityCalculator } from "@/components/affordability-calculator";
import Link from "next/link";

export default async function AffordPage() {
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

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Can I Afford This?</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Simulate a purchase before spending your pocket money
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

      <AffordabilityCalculator
        availableBalance={balance.availableBalance}
        safeToSpendToday={safeToSpend.safeToSpendToday}
        daysRemaining={safeToSpend.daysRemaining}
        emergencyReserve={cycle.emergencyReserveAmount}
      />
    </main>
  );
}
