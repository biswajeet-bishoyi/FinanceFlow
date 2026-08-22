import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BottomNav } from "@/components/bottom-nav";

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
  const categories = await prisma.category.findMany({
    where: { isSystemDefault: true },
    take: 4,
  });

  const friends = await prisma.person.findMany({
    where: { user: { profile: { isNot: null } } }, // A bit of a hack to get friends for the first user
  });

  // We need to fetch friends specifically for the user. Since layout.tsx doesn't know the user, we just get the first user like elsewhere.
  const user = await prisma.user.findFirst();
  const userFriends = user ? await prisma.person.findMany({ where: { userId: user.id } }) : [];

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
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-surface-container-high">
              <img alt="User profile picture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq8F6fRveL3rbYxZaMbJV386_LBxxG5lOhRj11B_nyHKE9IFVwbIGgXX9csMbH3ZhLj3xfs58AxZ1ZW1YSVl00Gm7wEz56984GCwEktqWRpi_FQU2fDFGOYrUxw3stCLyH9D5g7Kx48A3sV21SfyNN4MENa9gQf86TKwhdMVNjNT6jA_LlSOpGYzUwwO4PDRFd_T5bWPm2rNqrjPmePhiuT-7H-bjwiOAYSEFjnViAk10GId3ooRPI3g" />
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-surface-bright text-center flex-1 mx-4">
              FinanceFlow
            </h1>
            <button className="w-10 h-10 flex items-center justify-center text-primary dark:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-variant rounded-full transition-colors duration-200 ease-in-out">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
            </button>
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
