import { prisma } from "@/lib/db";
import { addExpense } from "@/app/actions/transaction";
import { redirect } from "next/navigation";

export default async function AddExpensePage() {
  const user = await prisma.user.findFirst();
  if (!user) return <div className="p-4">No user found</div>;

  const categories = await prisma.category.findMany({
    where: { isSystemDefault: true },
    take: 8,
  });

  const friends = await prisma.person.findMany({
    where: { userId: user.id },
  });

  return (
    <main className="flex-grow px-container-padding py-section-gap pb-28 md:pb-section-gap max-w-3xl mx-auto w-full pt-6">
      <form action={async (formData) => {
        "use server";
        const res = await addExpense(formData);
        if (res.success) {
          redirect("/");
        }
      }} className="flex flex-col gap-section-gap">
        {/* Amount Input */}
        <div className="flex flex-col items-center justify-center py-8">
          <span className="font-currency-sm text-currency-sm text-on-surface-variant mb-2 tracking-widest">AMOUNT</span>
          <div className="relative flex items-center justify-center">
            <span className="absolute left-0 font-display-currency text-display-currency text-on-surface-variant mr-2 opacity-50">$</span>
            <input 
              name="amount"
              className="bg-transparent border-none text-center font-display-currency text-display-currency text-primary w-full focus:ring-0 focus:outline-none placeholder:text-surface-tint pl-8" 
              placeholder="0.00" 
              required 
              type="number" 
              step="0.01"
            />
          </div>
        </div>

        {/* Category Grid */}
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">CATEGORY</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
              <label key={cat.id} className="cursor-pointer group flex flex-col items-center gap-2">
                <input className="peer sr-only" name="categoryId" type="radio" value={cat.id} defaultChecked={idx === 0} required />
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:ring-2 peer-checked:ring-secondary peer-checked:ring-offset-2 transition-all hover:bg-surface-container-high">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cat.icon || "receipt"}
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
            {/* Date Picker */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide" htmlFor="date">DATE</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <input 
                  className="bg-[#F1F5F9] border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors" 
                  id="date" 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide" htmlFor="note">NOTE (OPTIONAL)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <input 
                  className="bg-[#F1F5F9] border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors placeholder:text-outline-variant" 
                  id="note" 
                  name="note" 
                  placeholder="What was this for?" 
                  type="text"
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
                    className="bg-[#F1F5F9] border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors appearance-none"
                  >
                    <option value="">Just me</option>
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
        <button 
          className="mt-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-4 px-6 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 active:scale-[0.98] transition-all border-t border-white/20" 
          type="submit"
        >
          Save Transaction
        </button>
      </form>
    </main>
  );
}
