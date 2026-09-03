"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";

export function AffordabilityCalculator({
  availableBalance,
  safeToSpendToday,
  daysRemaining,
  emergencyReserve,
}: {
  availableBalance: number;
  safeToSpendToday: number;
  daysRemaining: number;
  emergencyReserve: number;
}) {
  const [purchaseAmountStr, setPurchaseAmountStr] = useState<string>("");

  const purchaseAmountPaise = Math.round((parseFloat(purchaseAmountStr) || 0) * 100);
  const newBalance = availableBalance - purchaseAmountPaise;
  const usableBalanceAfter = Math.max(0, newBalance - emergencyReserve);
  const newDailySafeToSpend = daysRemaining > 0 ? Math.floor(usableBalanceAfter / daysRemaining) : 0;
  const dailyReduction = Math.max(0, safeToSpendToday - newDailySafeToSpend);

  // Verdict logic
  let verdictColor = "text-secondary";
  let verdictBg = "bg-secondary-container/20 border-secondary";
  let verdictIcon = "check_circle";
  let verdictTitle = "Yes, safely affordable! 🎉";
  let verdictDesc = "This purchase fits comfortably inside your cycle's safe allowance.";

  if (purchaseAmountPaise > 0) {
    if (newBalance < 0) {
      verdictColor = "text-error";
      verdictBg = "bg-error-container/40 border-error";
      verdictIcon = "dangerous";
      verdictTitle = "Will cause a deficit! 🚨";
      verdictDesc = `Exceeds your total available balance by ${formatMoney(Math.abs(newBalance))}. Not recommended right now.`;
    } else if (newBalance < emergencyReserve) {
      verdictColor = "text-error";
      verdictBg = "bg-error-container/30 border-error/50";
      verdictIcon = "warning";
      verdictTitle = "Breaches your Emergency Reserve! ⚠️";
      verdictDesc = `Leaves only ${formatMoney(newBalance)}, eating into your ₹${(emergencyReserve / 100).toFixed(0)} reserve.`;
    } else if (newDailySafeToSpend < safeToSpendToday * 0.5) {
      verdictColor = "text-warning-amber";
      verdictBg = "bg-warning-amber/20 border-warning-amber";
      verdictIcon = "info";
      verdictTitle = "Tight squeeze! 📉";
      verdictDesc = `Your daily safe spend will drop from ${formatMoney(safeToSpendToday)} to ${formatMoney(newDailySafeToSpend)}/day for the next ${daysRemaining} days.`;
    } else {
      verdictColor = "text-secondary";
      verdictBg = "bg-secondary-container/20 border-secondary";
      verdictIcon = "verified";
      verdictTitle = "Yes, you can afford it! 👍";
      verdictDesc = `You will still have a comfortable ${formatMoney(newDailySafeToSpend)}/day to spend for the remaining ${daysRemaining} days.`;
    }
  }

  const presetPills = [150, 300, 500, 1000, 2000, 3500];

  return (
    <div className="flex flex-col gap-6">
      {/* Input Card */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">DECISION SIMULATOR</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">How much is it?</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Type an amount you want to spend to simulate its impact on your remaining days.
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[32px]">calculate</span>
        </div>

        {/* Input box */}
        <div className="relative flex items-center justify-center my-2">
          <span className="absolute left-4 font-display-currency text-display-currency text-on-surface-variant/40">₹</span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={purchaseAmountStr}
            onChange={(e) => setPurchaseAmountStr(e.target.value)}
            className="w-full text-center font-display-currency text-display-currency text-primary py-3 bg-[#F8FAFC] rounded-2xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-surface-tint"
            autoFocus
          />
        </div>

        {/* Preset quick test pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Quick test:</span>
          {presetPills.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setPurchaseAmountStr(amt.toString())}
              className="font-currency-sm text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </section>

      {/* Real-time Verdict Card */}
      {purchaseAmountPaise > 0 && (
        <section className={`p-5 rounded-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${verdictBg}`}>
          <div className="flex items-start gap-3">
            <span className={`material-symbols-outlined text-[28px] ${verdictColor} shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {verdictIcon}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className={`font-headline-md text-base font-bold ${verdictColor}`}>{verdictTitle}</h3>
              <p className="font-body-sm text-xs text-on-surface mt-1">{verdictDesc}</p>
            </div>
          </div>
        </section>
      )}

      {/* Simulation Breakdown Stats */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">SIMULATION IMPACT</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-surface-container flex flex-col">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Safe-To-Spend / Day</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-currency-sm text-currency-sm font-bold text-on-surface text-lg">
                {formatMoney(newDailySafeToSpend)}
              </span>
              {purchaseAmountPaise > 0 && (
                <span className="font-currency-sm text-xs text-error font-semibold">
                  (-{formatMoney(dailyReduction)})
                </span>
              )}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1">was {formatMoney(safeToSpendToday)}/day</span>
          </div>

          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-surface-container flex flex-col">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Balance After Purchase</span>
            <span className={`font-currency-sm text-currency-sm font-bold text-lg mt-1 ${newBalance < 0 ? "text-error" : "text-on-surface"}`}>
              {formatMoney(newBalance)}
            </span>
            <span className="text-[11px] text-on-surface-variant mt-1">current: {formatMoney(availableBalance)}</span>
          </div>

          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-surface-container flex flex-col">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Cycle Runway</span>
            <span className="font-currency-sm text-currency-sm font-bold text-primary text-lg mt-1">
              {daysRemaining} days remaining
            </span>
            <span className="text-[11px] text-on-surface-variant mt-1">
              Reserve: {formatMoney(emergencyReserve)}
            </span>
          </div>
        </div>

        {/* Action Button: Log directly if satisfied */}
        {purchaseAmountPaise > 0 && newBalance >= 0 && (
          <Link
            href={`/add?amount=${(purchaseAmountPaise / 100).toFixed(2)}`}
            className="mt-2 bg-primary text-on-primary font-semibold text-body-md py-3 px-6 rounded-xl text-center shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            Go Ahead & Log this Expense (₹{(purchaseAmountPaise / 100).toFixed(2)})
          </Link>
        )}
      </section>
    </div>
  );
}
