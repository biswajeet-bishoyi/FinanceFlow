"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export function WhatIfSimulator({
  currentBalance,
  currentSafeToSpend,
  daysRemaining,
  emergencyReserve,
  currentMonthlyRecurring,
}: {
  currentBalance: number;
  currentSafeToSpend: number;
  daysRemaining: number;
  emergencyReserve: number;
  currentMonthlyRecurring: number;
}) {
  const [extraIncome, setExtraIncome] = useState<number>(0);
  const [plannedExpense, setPlannedExpense] = useState<number>(0);
  const [expenseCutPercent, setExpenseCutPercent] = useState<number>(0);
  const [recurringAdjustment, setRecurringAdjustment] = useState<number>(0);

  // Simulated Math in minor units (paise)
  const extraIncomePaise = extraIncome * 100;
  const plannedExpensePaise = plannedExpense * 100;
  const recurringAdjustmentPaise = recurringAdjustment * 100;

  const simulatedBalance = currentBalance + extraIncomePaise - plannedExpensePaise;
  const simulatedUsable = Math.max(0, simulatedBalance - emergencyReserve - (currentMonthlyRecurring + recurringAdjustmentPaise));
  
  let simulatedDaily = daysRemaining > 0 ? Math.floor(simulatedUsable / daysRemaining) : 0;
  if (expenseCutPercent > 0) {
    // If user cuts their daily baseline spending
    simulatedDaily = Math.round(simulatedDaily * (1 + expenseCutPercent / 100));
  }

  const deltaDaily = simulatedDaily - currentSafeToSpend;

  return (
    <div className="flex flex-col gap-6">
      {/* Simulation Result Comparison Card */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">PROJECTED SCENARIO RESULT</span>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Simulated Daily Spend */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-surface-container flex flex-col">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">New Safe-To-Spend</span>
            <span className="font-currency-sm text-currency-sm text-secondary font-bold text-2xl mt-1">
              {formatMoney(simulatedDaily)}
              <span className="text-xs font-normal text-on-surface-variant ml-1">/ day</span>
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {deltaDaily >= 0 ? (
                <span className="text-secondary font-semibold">+{formatMoney(deltaDaily)}/day better</span>
              ) : (
                <span className="text-error font-semibold">-{formatMoney(Math.abs(deltaDaily))}/day drop</span>
              )}
            </div>
          </div>

          {/* Simulated Ending Balance */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-surface-container flex flex-col">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Simulated Balance</span>
            <span className={`font-currency-sm text-currency-sm font-bold text-2xl mt-1 ${simulatedBalance < 0 ? "text-error" : "text-on-surface"}`}>
              {formatMoney(simulatedBalance)}
            </span>
            <span className="text-[11px] text-on-surface-variant mt-1">
              Current: {formatMoney(currentBalance)}
            </span>
          </div>

          {/* Runway */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-surface-container flex flex-col col-span-2 sm:col-span-1">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Cycle Runway</span>
            <span className="font-currency-sm text-currency-sm font-bold text-primary text-2xl mt-1">
              {daysRemaining} days left
            </span>
            <span className="text-[11px] text-on-surface-variant mt-1">
              Reserve protected: {formatMoney(emergencyReserve)}
            </span>
          </div>
        </div>
      </section>

      {/* Scenario Controls & Sliders */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Scenario Controls</h2>
        </div>

        {/* 1. Extra Income / Freelance / Gift */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-body-sm text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
              Extra Pocket Money / Freelance Gig
            </label>
            <span className="font-currency-sm text-sm font-bold text-secondary">+₹{extraIncome}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="250"
            value={extraIncome}
            onChange={(e) => setExtraIncome(Number(e.target.value))}
            className="w-full accent-secondary cursor-pointer h-2 bg-surface-container rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-label-caps text-on-surface-variant">
            <span>₹0</span>
            <span>+₹5,000</span>
            <span>+₹10,000</span>
          </div>
        </div>

        {/* 2. One-Time Big Purchase */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
          <div className="flex justify-between items-center">
            <label className="font-body-sm text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-error text-[18px]">shopping_cart</span>
              One-Time Big Purchase (e.g. Shoes, Trip, Books)
            </label>
            <span className="font-currency-sm text-sm font-bold text-error">-₹{plannedExpense}</span>
          </div>
          <input
            type="range"
            min="0"
            max="8000"
            step="200"
            value={plannedExpense}
            onChange={(e) => setPlannedExpense(Number(e.target.value))}
            className="w-full accent-error cursor-pointer h-2 bg-surface-container rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-label-caps text-on-surface-variant">
            <span>₹0</span>
            <span>₹4,000</span>
            <span>₹8,000</span>
          </div>
        </div>

        {/* 3. Expense Optimization Cut */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
          <div className="flex justify-between items-center">
            <label className="font-body-sm text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-info-blue text-[18px]">savings</span>
              Cut Canteen & Snack Spending By
            </label>
            <span className="font-currency-sm text-sm font-bold text-info-blue">{expenseCutPercent}% savings</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 10, 20, 35].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setExpenseCutPercent(pct)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  expenseCutPercent === pct
                    ? "bg-info-blue text-white border-info-blue shadow-sm"
                    : "bg-[#F8FAFC] text-on-surface border-surface-container hover:bg-surface-container"
                }`}
              >
                {pct === 0 ? "Normal (0%)" : `${pct}% cut`}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Subscriptions Adjustment */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
          <div className="flex justify-between items-center">
            <label className="font-body-sm text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-violet text-[18px]">subscriptions</span>
              Subscription Adjustment (e.g. Cancel/Add Netflix, Wi-Fi)
            </label>
            <span className="font-currency-sm text-sm font-bold text-violet">
              {recurringAdjustment >= 0 ? `+₹${recurringAdjustment}` : `-₹${Math.abs(recurringAdjustment)}`}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRecurringAdjustment(-499)}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                recurringAdjustment === -499 ? "bg-secondary text-on-secondary" : "bg-[#F8FAFC] border-surface-container"
              }`}
            >
              Cancel Sub (-₹499)
            </button>
            <button
              type="button"
              onClick={() => setRecurringAdjustment(0)}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                recurringAdjustment === 0 ? "bg-primary text-on-primary" : "bg-[#F8FAFC] border-surface-container"
              }`}
            >
              No Change
            </button>
            <button
              type="button"
              onClick={() => setRecurringAdjustment(299)}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                recurringAdjustment === 299 ? "bg-error text-white" : "bg-[#F8FAFC] border-surface-container"
              }`}
            >
              Add Sub (+₹299)
            </button>
          </div>
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={() => {
            setExtraIncome(0);
            setPlannedExpense(0);
            setExpenseCutPercent(0);
            setRecurringAdjustment(0);
          }}
          className="mt-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface underline text-center"
        >
          Reset All Simulation Sliders
        </button>
      </section>
    </div>
  );
}
