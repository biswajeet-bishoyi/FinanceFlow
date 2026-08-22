import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGoal, addContribution } from "@/app/actions/goal";

export default async function GoalsPage() {
  const user = await requireUser();
  

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { status: "asc" },
  });

  const formatMoney = (amount: number) => {
    return (amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
  };

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Savings Goals</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Stash money away for what matters.</p>
        </div>
      </section>

      {/* Goal List */}
      <section className="flex flex-col gap-stack-gap">
        {goals.map((goal) => {
          const progressPct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <div key={goal.id} className="bg-surface-container-lowest rounded-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary-container bg-opacity-20">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {goal.icon || "savings"}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-headline-md text-headline-md text-on-surface">{goal.name}</span>
                    <span className="font-currency-sm text-currency-sm text-secondary">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>{formatMoney(goal.currentAmount)} saved</span>
                    <span>{formatMoney(goal.targetAmount)} goal</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
              </div>

              {progressPct < 100 && (
                <form action={addContribution} className="mt-2 flex gap-2">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                    <input 
                      type="number" 
                      name="amount" 
                      placeholder="Amount to add" 
                      className="w-full h-10 pl-8 pr-4 bg-[#F1F5F9] rounded-lg border-0 focus:ring-1 focus:ring-primary-container text-body-md" 
                      required 
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-medium rounded-lg hover:opacity-90 transition-opacity">
                    Add
                  </button>
                </form>
              )}
              {progressPct >= 100 && (
                <div className="mt-2 text-center text-secondary font-bold font-body-sm bg-secondary-container bg-opacity-20 py-2 rounded-lg">
                  Goal reached! 🎉
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Add New Goal */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high mt-4">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">CREATE NEW GOAL</h2>
        <form action={createGoal} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">GOAL NAME</label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g., Goa Trip" 
              className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
              required 
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">TARGET AMOUNT</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input 
                type="number" 
                name="targetAmount" 
                placeholder="100.00" 
                className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                required 
              />
            </div>
          </div>
          <button type="submit" className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-3 px-6 mt-2 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all">
            Start Saving
          </button>
        </form>
      </section>
    </main>
  );
}
