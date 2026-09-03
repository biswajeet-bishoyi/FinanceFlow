import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { calculateCycleBalance } from "@/domain/cycle-balance";
import { calculateGamificationScore } from "@/domain/gamification";
import { GamificationDashboard } from "@/components/gamification-dashboard";
import Link from "next/link";

export default async function AchievementsPage() {
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

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
  });

  const friends = await prisma.person.findMany({
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

  const gamificationData = calculateGamificationScore({
    transactionsCount: transactions.length,
    hasEmergencyReserve: cycle.emergencyReserveAmount > 0,
    hasGoals: goals.length > 0,
    goalContributionsCount: goals.filter((g) => g.currentAmount > 0).length,
    hasBudgets: budgets.length > 0,
    hasFriends: friends.length > 0,
    availableBalance: balance.availableBalance,
    safeToSpendToday: safeToSpend.safeToSpendToday,
  });

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Health & Badges</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Your financial health score, streaks, and milestone achievements
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

      <GamificationDashboard data={gamificationData} />
    </main>
  );
}
