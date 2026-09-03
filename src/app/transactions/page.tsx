import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TransactionHistory } from "@/components/transaction-history";
import Link from "next/link";

export default async function TransactionsPage() {
  const user = await requireUser();

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-container-padding pt-6 pb-24 flex flex-col gap-section-gap">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background font-bold">Transaction History</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">All your logged expenses & incomes</p>
        </div>
        <Link 
          href="/add" 
          className="bg-primary text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New
        </Link>
      </div>

      <TransactionHistory initialTransactions={transactions} />
    </main>
  );
}
