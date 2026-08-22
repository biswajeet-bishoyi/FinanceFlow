import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TransactionsPage() {
  const user = await requireUser();
  

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  const formatMoney = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-container-padding pt-6 pb-6 flex flex-col gap-section-gap">
      {/* Header & Search */}
      <section className="flex flex-col gap-4">
        <h2 className="font-headline-md text-headline-md text-on-background">Transaction History</h2>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
          <input className="w-full h-12 pl-12 pr-4 bg-[#F1F5F9] rounded-lg border-0 focus:ring-1 focus:ring-primary-container text-body-lg placeholder:text-outline shadow-[inset_0_1px_2px_rgba(226,232,240,1)] transition-shadow" placeholder="Search transactions..." type="text" />
        </div>
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-label-caps font-label-caps whitespace-nowrap shadow-[0px_8px_20px_rgba(15,23,42,0.08)]">All</button>
          <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant text-label-caps font-label-caps whitespace-nowrap hover:bg-surface-container-high transition-colors">Income</button>
          <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant text-label-caps font-label-caps whitespace-nowrap hover:bg-surface-container-high transition-colors">Expense</button>
        </div>
      </section>

      {/* Transaction List */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-stack-gap">
          <h3 className="font-currency-sm text-currency-sm text-outline uppercase tracking-wider pl-2">All Transactions</h3>
          
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-surface-container-lowest rounded-lg p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-secondary-container' : 'bg-[#E3F2FD]'}`}>
                <span className={`material-symbols-outlined ${tx.type === 'income' ? 'text-on-secondary-container' : 'text-[#1976D2]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {tx.type === 'income' ? 'payments' : tx.category.name === "Food" ? "restaurant" : tx.category.name === "Transport" ? "local_taxi" : "receipt"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-lg text-body-lg text-on-surface truncate">{tx.merchant || tx.category.name}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{new Date(tx.occurredAt).toLocaleDateString()} • {tx.category.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-currency-sm text-currency-sm ${tx.type === 'income' ? 'text-secondary font-bold' : 'text-on-surface'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatMoney(tx.amount)}
                </p>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="text-on-surface-variant text-center py-8">No transactions found.</p>
          )}
        </div>
      </section>
    </main>
  );
}
