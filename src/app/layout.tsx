import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getCurrentDbUser, getAuthUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FinanceFlow",
  description: "A financial companion for students",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceFlow",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f9ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dbUser, user] = await Promise.all([
    getCurrentDbUser(true),
    getAuthUser(),
  ]);

  const displayName =
    dbUser?.profile?.displayName || user?.email?.split("@")[0] || "User";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Manrope:wght@600;700&family=Work+Sans:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body-sm pb-[80px]">
        {/* TopAppBar */}
        <header className="w-full top-0 sticky z-40 bg-surface dark:bg-on-background shadow-sm transition-colors duration-200 ease-in-out">
          <div className="flex justify-between items-center h-16 px-container-padding w-full">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg border-2 border-surface-container-high">
                  {displayInitial}
                </div>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm text-on-surface dark:text-surface-bright font-bold">
                    {displayName}
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-surface-variant max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10"></div>
            )}

            <Link
              href="/"
              className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-surface-bright text-center flex-1 mx-2 truncate hover:opacity-80 transition-opacity"
            >
              FinanceFlow
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/notifications"
                  title="Notifications & Alerts"
                  className="w-9 h-9 flex items-center justify-center text-slate-700 bg-[#F1F5F9] hover:bg-slate-200 border border-slate-200/80 rounded-full transition-all relative"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-700">
                    notifications
                  </span>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-white animate-pulse"></span>
                </Link>
                <Link
                  href="/calendar"
                  title="Cycle Calendar"
                  className="w-9 h-9 flex items-center justify-center text-slate-700 bg-[#F1F5F9] hover:bg-slate-200 border border-slate-200/80 rounded-full transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-700">
                    calendar_month
                  </span>
                </Link>
                <Link
                  href="/settings"
                  title="Cycle Settings"
                  className="w-9 h-9 flex items-center justify-center text-slate-700 bg-[#F1F5F9] hover:bg-slate-200 border border-slate-200/80 rounded-full transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-700">
                    settings
                  </span>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    const { logout } = await import("@/app/actions/auth");
                    await logout();
                  }}
                >
                  <button
                    type="submit"
                    title="Sign Out"
                    className="w-9 h-9 flex items-center justify-center text-error bg-error-container/30 hover:bg-error-container border border-error/20 rounded-full transition-all"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-error"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      logout
                    </span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-10 h-10"></div>
            )}
          </div>
        </header>

        {children}

        {/* BottomNavBar */}
        <BottomNav />

        <Toaster />
      </body>
    </html>
  );
}
