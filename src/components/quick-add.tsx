"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { addExpense } from "@/app/actions/transaction";
import { toast } from "sonner";
import { Category, Person } from "@prisma/client";

export function QuickAdd({ categories, friends }: { categories: Category[], friends: Person[] }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [splitWith, setSplitWith] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("categoryId", selectedCategory);
    if (splitWith) formData.append("splitWith", splitWith);
    
    // Call server action
    const result = await addExpense(formData);
    
    if (result.success) {
      toast.success("Expense added");
      setOpen(false);
      setAmount("");
      setSelectedCategory(null);
      setSplitWith(null);
    } else {
      toast.error(result.error || "Failed to add expense");
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline px-4 py-1.5 hover:opacity-80 active:scale-95 transition-transform duration-150 relative -top-3">
          <div className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-[0px_8px_20px_rgba(15,23,42,0.15)] border-2 border-surface">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          </div>
          <span className="font-label-caps text-label-caps mt-1 sr-only">Add</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-background border-none max-h-[90vh]">
        <DrawerTitle className="sr-only">Add Expense</DrawerTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-section-gap px-container-padding py-6 max-w-md mx-auto w-full overflow-y-auto">
          
          {/* Amount Input */}
          <div className="flex flex-col items-center justify-center py-4">
            <span className="font-currency-sm text-currency-sm text-on-surface-variant mb-2 tracking-wide uppercase">Amount</span>
            <div className="relative flex items-center justify-center w-full">
              <span className="absolute left-1/4 font-display-currency text-display-currency text-on-surface-variant opacity-50">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none text-center font-display-currency text-display-currency text-primary w-full focus:ring-0 focus:outline-none placeholder:text-surface-tint" 
                placeholder="0.00" 
                required 
                autoFocus
              />
            </div>
          </div>

          {/* Category Grid */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
            <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-stack-gap tracking-wide">CATEGORY</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <label key={cat.id} className="cursor-pointer group flex flex-col items-center gap-2">
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat.id} 
                      className="peer sr-only" 
                      checked={isSelected}
                      onChange={() => setSelectedCategory(cat.id)}
                    />
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary ring-offset-2 shadow-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                        {cat.name === "Food" ? "restaurant" : cat.name === "Transport" ? "directions_car" : cat.name === "Shopping" ? "shopping_bag" : "receipt"}
                      </span>
                    </div>
                    <span className={`font-body-sm text-body-sm ${isSelected ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>{cat.name}</span>
                  </label>
                );
              })}
              {/* More */}
              <label className="cursor-pointer group flex flex-col items-center gap-2">
                <input type="radio" name="category" value="more" className="peer sr-only" />
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined">more_horiz</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">More</span>
              </label>
            </div>
          </section>

          {/* Details Section */}
          <section className="flex flex-col gap-stack-gap mb-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high flex flex-col gap-4">
              <div>
                <label htmlFor="note" className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide">NOTE (OPTIONAL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined">edit_note</span>
                  </div>
                  <input 
                    type="text" 
                    id="note" 
                    name="note" 
                    placeholder="What was this for?" 
                    className="bg-[#F1F5F9] border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full pl-10 p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors placeholder:text-outline-variant" 
                  />
                </div>
              </div>

              {friends.length > 0 && (
                <div>
                  <label htmlFor="splitWith" className="block font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-wide mt-2">SPLIT EQUALLY WITH (OPTIONAL)</label>
                  <select 
                    id="splitWith" 
                    value={splitWith || ""}
                    onChange={(e) => setSplitWith(e.target.value)}
                    className="bg-[#F1F5F9] border border-transparent text-primary text-body-lg rounded-lg focus:ring-0 focus:border-primary block w-full p-3 shadow-[inset_0_0_0_1px_#E2E8F0] transition-colors"
                  >
                    <option value="">Just me</option>
                    {friends.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <button type="submit" className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-4 px-6 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 active:scale-[0.98] transition-all border-t border-white/20 mb-8">
            Save Transaction
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
