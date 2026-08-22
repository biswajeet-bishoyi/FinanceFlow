import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BottomNav } from "@/components/bottom-nav";

import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "FinanceFlow",
  description: "A financial companion",
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findFirst({
      where: { authId: user.id },
      include: { profile: true }
    });
  }

  const displayName = dbUser?.profile?.displayName || user?.email?.split('@')[0] || "User";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Manrope:wght@600;700&family=Work+Sans:wght@400&display=swap" rel="stylesheet" />
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
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">{displayName}</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant max-w-[120px] truncate">{user.email}</span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10"></div>
            )}
            
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-surface-bright text-center flex-1 mx-4">
              FinanceFlow
            </h1>

            {user ? (
              <form action={async () => {
                "use server";
                const { logout } = await import("@/app/actions/auth");
                await logout();
              }}>
                <button type="submit" className="w-10 h-10 flex items-center justify-center text-error hover:bg-error-container rounded-full transition-colors duration-200 ease-in-out">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
                </button>
              </form>
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
