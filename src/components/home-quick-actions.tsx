"use client";

import { useState } from "react";
import { addIncome, transferFunds } from "@/app/actions/transaction";
import { toast } from "sonner";

type AccountItem = {
  id: string;
  name: string;
  type: string;
  startingBalance: number;
};

export function HomeQuickActions({ accounts }: { accounts: AccountItem[] }) {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddMoney = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setShowAddMoney(false);
    const toastId = toast.loading("Adding money to balance...");
    setLoading(true);
    try {
      const result = await addIncome(formData);
      if (result.success) {
        toast.success("Money added to your balance", { id: toastId });
      } else {
        toast.error(result.error || "Could not add money", { id: toastId });
      }
    } catch {
      toast.error("Could not add money", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setShowTransfer(false);
    const toastId = toast.loading("Transferring funds...");
    setLoading(true);
    try {
      const result = await transferFunds(formData);
      if (result.success) {
        toast.success("Transfer complete", { id: toastId });
      } else {
        toast.error(result.error || "Could not transfer funds", { id: toastId });
      }
    } catch {
      toast.error("Could not transfer funds", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => setShowAddMoney(true)}
          className="flex-1 bg-primary text-on-primary font-body-sm text-body-sm py-3 rounded-lg shadow-[0px_8px_20px_rgba(15,23,42,0.08)] flex items-center justify-center gap-2 transition-transform active:scale-95 border-t border-white/20 hover:opacity-90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Money
        </button>
        <button 
          type="button"
          onClick={() => setShowTransfer(true)}
          className="flex-1 border-[1.5px] border-outline text-on-surface font-body-sm text-body-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-surface-container cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          Transfer
        </button>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl w-full max-w-md border border-surface-container-high animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Add Money / Allowance</h3>
              <button 
                type="button" 
                onClick={() => setShowAddMoney(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">AMOUNT</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                  <input 
                    type="number" 
                    name="amount" 
                    placeholder="2000.00" 
                    step="0.01" 
                    min="0.01"
                    className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                    required 
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">SOURCE / DESCRIPTION</label>
                <input 
                  type="text" 
                  name="note" 
                  placeholder="e.g. Monthly Pocket Money, Gift, Freelance" 
                  defaultValue="Pocket Money"
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
                />
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">SOURCE TYPE</label>
                <select 
                  name="sourceType" 
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
                >
                  <option value="pocket_money">Pocket Money (Parents)</option>
                  <option value="gift">Gift / Bonus</option>
                  <option value="freelance">Freelance / Gig</option>
                  <option value="scholarship">Scholarship / Stipend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">DATE RECEIVED</label>
                <input 
                  type="date" 
                  name="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddMoney(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-lg font-body-sm text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-on-primary font-body-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add to Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl w-full max-w-md border border-surface-container-high animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Transfer Between Accounts</h3>
              <button 
                type="button" 
                onClick={() => setShowTransfer(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {accounts.length < 2 ? (
              <div className="text-center py-6">
                <p className="text-on-surface-variant text-body-sm mb-4">
                  You need at least two accounts (e.g. Cash & Bank UPI) to transfer funds.
                </p>
                <button 
                  type="button" 
                  onClick={() => setShowTransfer(false)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm"
                >
                  Got it
                </button>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="flex flex-col gap-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">FROM ACCOUNT</label>
                  <select 
                    name="fromAccountId" 
                    className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">TO ACCOUNT</label>
                  <select 
                    name="toAccountId" 
                    defaultValue={accounts[1]?.id}
                    className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">AMOUNT</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                    <input 
                      type="number" 
                      name="amount" 
                      placeholder="500.00" 
                      step="0.01" 
                      min="0.01"
                      className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowTransfer(false)}
                    className="flex-1 py-3 border border-outline-variant rounded-lg font-body-sm text-on-surface hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 py-3 bg-primary text-on-primary font-body-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Transferring..." : "Complete Transfer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
