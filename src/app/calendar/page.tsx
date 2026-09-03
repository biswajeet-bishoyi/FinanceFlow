import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { calculateCycleBalance } from "@/domain/cycle-balance";
import { CycleCalendar } from "@/components/cycle-calendar";
import Link from "next/link";

export default async function CalendarPage() {
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
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
  });

  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: {
      userId: user.id,
      active: true,
    },
    include: { category: true },
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
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Cycle Calendar</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Visualize your cycle spend, incomes & upcoming bills
          </p>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-on-primary px-3.5 py-2 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Cycle Dates
        </Link>
      </div>

      <CycleCalendar
        cycle={{
          id: cycle.id,
          label: cycle.label,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          expectedAmount: cycle.expectedAmount,
          emergencyReserveAmount: cycle.emergencyReserveAmount,
        }}
        transactions={transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          occurredAt: t.occurredAt,
          merchant: t.merchant,
          notes: t.notes,
          category: {
            name: t.category?.name || "General",
            icon: t.category?.icon || "receipt",
            colorToken: t.category?.colorToken || "#006c49",
          },
        }))}
        recurringExpenses={recurringExpenses.map((r) => ({
          id: r.id,
          label: r.label,
          amount: r.amount,
          nextDueAt: r.nextDueAt,
          recurrenceRule: r.recurrenceRule,
          category: r.category
            ? {
                name: r.category.name,
                icon: r.category.icon,
              }
            : null,
        }))}
        safeToSpendToday={safeToSpend.safeToSpendToday}
        totalBalance={balance.availableBalance}
      />
    </main>
  );
}
