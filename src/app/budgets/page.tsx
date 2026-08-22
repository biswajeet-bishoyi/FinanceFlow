import { prisma } from "@/lib/db";
import Link from "next/link";
import { createDemoBudget } from "@/app/actions/budget";

export default async function BudgetsPage() {
  const user = await prisma.user.findFirst();
  if (!user) return <div className="p-4">No user found</div>;

  const cycle = await prisma.pocketMoneyCycle.findFirst({
    where: { userId: user.id, status: "active" },
  });

  if (!cycle) return <div className="p-4">No active cycle</div>;

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    include: { category: true },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "expense",
      occurredAt: { gte: cycle.startDate, lte: cycle.endDate },
    },
  });

  const formatMoney = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalLimit = budgets.reduce((acc, b) => acc + b.amount, 0);
  const globalProgress = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;
  const remaining = totalLimit - totalSpent;

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Monthly Budgets</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{cycle.label}</p>
          </div>
          <div className="text-right">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Total Remaining</p>
            <p className="font-currency-sm text-currency-sm text-secondary font-bold">{formatMoney(remaining > 0 ? remaining : 0)}</p>
          </div>
        </div>

        {/* Global Budget Progress */}
        <div className="bg-surface-container-lowest rounded-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4 flex flex-col gap-2">
          <div className="flex justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Total Spent: {formatMoney(totalSpent)}</span>
            <span className="text-on-surface-variant">Total Limit: {formatMoney(totalLimit)}</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${globalProgress}%` }}></div>
          </div>
        </div>
      </section>

      {/* Budget List */}
      <section className="flex flex-col gap-stack-gap">
        {budgets.length === 0 ? (
          <div className="text-center p-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)]">
            <p className="text-on-surface-variant mb-4">You haven't set any budgets yet.</p>
            <form action={createDemoBudget}>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-medium rounded-full hover:opacity-90 transition-opacity">
                Create a demo "Food" budget
              </button>
            </form>
          </div>
        ) : (
          budgets.map(budget => {
            const spent = transactions
              .filter(t => (budget.categoryId ? t.categoryId === budget.categoryId : true))
              .reduce((acc, t) => acc + t.amount, 0);

            const progressPct = Math.min(100, (spent / budget.amount) * 100);
            
            let statusColor = "bg-secondary"; // Safe
            let statusIconColor = "text-secondary";
            let statusIconBg = "bg-secondary-container bg-opacity-20";
            
            if (progressPct >= budget.warningThresholdPct) {
              statusColor = "bg-[#f59e0b]";
              statusIconColor = "text-[#f59e0b]";
              statusIconBg = "bg-[#f59e0b] bg-opacity-20";
            }
            if (progressPct >= budget.cautionThresholdPct) {
              statusColor = "bg-error";
              statusIconColor = "text-error";
              statusIconBg = "bg-error-container bg-opacity-30";
            }

            return (
              <div key={budget.id} className={`bg-surface-container-lowest rounded-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-200 ${progressPct >= budget.cautionThresholdPct ? 'border border-error-container' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusIconBg}`}>
                    <span className={`material-symbols-outlined ${statusIconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {budget.category?.name === "Food" ? "restaurant" : budget.category?.name === "Transport" ? "directions_car" : "shopping_bag"}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                        {budget.category ? budget.category.name : "Overall"}
                        {progressPct >= budget.cautionThresholdPct && (
                          <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                        )}
                      </span>
                      <span className={`font-currency-sm text-currency-sm ${progressPct >= budget.cautionThresholdPct ? 'text-error' : progressPct >= budget.warningThresholdPct ? 'text-[#f59e0b]' : 'text-on-surface'}`}>
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>{formatMoney(spent)} spent</span>
                      <span>{formatMoney(budget.amount)} limit</span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-1">
                  <div className={`h-full rounded-full transition-all duration-500 ${statusColor}`} style={{ width: `${progressPct}%` }}></div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
