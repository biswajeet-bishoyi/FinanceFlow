"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";

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

type RecurringItem = {
  id: string;
  label: string;
  amount: number;
  nextDueAt: Date | string;
  recurrenceRule: string;
  category: {
    name: string;
    icon: string;
  } | null;
};

type CycleInfo = {
  id: string;
  label: string;
  startDate: Date | string;
  endDate: Date | string;
  expectedAmount: number;
  emergencyReserveAmount: number;
};

export function CycleCalendar({
  cycle,
  transactions,
  recurringExpenses,
  safeToSpendToday,
  totalBalance,
}: {
  cycle: CycleInfo;
  transactions: TransactionItem[];
  recurringExpenses: RecurringItem[];
  safeToSpendToday: number;
  totalBalance: number;
}) {
  const cycleStart = new Date(cycle.startDate);
  const cycleEnd = new Date(cycle.endDate);
  const today = new Date();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper date checker
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInCycle = (d: Date) => {
    const time = d.getTime();
    const startTime = new Date(cycleStart.getFullYear(), cycleStart.getMonth(), cycleStart.getDate()).getTime();
    const endTime = new Date(cycleEnd.getFullYear(), cycleEnd.getMonth(), cycleEnd.getDate(), 23, 59, 59).getTime();
    return time >= startTime && time <= endTime;
  };

  // Group transactions by date string YYYY-MM-DD
  const getDayTransactions = (d: Date) => {
    return transactions.filter((t) => isSameDay(new Date(t.occurredAt), d));
  };

  const getDayRecurring = (d: Date) => {
    return recurringExpenses.filter((r) => isSameDay(new Date(r.nextDueAt), d));
  };

  const selectedDateTransactions = getDayTransactions(selectedDate);
  const selectedDateRecurring = getDayRecurring(selectedDate);

  const selectedDayTotalExpense = selectedDateTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const selectedDayTotalIncome = selectedDateTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Cycle statistics
  const totalExpensesInCycle = transactions
    .filter((t) => t.type === "expense" && isInCycle(new Date(t.occurredAt)))
    .reduce((acc, t) => acc + t.amount, 0);

  const diffTime = cycleEnd.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="flex flex-col gap-6">
      {/* Cycle Banner Card */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ACTIVE CYCLE</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">{cycle.label}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {cycleStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} –{" "}
              {cycleEnd.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-1 text-xs font-semibold bg-surface-container text-primary px-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Cycle Settings
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-container">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl text-center">
            <span className="font-label-caps text-[10px] text-on-surface-variant block uppercase">Safe Today</span>
            <span className="font-currency-sm text-currency-sm text-secondary font-bold">
              {formatMoney(safeToSpendToday)}
            </span>
          </div>
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl text-center">
            <span className="font-label-caps text-[10px] text-on-surface-variant block uppercase">Spent in Cycle</span>
            <span className="font-currency-sm text-currency-sm text-on-surface font-bold">
              {formatMoney(totalExpensesInCycle)}
            </span>
          </div>
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl text-center">
            <span className="font-label-caps text-[10px] text-on-surface-variant block uppercase">Days Left</span>
            <span className="font-currency-sm text-currency-sm text-primary font-bold">
              {daysRemaining} days
            </span>
          </div>
        </div>
      </section>

      {/* Calendar Grid Section */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        {/* Month Selector Bar */}
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            {currentMonthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={jumpToToday}
              className="text-xs font-label-caps bg-surface-container text-on-surface px-2.5 py-1 rounded-md hover:bg-surface-container-high transition-colors mr-1"
            >
              Today
            </button>
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((dayName, idx) => (
            <div
              key={dayName}
              className={`font-label-caps text-[11px] font-semibold py-1 uppercase ${
                idx === 0 || idx === 6 ? "text-on-surface-variant/60" : "text-on-surface-variant"
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[64px] rounded-xl bg-transparent opacity-20"></div>
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const date = new Date(year, month, dayNum);
            const isTodayDate = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const inCycle = isInCycle(date);

            const dayTxs = getDayTransactions(date);
            const dayExpenses = dayTxs.filter((t) => t.type === "expense");
            const dayIncomes = dayTxs.filter((t) => t.type === "income");
            const dayRecurring = getDayRecurring(date);

            const totalDaySpent = dayExpenses.reduce((acc, t) => acc + t.amount, 0);

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`min-h-[68px] p-1.5 rounded-xl flex flex-col justify-between items-center transition-all relative border cursor-pointer ${
                  isSelected
                    ? "bg-primary text-on-primary border-primary ring-2 ring-primary/30 shadow-md scale-105 z-10"
                    : isTodayDate
                    ? "bg-secondary-container/20 border-secondary text-secondary font-bold"
                    : inCycle
                    ? "bg-[#F8FAFC] border-surface-container text-on-surface hover:border-primary/40 hover:bg-surface-container"
                    : "bg-white/40 border-transparent text-outline hover:bg-surface-container"
                }`}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between w-full px-0.5">
                  <span
                    className={`font-label-caps text-[12px] font-semibold ${
                      isSelected ? "text-on-primary" : isTodayDate ? "text-secondary font-bold" : "text-on-surface"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Indicator icons */}
                  <div className="flex gap-0.5">
                    {dayIncomes.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" title="Income received"></span>
                    )}
                    {dayRecurring.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1976D2]" title="Subscription due"></span>
                    )}
                  </div>
                </div>

                {/* Daily Spend Preview */}
                {totalDaySpent > 0 ? (
                  <span
                    className={`font-currency-sm text-[10px] font-semibold px-1 rounded truncate max-w-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-error-container/40 text-error font-bold"
                    }`}
                  >
                    -₹{Math.round(totalDaySpent / 100)}
                  </span>
                ) : (
                  <div className="h-4"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-surface-container text-xs font-body-sm text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-secondary bg-secondary-container/30"></span>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
            <span>Expense Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1976D2]"></span>
            <span>Bill Due</span>
          </div>
        </div>
      </section>

      {/* Selected Day Details Card */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-surface-container">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              {isSameDay(selectedDate, today) ? "Today's Activity" : "Day Activity"}
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              {selectedDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h3>
          </div>

          <Link
            href={`/add?date=${selectedDate.toISOString().split("T")[0]}`}
            className="bg-primary text-on-primary text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Log for Date
          </Link>
        </div>

        {/* Day Totals Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F8FAFC] p-3 rounded-xl">
            <span className="font-label-caps text-[10px] text-on-surface-variant block uppercase">Total Spent</span>
            <span className="font-currency-sm text-currency-sm text-error font-bold text-base">
              {selectedDayTotalExpense > 0 ? `-${formatMoney(selectedDayTotalExpense)}` : "₹0.00"}
            </span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl">
            <span className="font-label-caps text-[10px] text-on-surface-variant block uppercase">Income Received</span>
            <span className="font-currency-sm text-currency-sm text-secondary font-bold text-base">
              {selectedDayTotalIncome > 0 ? `+${formatMoney(selectedDayTotalIncome)}` : "₹0.00"}
            </span>
          </div>
        </div>

        {/* Upcoming Bill Due on this date */}
        {selectedDateRecurring.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-xs text-on-surface-variant font-semibold uppercase">Subscriptions Due</span>
            {selectedDateRecurring.map((r) => (
              <div key={r.id} className="bg-[#E3F2FD] p-3 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#1976D2] text-[20px]">subscriptions</span>
                  <div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">{r.label}</span>
                    <span className="font-label-caps text-[11px] text-on-surface-variant block capitalize">{r.recurrenceRule} bill</span>
                  </div>
                </div>
                <span className="font-currency-sm text-currency-sm font-bold text-[#1976D2]">
                  {formatMoney(r.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Transactions list on this date */}
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-xs text-on-surface-variant font-semibold uppercase">
            Transactions ({selectedDateTransactions.length})
          </span>

          {selectedDateTransactions.length === 0 ? (
            <div className="text-center py-6 text-on-surface-variant font-body-sm bg-[#F8FAFC] rounded-xl">
              No transactions recorded on this day.
            </div>
          ) : (
            selectedDateTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#F8FAFC] p-3 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === "income" ? "bg-secondary-container/40 text-secondary" : "bg-[#FFF3E0] text-[#E65100]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {tx.type === "income" ? "payments" : tx.category?.icon || "receipt"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body-md text-body-md font-semibold text-on-surface truncate">
                      {tx.merchant || tx.notes || tx.category?.name}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate">
                      {tx.category?.name}
                      {tx.notes && tx.merchant && tx.notes !== tx.merchant ? ` • ${tx.notes}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-currency-sm text-currency-sm font-bold ${
                      tx.type === "income" ? "text-secondary" : "text-on-surface"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatMoney(tx.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
