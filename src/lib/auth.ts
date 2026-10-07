import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { cache } from "react";
import { calculateCycleBoundaries, formatCycleLabel } from "@/lib/cycle";

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

const getCurrentDbUserInternal = cache(async (includeProfile: boolean) => {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  let user = await prisma.user.findFirst({
    where: { authId: authUser.id },
    include: includeProfile ? { profile: true } : undefined,
  });

  if (!user) {
    // Auto-initialize user if authenticated via Supabase
    const displayName =
      authUser.user_metadata?.displayName ||
      authUser.email?.split("@")[0] ||
      "Student";
    const cycleBoundaries = calculateCycleBoundaries(1, new Date());
    user = await prisma.user.create({
      data: {
        authId: authUser.id,
        profile: {
          create: {
            displayName,
            currency: "INR",
            locale: "en-IN",
            personalityMode: "Friendly",
            cycleResetDay: 1,
            resetDayConfigured: false,
          },
        },
        accounts: {
          create: {
            name: "Cash",
            type: "cash",
            startingBalance: 0,
          },
        },
        categories: {
          create: [
            { name: "Food", icon: "restaurant", colorToken: "#006c49" },
            { name: "Transport", icon: "directions_car", colorToken: "#ba1a1a" },
            { name: "Shopping", icon: "shopping_bag", colorToken: "#07006c" },
            { name: "Bills", icon: "receipt", colorToken: "#7c839b" },
            { name: "Entertainment", icon: "movie", colorToken: "#6750a4" },
            { name: "College", icon: "school", colorToken: "#006874" },
          ],
        },
        cycles: {
          create: {
            label: formatCycleLabel(cycleBoundaries.startDate, cycleBoundaries.endDate),
            startDate: cycleBoundaries.startDate,
            endDate: cycleBoundaries.endDate,
            expectedAmount: 0,
            frequency: "monthly",
            emergencyReserveAmount: 0,
            status: "active",
          },
        },
      },
      include: includeProfile ? { profile: true } : undefined,
    });
  }

  return user;
});

export async function getCurrentDbUser(includeProfile: true): Promise<Prisma.UserGetPayload<{ include: { profile: true } }> | null>;
export async function getCurrentDbUser(includeProfile?: false): Promise<Prisma.UserGetPayload<{}> | null>;
export async function getCurrentDbUser(includeProfile = false) {
  return (await getCurrentDbUserInternal(includeProfile)) as any;
}

export async function requireUser(includeProfile: true): Promise<Prisma.UserGetPayload<{ include: { profile: true } }>>;
export async function requireUser(includeProfile?: false): Promise<Prisma.UserGetPayload<{}>>;
export async function requireUser(includeProfile = false) {
  const user = await getCurrentDbUser(includeProfile as any);
  if (!user) {
    redirect("/login");
  }
  return user as any;
}
