import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import { BurnRateChart } from "@/components/charts/burn-rate-chart";
import { CategoryDonutChart } from "@/components/charts/category-donut-chart";
import Link from "next/link";

export default async function AnalyticsPage() {
  const user = await requireUser();
  

  const cycle = await prisma.pocketMoneyCycle.findFirst({
    where: { userId: user.id, status: "active" },
    include: { incomes: true },
  });

  if (!cycle) return <div className="p-4">No active cycle</div>;

  const accounts = await prisma.account.findMany({
    where: { userId: user.id, archivedAt: null },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      occurredAt: { gte: cycle.startDate, lte: cycle.endDate },
    },
    include: { category: true },
    orderBy: { occurredAt: "asc" },
  });

  // Calculate Starting Balance for cycle
  let startingBalance = accounts.reduce((acc, account) => acc + account.startingBalance, 0);
  const totalIncome = cycle.incomes.reduce((acc, inc) => acc + inc.amount, 0);
  startingBalance += totalIncome;

  // Generate Burn Rate Data
  const diffTime = cycle.endDate.getTime() - cycle.startDate.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const burnRateData = [];
  let runningBalance = startingBalance;
  
  // Calculate daily ideal drop
  const spendableTarget = startingBalance - cycle.emergencyReserveAmount;
  const idealDailyDrop = spendableTarget / totalDays;

  const today = new Date();
  
  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(cycle.startDate);
    date.setDate(date.getDate() + i);
    
    // Only plot actual balance up to today
    if (date.getTime() <= today.getTime()) {
      // Find expenses for this specific day
      const dayExpenses = transactions.filter(t => {
        const tDate = new Date(t.occurredAt);
        return t.type === 'expense' && 
               tDate.getDate() === date.getDate() && 
               tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear();
      }).reduce((acc, t) => acc + t.amount, 0);
      
      runningBalance -= dayExpenses;
    }

    const idealBalance = Math.max(cycle.emergencyReserveAmount, startingBalance - (idealDailyDrop * i));

    burnRateData.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      idealBalance,
      actualBalance: date.getTime() <= today.getTime() ? runningBalance : runningBalance, // Could be null for future if we want to stop line
    });
  }

  // Generate Category Donut Data
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalSpent = expenses.reduce((acc, t) => acc + t.amount, 0);
  
  const categoryMap = new Map<string, { amount: number, color: string }>();
  
  // Material You categorical colors — pulled from design tokens (no hex literals in pages)
  const colors = [
    "var(--color-secondary)",
    "var(--color-on-secondary-fixed-variant)",
    "var(--color-secondary-fixed-dim)",
    "var(--color-primary-fixed-dim)",
    "var(--color-on-background)",
    "var(--color-on-primary-container)",
  ];
  
  expenses.forEach(t => {
    const catName = t.category.name;
    if (categoryMap.has(catName)) {
      categoryMap.get(catName)!.amount += t.amount;
    } else {
      categoryMap.set(catName, { 
        amount: t.amount, 
        color: colors[categoryMap.size % colors.length] 
      });
    }
  });

  const donutData = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color
  })).sort((a, b) => b.amount - a.amount);

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Analytics</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{cycle.label}</p>
        </div>
      </header>

      {/* Burn Rate Chart */}
      <section>
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">BURN RATE TRAJECTORY</h2>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
          <div className="flex justify-between font-body-sm text-body-sm mb-2">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div> Actual Balance</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-dashed border-secondary"></div> Safe Target</span>
          </div>
          <BurnRateChart data={burnRateData} />
        </div>
      </section>

      {/* Category Breakdown */}
      <section>
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">SPENDING BY CATEGORY</h2>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
          {totalSpent === 0 ? (
            <div className="text-center py-8 text-on-surface-variant font-body-sm">No expenses this cycle yet.</div>
          ) : (
            <>
              <CategoryDonutChart data={donutData} totalSpent={totalSpent} />
              
              <div className="mt-6 flex flex-col gap-3">
                {donutData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-body-md text-body-md text-on-surface">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{Math.round((item.amount / totalSpent) * 100)}%</span>
                      <span className="font-currency-sm text-currency-sm text-on-surface">₹{(item.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
