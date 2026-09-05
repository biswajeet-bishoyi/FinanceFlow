import { requireUser } from "@/lib/auth";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { calculateCycleBalance } from "@/domain/cycle-balance";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { DailySpendingChart } from "@/components/charts/daily-spending-chart";
import { HomeQuickActions } from "@/components/home-quick-actions";
import { startNewCycle } from "@/app/actions/cycle";
import { getCategoryIcon } from "@/lib/icons";
import { generateSmartInsights } from "@/domain/insights";

export default async function Home() {
  const user = await requireUser(true);

  const [initialCycle, rawAccounts, transactions, goals, allRecurring] = await Promise.all([
    prisma.pocketMoneyCycle.findFirst({
      where: { userId: user.id, status: "active" },
      include: { incomes: true },
    }),
    prisma.account.findMany({
      where: { userId: user.id, archivedAt: null },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.savingsGoal.findMany({
      where: { userId: user.id },
    }),
    prisma.recurringExpense.findMany({
      where: { userId: user.id, active: true },
    }),
  ]);

  let cycle = initialCycle;
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

  let accounts = rawAccounts;
  if (accounts.length === 0) {
    const defaultAcc = await prisma.account.create({
      data: {
        userId: user.id,
        name: "Cash",
        type: "cash",
        startingBalance: 0,
      },
    });
    accounts = [defaultAcc];
  }

  const now = new Date();
  const recurringExpenses = allRecurring.filter(
    (r) => r.nextDueAt && r.nextDueAt <= cycle.endDate && r.nextDueAt >= now
  );

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

  const today = new Date();
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toLocaleDateString("en-IN", { weekday: "short" });
    const isToday = i === 6;

    const amount = transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const tDate = new Date(t.occurredAt);
        return tDate.getDate() === date.getDate() && tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      })
      .reduce((acc, t) => acc + t.amount, 0);

    return { day: dayStr, amount, isToday };
  });

  const smartInsights = generateSmartInsights({
    transactions: transactions.map((t) => ({
      amount: t.amount,
      type: t.type,
      occurredAt: t.occurredAt,
      category: t.category ? { name: t.category.name } : undefined,
    })),
    cycle: {
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      emergencyReserveAmount: cycle.emergencyReserveAmount,
      expectedAmount: cycle.expectedAmount,
    },
    safeToSpendToday: safeToSpend.safeToSpendToday,
    daysRemaining: safeToSpend.daysRemaining,
    availableBalance: balance.availableBalance,
  });

  return (
    <main className="px-container-padding py-6 pb-24 flex flex-col gap-section-gap max-w-md mx-auto md:max-w-3xl">
      {/* Total Balance & Safe to Spend Hero Section */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-[0px_8px_24px_rgba(15,23,42,0.06)] p-6 relative overflow-hidden border border-surface-container-high">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-secondary-container/40 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-1">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">SAFE TO SPEND TODAY</p>
          <Link
            href="/settings"
            title="Configure Cycle Start Date"
            className="font-label-caps text-xs bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface font-semibold flex items-center gap-1 transition-colors"
          >
            <span>{safeToSpend.daysRemaining} days left</span>
            <span className="material-symbols-outlined text-[14px]">tune</span>
          </Link>
        </div>

        {/* Hero Dominant Safe-to-Spend Number */}
        <h2 className="font-display-currency text-display-currency text-secondary mb-1">
          {formatMoney(safeToSpend.safeToSpendToday)}
          <span className="text-body-sm font-normal text-on-surface-variant font-body-sm ml-2">/ day</span>
        </h2>

        <div className="flex items-center gap-4 text-body-sm text-on-surface-variant mb-5">
          <span>Total Balance: <strong className="text-on-surface">{formatMoney(safeToSpend.availableBalance)}</strong></span>
          {cycle.emergencyReserveAmount > 0 && (
            <span>• Reserve: <strong className="text-secondary">{formatMoney(cycle.emergencyReserveAmount)}</strong></span>
          )}
        </div>

        {/* Working Add Money & Transfer actions */}
        <HomeQuickActions accounts={accounts} />
      </section>

      {/* "Can I Afford This?" Simulator Banner */}
      <Link
        href="/afford"
        className="bg-secondary-container/20 hover:bg-secondary-container/35 border border-secondary/20 p-3.5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.99] -mt-3 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">calculate</span>
          </div>
          <div>
            <span className="font-body-sm text-xs font-bold text-on-surface block">Can I afford this?</span>
            <span className="font-label-caps text-[11px] text-on-surface-variant">Simulate how a purchase affects your daily runway</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-secondary text-[20px]">chevron_right</span>
      </Link>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-4 gap-2.5">
        <Link 
          href="/calendar" 
          className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high shadow-xs flex flex-col items-center gap-1 text-center hover:bg-surface-container-low transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
          <span className="font-body-sm text-xs text-on-surface font-semibold">Calendar</span>
          <span className="font-label-caps text-[9px] text-on-surface-variant">Day Spend</span>
        </Link>

        <Link 
          href="/friends" 
          className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high shadow-xs flex flex-col items-center gap-1 text-center hover:bg-surface-container-low transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
          <span className="font-body-sm text-xs text-on-surface font-semibold">Friends</span>
          <span className="font-label-caps text-[9px] text-on-surface-variant">Splits</span>
        </Link>

        <Link 
          href="/recurring" 
          className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high shadow-xs flex flex-col items-center gap-1 text-center hover:bg-surface-container-low transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-info-blue-bg text-info-blue flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">subscriptions</span>
          </div>
          <span className="font-body-sm text-xs text-on-surface font-semibold">Bills</span>
          <span className="font-label-caps text-[9px] text-on-surface-variant">Recurring</span>
        </Link>

        <Link 
          href="/settings" 
          className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high shadow-xs flex flex-col items-center gap-1 text-center hover:bg-surface-container-low transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-surface-container text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </div>
          <span className="font-body-sm text-xs text-on-surface font-semibold">Cycle</span>
          <span className="font-label-caps text-[9px] text-on-surface-variant">Set Start</span>
        </Link>
      </section>

      {/* Smart Insights Strip */}
      {smartInsights.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-xs text-on-surface-variant font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">auto_awesome</span>
              Smart Student Insights
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {smartInsights.slice(0, 2).map((insight) => (
              <div
                key={insight.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${insight.color}`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {insight.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="font-headline-md text-xs font-bold text-on-surface">{insight.title}</h4>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7-Day Spending Overview */}
      <section>
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-headline-md text-headline-md text-on-background font-bold">7-Day Spending</h3>
          <Link href="/analytics" className="font-label-caps text-label-caps text-secondary font-bold bg-secondary-container/20 px-3 py-1.5 rounded-full hover:bg-secondary-container/40 transition-colors">
            View Analytics
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-5">
          <DailySpendingChart data={last7DaysData} />
        </div>
      </section>

      {/* Emergency Reserve */}
      <section className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined text-secondary">health_and_safety</span>
              Emergency Reserve
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Set money aside. Safe-to-spend subtracts this upfront.
            </p>
          </div>
          <div className="font-currency-sm text-currency-sm text-secondary font-bold text-base">
            {formatMoney(cycle.emergencyReserveAmount)}
          </div>
        </div>
        <form action={async (formData: FormData) => {
          "use server";
          const { updateEmergencyReserve } = await import("@/app/actions/cycle");
          await updateEmergencyReserve(formData);
        }} className="flex gap-2 mt-1">
          <input type="hidden" name="cycleId" value={cycle.id} />
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
            <input 
              type="number" 
              name="amount" 
              placeholder="0.00" 
              defaultValue={cycle.emergencyReserveAmount ? (cycle.emergencyReserveAmount / 100).toString() : ""}
              className="w-full h-10 pl-8 pr-4 bg-input-bg rounded-lg border-0 focus:ring-1 focus:ring-primary text-body-md" 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-surface-container text-on-surface font-medium rounded-lg hover:bg-surface-container-high transition-colors active:scale-95 text-body-sm">
            Update
          </button>
        </form>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-headline-md text-headline-md text-on-background font-bold">Recent Transactions</h3>
          <Link href="/transactions" className="font-body-sm text-body-sm text-primary font-medium hover:underline">See All</Link>
        </div>
        <div className="flex flex-col gap-stack-gap">
          {transactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-secondary-container/30 text-secondary" : "bg-expense-warm-bg text-expense-warm"}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {tx.type === "income" ? "payments" : getCategoryIcon(tx.category?.icon, tx.category?.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-body-lg text-body-lg font-semibold text-on-background leading-tight truncate">
                  {tx.merchant || tx.notes || tx.category.name}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">
                  {tx.category.name} • {new Date(tx.occurredAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-currency-sm text-currency-sm ${tx.type === 'expense' ? 'text-on-background font-semibold' : 'text-secondary font-bold'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                </p>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-8 bg-surface-container-lowest rounded-xl border border-surface-container-high">
              <p className="text-on-surface-variant text-body-sm">No transactions yet. Tap "Add" below to log an expense.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
