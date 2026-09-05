import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import { createBudget, deleteBudget, createDemoBudget } from "@/app/actions/budget";
import { getCategoryIcon } from "@/lib/icons";

export default async function BudgetsPage() {
  const user = await requireUser();

  const [initialCycle, allCategories, budgets, allExpenseTransactions] = await Promise.all([
    prisma.pocketMoneyCycle.findFirst({
      where: { userId: user.id, status: "active" },
    }),
    prisma.category.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isSystemDefault: true },
        ],
      },
      orderBy: { name: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { amount: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "expense",
      },
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
        status: "active",
      },
    });
  }

  const categoryMap = new Map<string, typeof allCategories[0]>();
  for (const cat of allCategories) {
    const key = cat.name.trim().toLowerCase();
    if (!categoryMap.has(key) || cat.userId === user.id) {
      categoryMap.set(key, cat);
    }
  }
  const categories = Array.from(categoryMap.values());

  const transactions = allExpenseTransactions.filter(
    (t) => t.occurredAt >= cycle.startDate && t.occurredAt <= cycle.endDate
  );

  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalLimit = budgets.reduce((acc, b) => acc + b.amount, 0);
  const globalProgress = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;
  const remaining = totalLimit - totalSpent;

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Category Budgets</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{cycle.label}</p>
          </div>
          {totalLimit > 0 && (
            <div className="text-right">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Remaining Limit</p>
              <p className="font-currency-sm text-currency-sm text-secondary font-bold">{formatMoney(remaining > 0 ? remaining : 0)}</p>
            </div>
          )}
        </div>

        {/* Global Budget Progress */}
        {totalLimit > 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-4 flex flex-col gap-2">
            <div className="flex justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant">Total Spent: <strong className="text-on-surface">{formatMoney(totalSpent)}</strong></span>
              <span className="text-on-surface-variant">Total Budgeted: <strong className="text-on-surface">{formatMoney(totalLimit)}</strong></span>
            </div>
            <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${globalProgress >= 95 ? "bg-error" : globalProgress >= 80 ? "bg-warning-amber" : "bg-primary"}`}
                style={{ width: `${globalProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {/* Budget List */}
      <section className="flex flex-col gap-stack-gap">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant tracking-wide">ACTIVE BUDGETS ({budgets.length})</h2>
        {budgets.length === 0 ? (
          <div className="text-center p-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-outline text-[40px]">pie_chart</span>
            <p className="text-on-surface-variant">You haven't set any category budgets yet.</p>
            <form action={async () => {
              "use server";
              await createDemoBudget();
            }}>
              <button type="submit" className="px-5 py-2.5 bg-primary text-on-primary font-body-sm text-body-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
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
            let statusIconBg = "bg-secondary-container/30";
            
            if (progressPct >= budget.warningThresholdPct) {
              statusColor = "bg-warning-amber";
              statusIconColor = "text-warning-amber";
              statusIconBg = "bg-warning-amber/20";
            }
            if (progressPct >= budget.cautionThresholdPct) {
              statusColor = "bg-error";
              statusIconColor = "text-error";
              statusIconBg = "bg-error-container/30";
            }

            return (
              <div key={budget.id} className={`bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-4 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 duration-200 ${progressPct >= budget.cautionThresholdPct ? 'border-error-container' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${statusIconBg}`}>
                    <span className={`material-symbols-outlined ${statusIconColor} text-[22px]`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getCategoryIcon(budget.category?.icon, budget.category?.name)}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 truncate">
                        {budget.category ? budget.category.name : "Overall Cycle Budget"}
                        {progressPct >= budget.cautionThresholdPct && (
                          <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-currency-sm text-currency-sm font-bold ${progressPct >= budget.cautionThresholdPct ? 'text-error' : progressPct >= budget.warningThresholdPct ? 'text-warning-amber' : 'text-on-surface'}`}>
                          {Math.round(progressPct)}%
                        </span>
                        <form action={async (formData: FormData) => {
                          "use server";
                          await deleteBudget(formData);
                        }}>
                          <input type="hidden" name="id" value={budget.id} />
                          <button type="submit" title="Delete budget" className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </form>
                      </div>
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

      {/* Add New Budget */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide uppercase">SET NEW BUDGET</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createBudget(formData);
        }} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">CATEGORY</label>
            <select 
              name="categoryId" 
              className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
            >
              <option value="">Overall (All Categories)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">MONTHLY LIMIT</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input 
                type="number" 
                name="amount" 
                placeholder="2000.00" 
                step="1"
                min="1"
                className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">WARNING AT (%)</label>
              <input 
                type="number" 
                name="warningThresholdPct" 
                defaultValue="80"
                min="1"
                max="100"
                className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">CRITICAL AT (%)</label>
              <input 
                type="number" 
                name="cautionThresholdPct" 
                defaultValue="95"
                min="1"
                max="100"
                className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-3 px-6 mt-2 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            Save Budget
          </button>
        </form>
      </section>
    </main>
  );
}
