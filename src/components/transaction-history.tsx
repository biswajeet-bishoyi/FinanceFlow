"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/format";
import { deleteTransaction } from "@/app/actions/transaction";
import { getCategoryIcon } from "@/lib/icons";
import { toast } from "sonner";

type TransactionItem = {
  id: string;
  type: string;
  amount: number;
  occurredAt: Date | string;
  merchant: string | null;
  notes: string | null;
  category: {
    name: string;
    icon: string;
    colorToken: string;
  };
};

export function TransactionHistory({ initialTransactions }: { initialTransactions: TransactionItem[] }) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (filterType !== "all" && tx.type !== filterType) {
      return false;
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (tx.merchant || "").toLowerCase().includes(q);
    const notesMatch = (tx.notes || "").toLowerCase().includes(q);
    const catMatch = (tx.category.name || "").toLowerCase().includes(q);
    return nameMatch || notesMatch || catMatch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    const prev = transactions;
    setTransactions((current) => current.filter((t) => t.id !== id));
    toast.success("Transaction deleted");

    const formData = new FormData();
    formData.append("id", id);
    const res = await deleteTransaction(formData);
    if (res && !res.success) {
      setTransactions(prev);
      toast.error(res.error || "Could not delete transaction");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filters */}
      <section className="flex flex-col gap-4">
        <div className="relative w-full">
          <span 
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" 
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            search
          </span>
          <input 
            className="w-full h-12 pl-12 pr-4 bg-input-bg rounded-lg border-0 focus:ring-1 focus:ring-primary-container text-body-lg placeholder:text-outline shadow-[inset_0_1px_2px_rgba(226,232,240,1)] transition-shadow" 
            placeholder="Search by merchant, note, or category..." 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button 
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-label-caps font-label-caps whitespace-nowrap transition-all ${
              filterType === "all"
                ? "bg-primary-container text-on-primary shadow-[0px_8px_20px_rgba(15,23,42,0.08)]"
                : "bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"
            }`}
          >
            All ({initialTransactions.length})
          </button>
          <button 
            type="button"
            onClick={() => setFilterType("income")}
            className={`px-4 py-2 rounded-full text-label-caps font-label-caps whitespace-nowrap transition-all ${
              filterType === "income"
                ? "bg-secondary text-on-secondary shadow-[0px_8px_20px_rgba(15,23,42,0.08)]"
                : "bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"
            }`}
          >
            Income
          </button>
          <button 
            type="button"
            onClick={() => setFilterType("expense")}
            className={`px-4 py-2 rounded-full text-label-caps font-label-caps whitespace-nowrap transition-all ${
              filterType === "expense"
                ? "bg-primary-container text-on-primary shadow-[0px_8px_20px_rgba(15,23,42,0.08)]"
                : "bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"
            }`}
          >
            Expense
          </button>
        </div>
      </section>

      {/* Transaction List */}
      <section className="flex flex-col gap-stack-gap">
        <h3 className="font-currency-sm text-currency-sm text-outline uppercase tracking-wider pl-2">
          {filterType === "all" ? "All Transactions" : filterType === "income" ? "Income History" : "Expense History"} ({filteredTransactions.length})
        </h3>

        {filteredTransactions.map((tx) => (
          <div 
            key={tx.id} 
            className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex items-center gap-4 transition-all hover:shadow-md"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-secondary-container/30 text-secondary" : "bg-info-blue-bg text-info-blue"}`}>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {tx.type === "income" ? "payments" : getCategoryIcon(tx.category?.icon, tx.category?.name)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-body-lg text-body-lg font-semibold text-on-surface truncate">
                {tx.merchant || tx.notes || tx.category?.name}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {new Date(tx.occurredAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • {tx.category?.name}
                {tx.notes && tx.merchant && tx.notes !== tx.merchant ? ` • ${tx.notes}` : ""}
              </p>
            </div>

            <div className="text-right shrink-0 flex items-center gap-3">
              <div>
                <p className={`font-currency-sm text-currency-sm ${tx.type === "income" ? "text-secondary font-bold" : "text-on-surface font-semibold"}`}>
                  {tx.type === "income" ? "+" : "-"} {formatMoney(tx.amount)}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => handleDelete(tx.id)}
                disabled={deletingId === tx.id}
                title="Delete transaction"
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">receipt_long</span>
            <p className="text-on-surface-variant font-medium">No transactions found</p>
            <p className="text-outline text-xs mt-1">
              {searchQuery ? "Try a different search term" : "Log an expense or income to see it here"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
