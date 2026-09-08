import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getCurrentDbUser, getAuthUser } from "@/lib/auth";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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
  themeColor: "#090d16",
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
    <html lang="en" suppressHydrationWarning>
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
      <body className="bg-background text-on-background font-body-sm pb-[80px] transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* TopAppBar */}
          <header className="w-full top-0 sticky z-40 bg-surface/90 backdrop-blur-md shadow-xs border-b border-surface-container-high transition-colors duration-200">
            <div className="flex justify-between items-center h-16 px-container-padding w-full">
              {user ? (
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-base sm:text-lg border-2 border-surface-container-high shrink-0">
                    {displayInitial}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-sm text-xs sm:text-body-sm text-on-surface font-bold truncate max-w-[90px] sm:max-w-[140px]">
                      {displayName}
                    </span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant max-w-[120px] truncate hidden sm:block">
                      {user.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10"></div>
              )}

              <Link
                href="/"
                className="hidden md:block font-headline-lg text-headline-lg font-bold text-on-surface text-center flex-1 mx-2 truncate hover:opacity-80 transition-opacity"
              >
                FinanceFlow
              </Link>

              {user ? (
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Theme Toggle (Sun / Moon) */}
                  <ThemeToggle />

                  <Link
                    href="/notifications"
                    title="Notifications & Alerts"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-surface-container-high rounded-full transition-all relative shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      notifications
                    </span>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface animate-pulse"></span>
                  </Link>
                  <Link
                    href="/calendar"
                    title="Cycle Calendar"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-surface-container-high rounded-full transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      calendar_month
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    title="Cycle Settings"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-surface-container-high rounded-full transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
