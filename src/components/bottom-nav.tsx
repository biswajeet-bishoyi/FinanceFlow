"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on navigation or outside click
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const morePaths = [
    "/afford",
    "/what-if",
    "/achievements",
    "/notifications",
    "/calendar",
    "/friends",
    "/recurring",
    "/goals",
    "/analytics",
    "/settings",
  ];
  const isMoreActive = morePaths.some((path) => pathname === path);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex flex-col items-center justify-center bg-secondary-container text-secondary rounded-xl px-3.5 py-1.5 transition-all duration-150";
    }
    return "flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface px-3.5 py-1.5 transition-all duration-150";
  };

  const getIconProps = (path: string) => {
    const isActive = pathname === path;
    return {
      style: { fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" },
    };
  };

  const moreFeatures = [
    {
      label: "Can I Afford This?",
      desc: "Simulate purchase impact",
      href: "/afford",
      icon: "calculate",
      color: "bg-secondary-container text-secondary",
      badge: "Simulator",
    },
    {
      label: "What-If Simulator",
      desc: "Scenario planning & cuts",
      href: "/what-if",
      icon: "tune",
      color: "bg-[#E3F2FD] text-[#1976D2]",
      badge: "What-If",
    },
    {
      label: "Health & Gamification",
      desc: "Score, streaks & badges",
      href: "/achievements",
      icon: "military_tech",
      color: "bg-[#FFF3E0] text-[#E65100]",
      badge: "Badges",
    },
    {
      label: "Notifications",
      desc: "Daily alerts & bill dues",
      href: "/notifications",
      icon: "notifications",
      color: "bg-violet-bg text-violet",
    },
    {
      label: "Cycle Calendar",
      desc: "Daily spend & bill dates",
      href: "/calendar",
      icon: "calendar_month",
      color: "bg-primary text-on-primary",
    },
    {
      label: "Cycle Settings",
      desc: "Set monthly start day",
      href: "/settings",
      icon: "settings",
      color: "bg-surface-container text-primary",
    },
    {
      label: "Savings Goals",
      desc: "Stash for targets",
      href: "/goals",
      icon: "target",
      color: "bg-secondary-container text-secondary",
    },
    {
      label: "Friends & Splits",
      desc: "Track informal debts",
      href: "/friends",
      icon: "group",
      color: "bg-[#FFF3E0] text-[#E65100]",
    },
    {
      label: "Subscriptions",
      desc: "Fixed monthly bills",
      href: "/recurring",
      icon: "subscriptions",
      color: "bg-[#E3F2FD] text-[#1976D2]",
    },
    {
      label: "Burn Rate Analytics",
      desc: "Safe spend trends",
      href: "/analytics",
      icon: "insights",
      color: "bg-violet-bg text-violet",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div
        ref={menuRef}
        className="w-full max-w-3xl bg-surface rounded-t-2xl shadow-[0px_-8px_32px_rgba(15,23,42,0.12)] border-t border-surface-container pointer-events-auto flex flex-col relative"
      >
        {/* More Features Dropup Menu */}
        {isOpen && (
          <div className="absolute bottom-[72px] right-2 left-2 sm:left-auto sm:right-4 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-[0px_12px_36px_rgba(15,23,42,0.18)] border border-surface-container-high p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 z-50">
            <div className="flex justify-between items-center pb-2 border-b border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
                <span className="font-headline-md text-sm font-bold text-on-surface">More Features</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Grid of features */}
            <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {moreFeatures.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`p-3 rounded-xl flex flex-col gap-1.5 border transition-all active:scale-[0.97] ${
                      isActive
                        ? "bg-secondary-container/30 border-secondary ring-1 ring-secondary"
                        : "bg-[#F8FAFC] border-surface-container hover:bg-surface-container hover:border-primary/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      </div>
                      {item.badge && (
                        <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-body-sm text-xs font-semibold text-on-surface block truncate">
                        {item.label}
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface-variant block truncate">
                        {item.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Bar Primary Tabs */}
        <div className="flex justify-around items-center px-3 pb-safe h-[68px]">
          {/* 1. Home */}
          <Link href="/" className={getLinkClass("/")}>
            <span className="material-symbols-outlined text-[22px]" {...getIconProps("/")}>
              dashboard
            </span>
            <span className="font-label-caps text-[11px] mt-0.5 font-medium">Home</span>
          </Link>

          {/* 2. History */}
          <Link href="/transactions" className={getLinkClass("/transactions")}>
            <span className="material-symbols-outlined text-[22px]" {...getIconProps("/transactions")}>
              receipt_long
            </span>
            <span className="font-label-caps text-[11px] mt-0.5 font-medium">History</span>
          </Link>

          {/* 3. Add Expense Center Button */}
          <Link
            href="/add"
            className="flex flex-col items-center justify-center -mt-4 bg-primary text-on-primary w-12 h-12 rounded-full shadow-[0px_4px_14px_rgba(0,108,73,0.35)] hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[26px]">add</span>
          </Link>

          {/* 4. Budgets */}
          <Link href="/budgets" className={getLinkClass("/budgets")}>
            <span className="material-symbols-outlined text-[22px]" {...getIconProps("/budgets")}>
              pie_chart
            </span>
            <span className="font-label-caps text-[11px] mt-0.5 font-medium">Budgets</span>
          </Link>

          {/* 5. More Dropup Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
              isOpen || isMoreActive
                ? "bg-secondary-container text-secondary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isOpen || isMoreActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              grid_view
            </span>
            <span className="font-label-caps text-[11px] mt-0.5 font-medium flex items-center gap-0.5">
              More
              <span className={`material-symbols-outlined text-[12px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                expand_less
              </span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
