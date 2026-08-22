import { prisma } from "@/lib/db";
import { createRecurringExpense, cancelRecurringExpense } from "@/app/actions/recurring";

export default async function RecurringPage() {
  const user = await prisma.user.findFirst();
  if (!user) return <div className="p-4">No user found</div>;

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { isSystemDefault: true }] },
  });

  const recurring = await prisma.recurringExpense.findMany({
    where: { userId: user.id, active: true },
    include: { category: true },
    orderBy: { nextDueAt: "asc" },
  });

  const formatMoney = (amount: number) => {
    return (amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
  };

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-20">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Subscriptions</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage recurring expenses and bills.</p>
        </div>
      </section>

      {/* Recurring List */}
      <section className="flex flex-col gap-stack-gap">
        {recurring.length === 0 ? (
          <div className="text-center p-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)]">
            <p className="text-on-surface-variant mb-4">No active subscriptions.</p>
          </div>
        ) : (
          recurring.map((item) => (
            <div key={item.id} className="bg-surface-container-lowest rounded-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[#E3F2FD]">
                  <span className="material-symbols-outlined text-[#1976D2]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.category?.name === "Food" ? "restaurant" : item.category?.name === "Subscriptions" ? "subscriptions" : "receipt"}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-headline-md text-headline-md text-on-surface">{item.label}</span>
                    <span className="font-currency-sm text-currency-sm text-on-surface">{formatMoney(item.amount)}</span>
                  </div>
                  <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Due: {new Date(item.nextDueAt).toLocaleDateString()}</span>
                    <span className="capitalize">{item.recurrenceRule}</span>
                  </div>
                </div>
              </div>
              
              <form action={cancelRecurringExpense} className="border-t border-surface-container pt-3 flex justify-end">
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-error font-body-sm text-body-sm hover:underline">
                  Cancel Subscription
                </button>
              </form>
            </div>
          ))
        )}
      </section>

      {/* Add New Recurring */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high mt-4">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">ADD SUBSCRIPTION</h2>
        <form action={createRecurringExpense} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">NAME</label>
            <input 
              type="text" 
              name="label" 
              placeholder="e.g., Netflix, Spotify" 
              className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              required 
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">AMOUNT</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input 
                type="number" 
                name="amount" 
                placeholder="10.00" 
                className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                required 
              />
            </div>
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">CATEGORY</label>
            <select name="categoryId" className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" required>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">NEXT DUE DATE</label>
            <input 
              type="date" 
              name="nextDueAt" 
              className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              required 
            />
          </div>
          <button type="submit" className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-3 px-6 mt-2 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all">
            Add Subscription
          </button>
        </form>
      </section>
    </main>
  );
}
