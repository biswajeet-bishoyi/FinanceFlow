import { requireUser } from "@/lib/auth";
import { calculateSafeToSpend } from "@/domain/safe-to-spend";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { DailySpendingChart } from "@/components/charts/daily-spending-chart";

export default async function Home() {
  const user = await requireUser(true);

  if (!user) {
    return <div className="p-4">No user found. Please run seed script.</div>;
  }

  const cycle = await prisma.pocketMoneyCycle.findFirst({
    where: { userId: user.id, status: "active" },
    include: { incomes: true },
  });

  if (!cycle) {
    return <div className="p-4">No active cycle found.</div>;
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.id, archivedAt: null },
    include: { transactions: true },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  let totalBalance = accounts.reduce((acc, account) => acc + account.startingBalance, 0);
  const totalIncome = cycle.incomes.reduce((acc, inc) => acc + inc.amount, 0);
  totalBalance += totalIncome;

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id }
  });
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  totalBalance -= (totalExpenses + totalSaved);

  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: { 
      userId: user.id, 
      active: true,
      nextDueAt: { lte: cycle.endDate, gte: new Date() }
    },
  });

  const totalUpcomingRecurring = recurringExpenses.reduce((acc, r) => acc + r.amount, 0);

  const safeToSpend = calculateSafeToSpend({
    availableBalance: totalBalance,
    cycleEndDate: cycle.endDate,
    today: new Date(),
    emergencyReserve: cycle.emergencyReserveAmount,
    upcomingExpenses: totalUpcomingRecurring,
  });

  const formatMoney = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

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

  return (
    <main className="px-container-padding py-6 flex flex-col gap-section-gap max-w-md mx-auto md:max-w-3xl">
      {/* Total Balance Section */}
      <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-6 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed opacity-30 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Total Balance</p>
        <h2 className="font-display-currency text-display-currency text-on-background mb-4">
          {formatMoney(safeToSpend.availableBalance)}
        </h2>
        
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
          Safe to spend today: <span className="font-bold text-secondary">{formatMoney(safeToSpend.safeToSpendToday)}</span>
        </p>

        <div className="flex gap-4">
          <button className="flex-1 bg-primary text-on-primary font-body-sm text-body-sm py-3 rounded-lg shadow-[0px_8px_20px_rgba(15,23,42,0.08)] flex items-center justify-center gap-2 transition-transform active:scale-95 border-t border-white/20">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Money
          </button>
          <button className="flex-1 border-[1.5px] border-outline text-on-surface font-body-sm text-body-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            Transfer
          </button>
        </div>
      </section>

      {/* Monthly Overview (Real Chart) */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-headline-md text-headline-md text-on-background">7-Day Overview</h3>
          <Link href="/analytics" className="font-label-caps text-label-caps text-secondary font-bold bg-secondary-container/20 px-3 py-1.5 rounded-full hover:bg-secondary-container/40 transition-colors">View Analytics</Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-6">
          <DailySpendingChart data={last7DaysData} />
        </div>
      </section>

      {/* Emergency Reserve */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">health_and_safety</span>
              Emergency Reserve
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-[250px]">
              Set money aside. Safe-to-spend will pretend this money doesn't exist.
            </p>
          </div>
          <div className="font-currency-sm text-currency-sm text-secondary font-bold">
            {formatMoney(cycle.emergencyReserveAmount)}
          </div>
        </div>
        <form action={async (formData: FormData) => {
          "use server";
          const { updateEmergencyReserve } = await import("@/app/actions/cycle");
          await updateEmergencyReserve(formData);
        }} className="flex gap-2 mt-2">
          <input type="hidden" name="cycleId" value={cycle.id} />
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
            <input 
              type="number" 
              name="amount" 
              placeholder="0.00" 
              defaultValue={cycle.emergencyReserveAmount ? (cycle.emergencyReserveAmount / 100).toString() : ""}
              className="w-full h-10 pl-8 pr-4 bg-[#F1F5F9] rounded-lg border-0 focus:ring-1 focus:ring-primary-container text-body-md" 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-surface-container text-on-surface font-medium rounded-lg hover:bg-surface-container-high transition-colors">
            Update
          </button>
        </form>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-md text-headline-md text-on-background">Recent Transactions</h3>
          <Link href="/transactions" className="font-body-sm text-body-sm text-primary hover:underline">See All</Link>
        </div>
        <div className="flex flex-col gap-stack-gap">
          {transactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF3E0] text-[#E65100] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {tx.category.name === "Food" ? "restaurant" : tx.category.name === "Transport" ? "directions_car" : tx.category.name === "Shopping" ? "shopping_bag" : "receipt"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-body-lg text-body-lg font-semibold text-on-background leading-tight truncate">{tx.merchant || tx.category.name}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">{tx.category.name} • {new Date(tx.occurredAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-currency-sm text-currency-sm ${tx.type === 'expense' ? 'text-on-background' : 'text-secondary font-bold'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
