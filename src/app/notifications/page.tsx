import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { calculateCycleBalance } from "@/domain/cycle-balance";
import { generateSystemNotifications } from "@/domain/notifications";
import { NotificationsView } from "@/components/notifications-view";
import Link from "next/link";

export default async function NotificationsPage() {
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
    include: { category: true },
  });

  const friends = await prisma.person.findMany({
    where: { userId: user.id },
    include: {
      lendingRecords: {
        where: { status: "open" },
      },
    },
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

  const notifications = generateSystemNotifications({
    safeToSpendToday: safeToSpend.safeToSpendToday,
    daysRemaining: safeToSpend.daysRemaining,
    recurringExpenses,
    budgets,
    transactions: transactions.map((t) => ({ amount: t.amount, categoryId: t.categoryId, type: t.type })),
    friends,
  });

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Notifications</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Real-time daily alerts, bill dues & budget thresholds
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

      <NotificationsView initialNotifications={notifications} />
    </main>
  );
}
