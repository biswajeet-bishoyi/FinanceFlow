"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";
import { DailyNightRecapResult } from "@/domain/daily-recap";
import { DailyWrappedStory } from "@/components/daily-wrapped-story";

export function DailyNightRecap({ recap }: { recap: DailyNightRecapResult }) {
  // If it's night time, expanded by default; otherwise allow preview toggle
  const [showRecap, setShowRecap] = useState(recap.isNightTime);
  const [showItemized, setShowItemized] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // If daytime and user hasn't clicked preview, show a polite preview pill
  if (!showRecap) {
    return (
      <div 
        id="daily-recap"
        className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all hover:bg-surface-container-low"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-800/40">
            <span className="material-symbols-outlined text-[22px]">bedtime</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-xs font-bold text-on-surface">Tonight's Spending Review</span>
              <span className="font-label-caps text-[9px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-semibold">
                Activates 8 PM
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              Today's spend: <strong className="text-on-surface">{formatMoney(recap.totalSpentToday)}</strong> of {formatMoney(recap.safeToSpendToday)} allowance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsStoryOpen(true)}
            className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Wrapped</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRecap(true)}
            className="text-xs font-semibold text-primary bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Preview
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
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-slate-950 via-[#131738] to-[#0A0D1E] text-slate-100 border border-indigo-500/30 shadow-[0px_10px_30px_rgba(15,23,42,0.25)] flex flex-col gap-4"
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">bedtime</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-sm md:text-base font-bold text-white tracking-wide">
                Tonight's Spending Review
              </h3>
              {recap.isNightTime && (
                <span className="inline-flex items-center gap-1 font-label-caps text-[10px] bg-indigo-900/60 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Night Mode
                </span>
              )}
            </div>
            <p className="font-body-sm text-[11px] text-slate-400 mt-0.5">
              {recap.dateStr} • Same-day expense audit
            </p>
          </div>
        </div>

        {!recap.isNightTime && (
          <button
            type="button"
            onClick={() => setShowRecap(false)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            Hide Preview
          </button>
        )}
      </div>

      {/* Spotify Wrapped Story CTA Banner */}
      <button
        type="button"
        onClick={() => setIsStoryOpen(true)}
        className="relative z-10 w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:via-teal-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg transition-all active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black/25 flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="block font-black tracking-wide text-white drop-shadow-xs">
                TONIGHT'S WRAPPED STORY
              </span>
              <span className="text-[10px] bg-black/30 text-white px-1.5 py-0.5 rounded font-bold">
                {recap.archetype.emoji} {recap.archetype.name}
              </span>
            </div>
            <span className="text-[11px] text-white/90 font-medium">
              Tap to view your 15s daily story, top hit & archetype
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/30 group-hover:bg-black/45 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0">
          <span>Play</span>
          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
        </div>
      </button>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-3 gap-2.5 relative z-10 pt-1">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-wider">Spent Today</span>
          <span className="font-headline-md text-base md:text-lg font-bold text-white mt-1">
            {formatMoney(recap.totalSpentToday)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {recap.transactionsToday.length} expense{recap.transactionsToday.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-wider">Daily Limit</span>
          <span className="font-headline-md text-base md:text-lg font-bold text-indigo-300 mt-1">
            {formatMoney(recap.safeToSpendToday)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Safe runway</span>
        </div>

        <div className={`border rounded-xl p-3 flex flex-col ${
          recap.status === "zero_spend"
            ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-200"
            : isSaved
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
            : "bg-amber-950/40 border-amber-500/30 text-amber-200"
        }`}>
          <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-wider">Status</span>
          <span className="font-headline-md text-base md:text-lg font-bold mt-1 truncate">
            {recap.status === "zero_spend"
              ? "Zero Spent"
              : isSaved
              ? `+${formatMoney(recap.differencePaise)}`
              : `-${formatMoney(Math.abs(recap.differencePaise))}`}
          </span>
          <span className="text-[10px] mt-0.5 opacity-80">
            {isSaved ? "Saved today" : "Over limit"}
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
