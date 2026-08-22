"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex flex-col items-center justify-center bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-xl px-4 py-1.5 hover:opacity-80 active:scale-95 transition-transform duration-150";
    }
    return "flex flex-col items-center justify-center text-on-surface-variant dark:text-outline px-4 py-1.5 hover:opacity-80 active:scale-95 transition-transform duration-150";
  };

  const getIconProps = (path: string) => {
    const isActive = pathname === path;
    return {
      style: { fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }
    };
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-3xl bg-surface dark:bg-on-background rounded-t-xl shadow-[0px_-4px_24px_rgba(15,23,42,0.08)] pointer-events-auto flex justify-around items-center px-4 pb-safe h-touch-target">
        <Link href="/" className={getLinkClass("/")}>
          <span className="material-symbols-outlined" {...getIconProps("/")}>dashboard</span>
          <span className="font-label-caps text-label-caps mt-1">Home</span>
        </Link>
        <Link href="/transactions" className={getLinkClass("/transactions")}>
          <span className="material-symbols-outlined" {...getIconProps("/transactions")}>receipt_long</span>
          <span className="font-label-caps text-label-caps mt-1">History</span>
        </Link>
        <Link href="/add" className={getLinkClass("/add")}>
          <span className="material-symbols-outlined" {...getIconProps("/add")}>add_circle</span>
          <span className="font-label-caps text-label-caps mt-1">Add</span>
        </Link>
        <Link href="/budgets" className={getLinkClass("/budgets")}>
          <span className="material-symbols-outlined" {...getIconProps("/budgets")}>pie_chart</span>
          <span className="font-label-caps text-label-caps mt-1">Budgets</span>
        </Link>
        <Link href="/goals" className={getLinkClass("/goals")}>
          <span className="material-symbols-outlined" {...getIconProps("/goals")}>target</span>
          <span className="font-label-caps text-label-caps mt-1">Goals</span>
        </Link>
      </div>
    </nav>
  );
}
