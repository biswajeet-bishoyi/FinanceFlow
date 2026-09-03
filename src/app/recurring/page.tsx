import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import { createRecurringExpense, deleteRecurringExpense } from "@/app/actions/recurring";

export default async function RecurringPage() {
  const user = await requireUser();

  const allCategories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { isSystemDefault: true }] },
    orderBy: { name: "asc" }
  });

  const categoryMap = new Map<string, typeof allCategories[0]>();
  for (const cat of allCategories) {
    const key = cat.name.trim().toLowerCase();
    if (!categoryMap.has(key) || cat.userId === user.id) {
      categoryMap.set(key, cat);
    }
  }
  const categories = Array.from(categoryMap.values());

  const recurring = await prisma.recurringExpense.findMany({
    where: { userId: user.id, active: true },
    include: { category: true },
    orderBy: { nextDueAt: "asc" },
  });

  const totalMonthlyRecurring = recurring.reduce((acc, r) => acc + r.amount, 0);

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Subscriptions & Bills</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Automated fixed recurring expenses</p>
          </div>
        </div>

        {recurring.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex justify-between items-center">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant block">TOTAL RECURRING / MONTH</span>
              <span className="font-currency-sm text-currency-sm text-primary font-bold text-lg">
                {formatMoney(totalMonthlyRecurring)}
              </span>
            </div>
            <span className="font-label-caps text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant">
              {recurring.length} active
            </span>
          </div>
        )}
      </section>

      {/* Recurring List */}
      <section className="flex flex-col gap-stack-gap">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant tracking-wide uppercase">ACTIVE SUBSCRIPTIONS ({recurring.length})</h2>
        {recurring.length === 0 ? (
          <div className="text-center py-8 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">subscriptions</span>
            <p className="text-on-surface-variant">No active subscriptions. Add your recurring bills (Netflix, Wi-Fi, Mess fee) below.</p>
          </div>
        ) : (
          recurring.map((item) => (
            <div key={item.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-info-blue-bg text-info-blue">
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.category?.icon || (item.category?.name === "Food" ? "restaurant" : "subscriptions")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-headline-md text-on-surface font-semibold truncate">{item.label}</span>
                      <span className="capitalize text-[11px] font-label-caps px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        {item.recurrenceRule}
                      </span>
                    </div>
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      <span>Next Due: {new Date(item.nextDueAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-currency-sm text-currency-sm font-bold text-on-surface">
                    {formatMoney(item.amount)}
                  </span>
                  <form action={async (formData: FormData) => {
                    "use server";
                    await deleteRecurringExpense(formData);
                  }}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" title="Delete subscription" className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add New Recurring */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide uppercase">ADD SUBSCRIPTION / BILL</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createRecurringExpense(formData);
        }} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">NAME</label>
            <input 
              type="text" 
              name="label" 
              placeholder="e.g. Spotify, WiFi Bill, Mess Fee, Rent" 
              className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">AMOUNT</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="199.00" 
                  step="0.01" 
                  min="0.01"
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">FREQUENCY</label>
              <select name="recurrenceRule" className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">CATEGORY</label>
              <select name="categoryId" className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" required>
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">NEXT DUE DATE</label>
              <input 
                type="date" 
                name="nextDueAt" 
                defaultValue={new Date().toISOString().split('T')[0]}
                className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-3 px-6 mt-1 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            Add Subscription
          </button>
        </form>
      </section>
    </main>
  );
}
