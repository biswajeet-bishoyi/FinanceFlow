"use client";

import { FinancialHealthData } from "@/domain/gamification";
import Link from "next/link";

export function GamificationDashboard({ data }: { data: FinancialHealthData }) {
  const { healthScore, tier, scoreFactors, streakDays, badges } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Score Hero Card */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">FINANCIAL HEALTH SCORE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="font-display-currency text-4xl font-bold text-on-surface">{healthScore}</h2>
              <span className="text-on-surface-variant font-label-caps text-sm">/ 100</span>
              <span className="font-label-caps text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-secondary ml-2">
                {tier}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center bg-[#F8FAFC] p-3 rounded-xl border border-surface-container">
            <span className="material-symbols-outlined text-warning-amber text-[24px]">local_fire_department</span>
            <span className="font-currency-sm text-sm font-bold text-on-surface">{streakDays} Days</span>
            <span className="font-label-caps text-[9px] text-on-surface-variant uppercase">Streak</span>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-700"
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>

        {/* Score Breakdown Factors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-container">
          {scoreFactors.map((f) => (
            <div key={f.name} className="bg-[#F8FAFC] p-2.5 rounded-xl flex flex-col">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase truncate">{f.name}</span>
              <span className="font-currency-sm text-sm font-bold text-on-surface mt-0.5">
                {f.score} / {f.maxScore}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Badges & Milestones */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Badges & Trophies</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">Unlock rewards by building smart student habits</p>
          </div>
          <span className="font-label-caps text-xs text-on-surface-variant font-semibold">
            {badges.filter((b) => b.isUnlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
                badge.isUnlocked
                  ? "bg-secondary-container/15 border-secondary/30 shadow-xs"
                  : "bg-[#F8FAFC] border-surface-container opacity-60"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  badge.isUnlocked
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {badge.icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-body-sm font-bold text-on-surface text-sm truncate">{badge.name}</h4>
                  <span className={`font-label-caps text-[10px] font-semibold px-2 py-0.5 rounded ${
                    badge.isUnlocked ? "bg-secondary/15 text-secondary" : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {badge.unlockedAtText}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-snug">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Habits Action Card */}
      <section className="bg-[#E8F5E9] p-5 rounded-2xl border border-secondary/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[32px]">military_tech</span>
          <div>
            <h4 className="font-headline-md text-sm font-bold text-on-surface">Level up your financial rank</h4>
            <p className="font-body-sm text-xs text-on-surface-variant">Log an expense daily to maintain your active streak!</p>
          </div>
        </div>

        <Link
          href="/add"
          className="bg-secondary text-on-secondary text-xs font-semibold px-3.5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shrink-0"
        >
          Log Expense
        </Link>
      </section>
    </div>
  );
}
