import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addExpense, addIncome } from "@/app/actions/transaction";
import { getCategoryIcon } from "@/lib/icons";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function AddExpensePage() {
  const user = await requireUser();

  const [allCategories, friends] = await Promise.all([
    prisma.category.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isSystemDefault: true },
        ],
      },
      orderBy: { name: "asc" },
    }),
    prisma.person.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  // Deduplicate categories by name to prevent multiple 'Food', 'Transport', etc.
  const categoryMap = new Map<string, typeof allCategories[0]>();
  for (const cat of allCategories) {
    const key = cat.name.trim().toLowerCase();
    if (!categoryMap.has(key) || cat.userId === user.id) {
      categoryMap.set(key, cat);
    }
  }
  const categories = Array.from(categoryMap.values());

  return (
    <main className="flex-grow px-container-padding py-section-gap pb-28 md:pb-section-gap max-w-3xl mx-auto w-full pt-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Add Transaction</h1>
        </div>

        <form action={async (formData) => {
          "use server";
          const type = formData.get("txType") as string;
          if (type === "income") {
            await addIncome(formData);
          } else {
            await addExpense(formData);
          }
          redirect("/");
        }} className="flex flex-col gap-section-gap">
          
          {/* Transaction Type Radio Selector */}
          <div className="flex bg-input-bg p-1 rounded-xl w-full max-w-xs mx-auto">
            <label className="flex-1 text-center cursor-pointer">
              <input type="radio" name="txType" value="expense" defaultChecked className="peer sr-only" />
              <div className="py-2 rounded-lg text-body-sm font-medium text-on-surface-variant peer-checked:bg-white peer-checked:text-on-background peer-checked:shadow-sm transition-all">
                Expense
              </div>
            </label>
            <label className="flex-1 text-center cursor-pointer">
              <input type="radio" name="txType" value="income" className="peer sr-only" />
              <div className="py-2 rounded-lg text-body-sm font-medium text-on-surface-variant peer-checked:bg-secondary peer-checked:text-on-secondary peer-checked:shadow-sm transition-all">
                Income / Allowance
              </div>
            </label>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col items-center justify-center py-6">
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-widest uppercase">AMOUNT</span>
            <div className="relative flex items-center justify-center">
              <span className="absolute left-0 font-display-currency text-display-currency text-on-surface-variant mr-2 opacity-50">₹</span>
              <input 
                name="amount"
                className="bg-transparent border-none text-center font-display-currency text-display-currency text-primary w-full focus:ring-0 focus:outline-none placeholder:text-surface-tint pl-8" 
                placeholder="0.00" 
                required 
                type="number" 
                step="0.01"
                min="0.01"
                autoFocus
              />
            </div>
          </div>

          {/* Category Grid */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
            <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">CATEGORY</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {categories.map((cat, idx) => (
                <label key={cat.id} className="cursor-pointer group flex flex-col items-center gap-2">
                  <input className="peer sr-only" name="categoryId" type="radio" value={cat.id} defaultChecked={idx === 0} />
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:ring-2 peer-checked:ring-secondary peer-checked:ring-offset-2 transition-all hover:bg-surface-container-high">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getCategoryIcon(cat.icon, cat.name)}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant peer-checked:text-primary peer-checked:font-medium text-center w-full truncate text-xs">{cat.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Details Section */}
          <section className="flex flex-col gap-stack-gap">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex flex-col gap-4">
              {/* Note / Merchant Input */}
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide" htmlFor="note">NOTE / PLACE (OPTIONAL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined">edit_note</span>
                  </div>
                  <input 
                    className="bg-input-bg border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors placeholder:text-outline-variant" 
                    id="note" 
                    name="note" 
                    placeholder="e.g. Canteen lunch, Chai, Auto rickshaw" 
                    type="text"
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide" htmlFor="date">DATE</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <input 
                    className="bg-input-bg border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors" 
                    id="date" 
                    name="date" 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Split With */}
              {friends.length > 0 && (
                <div>
                  <label htmlFor="splitWith" className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide mt-2">SPLIT EQUALLY WITH (OPTIONAL)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined">group</span>
                    </div>
                    <select 
                      id="splitWith" 
                      name="splitWith"
                      className="bg-input-bg border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors appearance-none"
                    >
                      <option value="">Just me (No split)</option>
                      {friends.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Submit Button */}
          <SubmitButton 
            pendingText="Saving Transaction..."
            className="mt-2 bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-4 px-6 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 active:scale-[0.98] transition-all border-t border-white/20 cursor-pointer"
          >
            Save Transaction
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
