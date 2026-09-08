"use client";

import { useState, useEffect, useRef } from "react";
import { formatMoney } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";
import { DailyNightRecapResult } from "@/domain/daily-recap";
import { toast } from "sonner";

export function DailyWrappedStory({
  recap,
  isOpen,
  onClose,
}: {
  recap: DailyNightRecapResult;
  isOpen: boolean;
  onClose: () => void;
}) {
  const TOTAL_SLIDES = 5;
  const SLIDE_DURATION_MS = 6000;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset slide index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  // Auto-progress timer
  useEffect(() => {
    if (!isOpen || isPaused) return;

    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => {
        if (prev < TOTAL_SLIDES - 1) {
          return prev + 1;
        } else {
          return prev; // Stay on final slide until user closes or replays
        }
      });
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, currentSlide, isPaused]);

  // Keyboard navigation (Esc to exit, Left/Right arrow keys)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide]);

  if (!isOpen) return null;

  const nextSlide = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleCopySummary = async () => {
    const text = `🌙 My FinanceFlow Daily Wrapped (${recap.dateStr})\n• Spent: ${formatMoney(recap.totalSpentToday)}\n• Safe Limit: ${formatMoney(recap.safeToSpendToday)}\n• Status: ${recap.differencePaise >= 0 ? `Saved +${formatMoney(recap.differencePaise)}` : `Over -${formatMoney(Math.abs(recap.differencePaise))}`}\n• Archetype: ${recap.archetype.emoji} ${recap.archetype.name}\n• Insight: ${recap.realWorldComparison}\nTracked with FinanceFlow ✨`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied your Wrapped summary to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const topCategory = recap.categoryBreakdown[0];
  const isSaved = recap.differencePaise >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Story Container Frame */}
      <div 
        className="relative w-full h-full sm:h-[680px] sm:max-w-[400px] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border sm:border-slate-800 bg-slate-950 select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars (Spotify Story Bars) */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
              onClick={() => setCurrentSlide(idx)}
            >
              <div
                className={`h-full bg-white transition-all ${
                  idx < currentSlide
                    ? "w-full"
                    : idx === currentSlide
                    ? isPaused
                      ? "w-1/2"
                      : "w-full duration-[6000ms] ease-linear"
                    : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Header Bar */}
        <div className="absolute top-6 left-4 right-4 z-30 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] tracking-widest uppercase font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/15 backdrop-blur-md">
              FinanceFlow Wrapped
            </span>
            <span className="text-[11px] text-white/60 font-medium">{recap.dateStr}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer"
            aria-label="Close Story"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tap navigation zones (Left 30% back, Right 70% forward) */}
        <div className="absolute inset-y-16 inset-x-0 z-20 flex">
          <div 
            className="w-1/3 h-full cursor-pointer" 
            onClick={prevSlide}
            title="Previous slide"
          />
          <div 
            className="w-2/3 h-full cursor-pointer" 
            onClick={nextSlide}
            title="Next slide"
          />
        </div>

        {/* SLIDE CONTENT AREA */}
        <div className="relative flex-1 w-full h-full flex flex-col justify-between p-6 pt-16 pb-8 overflow-hidden">
          {/* SLIDE 1: The Damage Report & Intro */}
          {currentSlide === 0 && (
            <div className="h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-label-caps">
                  Daily Vibe Check
                </span>
                <h2 className="font-headline-lg text-3xl font-extrabold text-white leading-tight">
                  How your wallet lived today.
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  End of day audit before you turn in tonight.
                </p>
              </div>

              {/* Big Spotify-Style Statistic Card */}
              <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden my-auto">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl" />
                <span className="text-[11px] font-label-caps text-slate-400 uppercase tracking-wider">
                  Total Spent Today
                </span>
                <div className="text-4xl font-extrabold text-white mt-1 tracking-tight">
                  {formatMoney(recap.totalSpentToday)}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Today's Safe Limit</span>
                    <span className="font-bold text-slate-200">{formatMoney(recap.safeToSpendToday)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Outcome</span>
                    <span className={`font-bold ${isSaved ? "text-emerald-400" : "text-amber-400"}`}>
                      {recap.status === "zero_spend"
                        ? "₹0 Spent! 🌟"
                        : isSaved
                        ? `Saved ${formatMoney(recap.differencePaise)}`
                        : `Over by ${formatMoney(Math.abs(recap.differencePaise))}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span>Tap right to continue</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          )}

          {/* SLIDE 2: Your Main Character (Top Category) */}
          {currentSlide === 1 && (
            <div className="h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest font-label-caps">
                  The Main Character
                </span>
                <h2 className="font-headline-lg text-3xl font-extrabold text-white leading-tight">
                  Your #1 spending vibe today.
                </h2>
              </div>

              {topCategory ? (
                <div className="bg-gradient-to-br from-purple-950/90 via-slate-900 to-slate-950 border border-fuchsia-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden my-auto flex flex-col items-center text-center">
                  <div className="absolute -left-10 -top-10 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-3xl" />
                  
                  <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 flex items-center justify-center text-3xl mb-4 shadow-lg">
                    <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getCategoryIcon(topCategory.icon, topCategory.categoryName)}
                    </span>
                  </div>

                  <span className="text-[11px] uppercase tracking-widest text-fuchsia-300 font-bold font-label-caps">
                    {topCategory.percentage}% of today's spend
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">
                    {topCategory.categoryName}
                  </h3>
                  <p className="text-xl font-bold text-fuchsia-400 mt-1">
                    {formatMoney(topCategory.totalAmount)}
                  </p>
                  <p className="text-xs text-slate-300 mt-3 max-w-xs leading-relaxed">
                    Logged {topCategory.transactionCount} transaction{topCategory.transactionCount === 1 ? "" : "s"} in this category today.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center my-auto">
                  <div className="text-5xl mb-3">👻</div>
                  <h3 className="text-xl font-bold text-white">Ghost Town</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    No categories took any hits today. Complete financial silence!
                  </p>
                </div>
              )}

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span>Tap right for biggest purchase</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          )}

          {/* SLIDE 3: The Heavyweight Purchase */}
          {currentSlide === 2 && (
            <div className="h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-label-caps">
                  Heavyweight Hit
                </span>
                <h2 className="font-headline-lg text-3xl font-extrabold text-white leading-tight">
                  The single biggest drop.
                </h2>
              </div>

              {recap.largestPurchase ? (
                <div className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden my-auto">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl" />
                  <span className="text-[10px] font-label-caps text-amber-300 uppercase tracking-wider font-bold">
                    Peak Purchase
                  </span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {formatMoney(recap.largestPurchase.amount)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mt-3 truncate">
                    {recap.largestPurchase.merchant || recap.largestPurchase.notes || recap.largestPurchase.category?.name || "Expense"}
                  </h4>
                  {recap.largestPurchase.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      "{recap.largestPurchase.notes}"
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Time: {new Date(recap.largestPurchase.occurredAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </span>
                    {recap.peakSpendingHour && (
                      <span className="text-[11px] text-amber-300/80">
                        Peak Hour: {recap.peakSpendingHour}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center my-auto">
                  <div className="text-5xl mb-3">🛡️</div>
                  <h3 className="text-xl font-bold text-white">Zero Dents</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    No individual transaction took a bite out of your wallet today.
                  </p>
                </div>
              )}

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span>Tap right to discover your archetype</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          )}

          {/* SLIDE 4: Your Financial Archetype */}
          {currentSlide === 3 && (
            <div className="h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-label-caps">
                  Your Financial Archetype
                </span>
                <h2 className="font-headline-lg text-3xl font-extrabold text-white leading-tight">
                  Meet today's spending persona.
                </h2>
              </div>

              {/* Archetype Badge */}
              <div className={`bg-gradient-to-br ${recap.archetype.gradient} rounded-2xl p-6 shadow-2xl relative overflow-hidden my-auto text-white flex flex-col items-center text-center border border-white/20`}>
                <div className="text-6xl mb-3 animate-bounce duration-1000">
                  {recap.archetype.emoji}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  {recap.archetype.tagline}
                </span>
                <h3 className="text-2xl font-black mt-3 tracking-wide">
                  {recap.archetype.name}
                </h3>
                <p className="text-xs text-white/90 mt-2 leading-relaxed max-w-xs">
                  {recap.archetype.description}
                </p>
              </div>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span>Tap right for your tomorrow bonus</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          )}

          {/* SLIDE 5: Tomorrow's Bonus & Shareable Card */}
          {currentSlide === 4 && (
            <div className="h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300 relative z-30">
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-label-caps">
                  The Tomorrow Bonus
                </span>
                <h2 className="font-headline-lg text-2xl font-extrabold text-white leading-tight">
                  Ready for tomorrow.
                </h2>
              </div>

              {/* Shareable Poster Card */}
              <div className="bg-gradient-to-b from-[#11162B] via-[#0E1222] to-[#0A0D18] border border-indigo-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col gap-3 my-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{recap.archetype.emoji}</span>
                    <span className="font-bold text-xs text-white">{recap.archetype.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{recap.dateStr}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-label-caps">Spent Today</span>
                    <span className="text-sm font-bold text-white">{formatMoney(recap.totalSpentToday)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-label-caps">Safe Limit</span>
                    <span className="text-sm font-bold text-indigo-300">{formatMoney(recap.safeToSpendToday)}</span>
                  </div>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">
                    verified
                  </span>
                  <p className="text-[11px] text-emerald-200 leading-snug">
                    {recap.realWorldComparison}
                  </p>
                </div>
              </div>

              {/* Share & Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? "check" : "share"}
                  </span>
                  <span>{copied ? "Copied to Clipboard!" : "Share / Copy Wrapped Card"}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(0)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Replay ↺
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Done ✓
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
