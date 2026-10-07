"use client";

import React, { useState, useTransition } from "react";
import { setCycleResetDay } from "@/app/actions/cycle";

interface CycleResetPromptProps {
  currentResetDay?: number;
  isConfigured?: boolean;
}

export function CycleResetPrompt({
  currentResetDay = 1,
  isConfigured = false,
}: CycleResetPromptProps) {
  const [isOpen, setIsOpen] = useState(!isConfigured);
  const [selectedDay, setSelectedDay] = useState<number>(currentResetDay);
  const [customDay, setCustomDay] = useState<string>(
    [1, 5, 7, 10, 15, 20, 25].includes(currentResetDay) ? "" : currentResetDay.toString()
  );
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const presetDays = [1, 5, 7, 10, 15, 20, 25];

  const handlePresetClick = (day: number) => {
    setSelectedDay(day);
    setCustomDay("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDay(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 28) {
      setSelectedDay(parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDay = selectedDay || 1;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("resetDay", finalDay.toString());
      const res = await setCycleResetDay(formData);
      if (res?.success) {
        setStatusMessage(`Cycle updated! Resets on the ${getOrdinal(finalDay)} of every month.`);
        setTimeout(() => {
          setIsOpen(false);
          setStatusMessage(null);
        }, 1500);
      } else {
        setStatusMessage(res?.error || "Failed to update reset day.");
      }
    });
  };

  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-surface-container-low/80 hover:bg-surface-container-low border border-surface-container-high rounded-xl transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">event_repeat</span>
          </div>
          <div>
            <span className="font-body-sm text-xs font-semibold text-on-surface block">
              Monthly Reset: Day {currentResetDay}
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant">
              Budgets and Safe-to-Spend automatically renew on the {getOrdinal(currentResetDay)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-primary/5 p-5 rounded-2xl border-2 border-primary/20 shadow-[0px_8px_24px_rgba(0,108,73,0.08)] relative overflow-hidden transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">
              {isConfigured ? "Change Monthly Reset Date" : "Set Your Monthly Reset Date"}
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Which day of the month should your budget & allowance reset?
            </p>
          </div>
        </div>

        {isConfigured && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {/* Preset Day Pills */}
        <div>
          <label className="block font-label-caps text-[11px] text-on-surface-variant font-semibold mb-2 uppercase tracking-wide">
            Select Day of Month
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {presetDays.map((day) => {
              const isSelected = selectedDay === day && !customDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handlePresetClick(day)}
                  className={`py-2 px-1 text-center rounded-xl font-body-sm text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm scale-[1.02]"
                      : "bg-surface-container-low border border-surface-container-high text-on-surface hover:bg-surface-container hover:border-outline-variant"
                  }`}
                >
                  Day {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Day Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block font-label-caps text-[11px] text-on-surface-variant font-semibold mb-1 uppercase tracking-wide">
              Or Custom Day (1–28)
            </label>
            <input
              type="number"
              min="1"
              max="28"
              value={customDay}
              onChange={handleCustomChange}
              placeholder="e.g. 2nd, 15th"
              className="bg-surface-container-low border border-surface-container-high text-on-surface text-body-sm rounded-xl focus:ring-1 focus:ring-primary block w-full px-3 py-2 transition-colors"
            />
          </div>

          <div className="flex flex-col justify-end pt-5">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-primary text-on-primary font-body-sm text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Save Reset Date
                </>
              )}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">info</span>
            {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
}
