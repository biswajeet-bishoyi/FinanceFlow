"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full bg-surface-container border border-surface-container-high shrink-0 ${className || ""}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer shrink-0 ${
        isDark
          ? "bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700"
          : "bg-surface-container text-slate-700 hover:bg-surface-container-high border border-surface-container-high"
      } ${className || ""}`}
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options = [
    { id: "light", label: "Light", icon: "light_mode", desc: "Clean & bright" },
    { id: "dark", label: "Dark", icon: "dark_mode", desc: "Deep midnight slate" },
    { id: "system", label: "System", icon: "devices", desc: "Match device theme" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {options.map((opt) => {
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center active:scale-95 cursor-pointer ${
              isSelected
                ? "bg-secondary-container/25 border-secondary ring-1 ring-secondary text-on-surface"
                : "bg-surface-container border-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isSelected ? "text-secondary" : ""}`}>
              {opt.icon}
            </span>
            <span className="font-headline-md text-xs font-bold text-on-surface block">
              {opt.label}
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant block">
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
