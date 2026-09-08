"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";
import { DailyNightRecapResult } from "@/domain/daily-recap";
import { DailyWrappedStory } from "@/components/daily-wrapped-story";

export function DailyNightRecap({ recap }: { recap: DailyNightRecapResult }) {
  const [isNightTime, setIsNightTime] = useState(recap.isNightTime);
  const [showRecap, setShowRecap] = useState(recap.isNightTime);
  const [showItemized, setShowItemized] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Sync with client device local hour (8 PM to 4 AM) to bypass cloud server UTC mismatch
  useEffect(() => {
    const hr = new Date().getHours();
    const night = hr >= 20 || hr < 4;
    setIsNightTime(night);
    setShowRecap(night);
  }, []);

  // If collapsed (or daytime), show sleek, perfectly spaced mobile-friendly banner
  if (!showRecap) {
    return (
      <div
        id="daily-recap"
        className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all flex flex-col gap-3"
      >
        {/* Top row: Icon + Title + Status + Spend Summary */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 dark:bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <span className="material-symbols-outlined text-[22px]">bedtime</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-md text-xs sm:text-sm font-bold text-on-surface">
                Tonight's Spending Review
              </span>
              {isNightTime ? (
                <span className="inline-flex items-center gap-1 font-label-caps text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Now
                </span>
              ) : (
                <span className="font-label-caps text-[9px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-semibold">
                  Activates 8 PM
                </span>
              )}
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 truncate">
              Spent <strong className="text-on-surface">{formatMoney(recap.totalSpentToday)}</strong> of {formatMoney(recap.safeToSpendToday)} allowance
            </p>
          </div>
        </div>

        {/* Action row: Full width, no overflow or clipping on phones */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-container-high/50">
          <button
            type="button"
            onClick={() => setIsStoryOpen(true)}
            className="flex-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/60 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Play Wrapped Story</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRecap(true)}
            className="text-xs font-semibold text-on-surface bg-surface-container hover:bg-surface-container-high py-2 px-3.5 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {isNightTime ? "View Review" : "Preview"}
          </button>
        </div>

        <DailyWrappedStory
          recap={recap}
          isOpen={isStoryOpen}
          onClose={() => setIsStoryOpen(false)}
        />
      </div>
    );
  }

  const isSaved = recap.differencePaise >= 0;

  return (
    <section
      id="daily-recap"
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-slate-950 via-[#131738] to-[#0A0D1E] text-slate-100 border border-indigo-500/30 shadow-[0px_10px_30px_rgba(15,23,42,0.25)] flex flex-col gap-3.5 sm:gap-4"
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">bedtime</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline-md text-sm md:text-base font-bold text-white tracking-wide">
                Tonight's Spending Review
              </h3>
              {isNightTime ? (
                <span className="inline-flex items-center gap-1 font-label-caps text-[10px] bg-indigo-900/60 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Night Mode
                </span>
              ) : (
                <span className="font-label-caps text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                  Preview
                </span>
              )}
            </div>
            <p className="font-body-sm text-[11px] text-slate-400 mt-0.5">
              {recap.dateStr} • Same-day audit
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRecap(false)}
          className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        >
          {isNightTime ? "Minimize" : "Hide"}
        </button>
      </div>

      {/* Spotify Wrapped Story CTA Banner */}
      <button
        type="button"
        onClick={() => setIsStoryOpen(true)}
        className="relative z-10 w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:via-teal-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg transition-all active:scale-[0.99] cursor-pointer group gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-black/25 flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="block font-black tracking-wide text-white drop-shadow-xs text-xs">
                TONIGHT'S WRAPPED
              </span>
              <span className="text-[10px] bg-black/30 text-white px-1.5 py-0.5 rounded font-bold truncate">
                {recap.archetype.emoji} {recap.archetype.name}
              </span>
            </div>
            <span className="text-[11px] text-white/90 font-medium line-clamp-1">
              Tap for 15s story, top hit & archetype
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/30 group-hover:bg-black/45 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0">
          <span>Play</span>
          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
        </div>
      </button>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-3 gap-2 relative z-10 pt-1">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between">
          <span className="font-label-caps text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider">Spent Today</span>
          <span className="font-headline-md text-sm sm:text-base md:text-lg font-bold text-white mt-1 truncate">
            {formatMoney(recap.totalSpentToday)}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
            {recap.transactionsToday.length} expense{recap.transactionsToday.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between">
          <span className="font-label-caps text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider">Daily Limit</span>
          <span className="font-headline-md text-sm sm:text-base md:text-lg font-bold text-indigo-300 mt-1 truncate">
            {formatMoney(recap.safeToSpendToday)}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">Safe runway</span>
        </div>

        <div className={`border rounded-xl p-2.5 sm:p-3 flex flex-col justify-between ${recap.status === "zero_spend"
            ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-200"
            : isSaved
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-amber-950/40 border-amber-500/30 text-amber-200"
          }`}>
          <span className="font-label-caps text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider">Status</span>
          <span className="font-headline-md text-sm sm:text-base md:text-lg font-bold mt-1 truncate">
            {recap.status === "zero_spend"
              ? "₹0 Spend"
              : isSaved
                ? `+${formatMoney(recap.differencePaise)}`
                : `-${formatMoney(Math.abs(recap.differencePaise))}`}
          </span>
          <span className="text-[9px] sm:text-[10px] mt-0.5 opacity-80 truncate">
            {isSaved ? "Saved" : "Over limit"}
          </span>
        </div>
      </div>

      {/* Narrative Headline & Peaceful Reflection */}
      <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3.5 relative z-10 flex items-start gap-3">
        <span className="material-symbols-outlined text-indigo-300 text-[20px] shrink-0 mt-0.5">
          {recap.status === "over_budget" ? "info" : "sparkles"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-headline-md text-xs font-bold text-white">{recap.headline}</p>
          <p className="font-body-sm text-[11px] text-slate-300 mt-0.5 leading-relaxed">{recap.subtext}</p>
        </div>
      </div>

      {/* Where Money Spent: Category Breakdown */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-400 text-[16px]">pie_chart</span>
            Where Your Money Went Today
          </span>
          {recap.transactionsToday.length > 0 && (
            <button
              type="button"
              onClick={() => setShowItemized(!showItemized)}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
            >
              {showItemized ? "Hide items" : "Show items"}
            </button>
          )}
        </div>

        {recap.categoryBreakdown.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400">No expenses recorded for today. Great job keeping expenses at ₹0!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Category percentage bars */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              {recap.categoryBreakdown.map((cat, idx) => {
                const colors = [
                  "bg-indigo-400",
                  "bg-emerald-400",
                  "bg-amber-400",
                  "bg-pink-400",
                  "bg-cyan-400",
                  "bg-purple-400",
                ];
                const color = colors[idx % colors.length];
                return (
                  <div
                    key={cat.categoryName}
                    style={{ width: `${cat.percentage}%` }}
                    className={`${color} transition-all`}
                    title={`${cat.categoryName}: ${formatMoney(cat.totalAmount)} (${cat.percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Category chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {recap.categoryBreakdown.map((cat, idx) => {
                const dotColors = [
                  "bg-indigo-400",
                  "bg-emerald-400",
                  "bg-amber-400",
                  "bg-pink-400",
                  "bg-cyan-400",
                  "bg-purple-400",
                ];
                return (
                  <div
                    key={cat.categoryName}
                    className="bg-slate-900/70 border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColors[idx % dotColors.length]}`} />
                      <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">
                        {getCategoryIcon(cat.icon, cat.categoryName)}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">{cat.categoryName}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({cat.percentage}%)</span>
                    </div>
                    <span className="text-xs font-bold text-white shrink-0 ml-2">
                      {formatMoney(cat.totalAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Itemized list of today's expenses if expanded */}
      {showItemized && recap.transactionsToday.length > 0 && (
        <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-2 relative z-10">
          <span className="font-label-caps text-[11px] text-slate-400 uppercase tracking-wider">
            Today's Logged Purchases
          </span>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
            {recap.transactionsToday.map((tx) => {
              const timeStr = new Date(tx.occurredAt).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
              return (
                <div
                  key={tx.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-800 px-1.5 py-0.5 rounded">
                      {timeStr}
                    </span>
                    <div className="min-w-0 truncate">
                      <p className="font-semibold text-white truncate">
                        {tx.merchant || tx.notes || tx.category?.name || "Expense"}
                      </p>
                      {tx.notes && tx.merchant && (
                        <p className="text-[10px] text-slate-400 truncate">{tx.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-red-300 shrink-0 ml-2">
                    -{formatMoney(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <DailyWrappedStory
        recap={recap}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />
    </section>
  );
}
