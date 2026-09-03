import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import { createGoal, addContribution, deleteGoal } from "@/app/actions/goal";

export default async function GoalsPage() {
  const user = await requireUser();

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Savings Goals</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Stash money away for big milestones</p>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">TOTAL SAVED</span>
              <span className="font-currency-sm text-currency-sm text-secondary font-bold text-lg">
                {formatMoney(totalSaved)}
              </span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">TOTAL TARGET</span>
              <span className="font-currency-sm text-currency-sm text-on-surface font-bold text-lg">
                {formatMoney(totalTarget)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Goal List */}
      <section className="flex flex-col gap-stack-gap">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant tracking-wide uppercase">YOUR GOALS ({goals.length})</h2>
        {goals.length === 0 ? (
          <div className="text-center py-8 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">savings</span>
            <p className="text-on-surface-variant">No savings goals created yet. Set a goal below to start stashing!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progressPct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const isCompleted = progressPct >= 100;
            
            return (
              <div key={goal.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-secondary-container text-secondary" : "bg-primary-fixed text-primary"}`}>
                      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {goal.icon || (isCompleted ? "check_circle" : "savings")}
                      </span>
                    </div>
                    <div>
                      <span className="font-headline-md text-headline-md text-on-surface font-semibold">{goal.name}</span>
                      <div className="flex gap-2 font-body-sm text-body-sm text-on-surface-variant">
                        <span>{formatMoney(goal.currentAmount)}</span>
                        <span>/</span>
                        <span>{formatMoney(goal.targetAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-currency-sm text-currency-sm font-bold ${isCompleted ? "text-secondary" : "text-primary"}`}>
                      {Math.round(progressPct)}%
                    </span>
                    <form action={async (formData: FormData) => {
                      "use server";
                      await deleteGoal(formData);
                    }}>
                      <input type="hidden" name="id" value={goal.id} />
                      <button type="submit" title="Delete goal" className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </form>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-secondary" : "bg-primary"}`} 
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>

                {!isCompleted ? (
                  <form action={async (formData: FormData) => {
                    "use server";
                    await addContribution(formData);
                  }} className="flex gap-2 pt-1">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                      <input 
                        type="number" 
                        name="amount" 
                        placeholder="Add stash amount" 
                        step="0.01"
                        min="0.01"
                        className="w-full h-10 pl-8 pr-4 bg-input-bg rounded-lg border-0 focus:ring-1 focus:ring-primary text-body-sm" 
                        required 
                      />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-medium rounded-lg text-body-sm hover:opacity-90 transition-opacity active:scale-95">
                      Stash
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-secondary font-bold font-body-sm bg-secondary-container/20 py-2 rounded-lg border border-secondary-container">
                    Target achieved! Great job saving 🎉
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Add New Goal */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide uppercase">CREATE SAVINGS GOAL</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createGoal(formData);
        }} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">GOAL NAME</label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g., Goa Trip, New Headphones, Semester Books" 
              className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              required 
            />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">TARGET AMOUNT</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input 
                type="number" 
                name="targetAmount" 
                placeholder="5000.00" 
                step="0.01" 
                min="0.01"
                className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">ICON</label>
            <select name="icon" className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors">
              <option value="savings">💰 Savings / Money</option>
              <option value="flight">✈️ Travel / Trip</option>
              <option value="headphones">🎧 Electronics / Gadget</option>
              <option value="school">🎓 College / Education</option>
              <option value="shopping_bag">🛍️ Shopping / Gear</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-3 px-6 mt-1 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            Start Saving
          </button>
        </form>
      </section>
    </main>
  );
}
