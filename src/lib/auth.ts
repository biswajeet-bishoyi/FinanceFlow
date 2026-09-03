import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireUser(includeProfile: true): Promise<Prisma.UserGetPayload<{ include: { profile: true } }>>;
export async function requireUser(includeProfile?: false): Promise<Prisma.UserGetPayload<{}>>;
export async function requireUser(includeProfile = false) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    redirect("/login");
  }

  let user = await prisma.user.findFirst({
    where: { authId: authUser.id },
    include: includeProfile ? { profile: true } : undefined
  });

  if (!user) {
    // Auto-initialize user if authenticated via Supabase
    const displayName = authUser.user_metadata?.displayName || authUser.email?.split("@")[0] || "Student";
    user = await prisma.user.create({
      data: {
        authId: authUser.id,
        profile: {
          create: {
            displayName,
            currency: "INR",
            locale: "en-IN",
            personalityMode: "Friendly",
          }
        },
        accounts: {
          create: {
            name: "Cash",
            type: "cash",
            startingBalance: 0,
          }
        },
        categories: {
          create: [
            { name: "Food", icon: "restaurant", colorToken: "#006c49" },
            { name: "Transport", icon: "directions_car", colorToken: "#ba1a1a" },
            { name: "Shopping", icon: "shopping_bag", colorToken: "#07006c" },
            { name: "Bills", icon: "receipt", colorToken: "#7c839b" },
            { name: "Entertainment", icon: "movie", colorToken: "#6750a4" },
            { name: "College", icon: "school", colorToken: "#006874" },
          ]
        },
        cycles: {
          create: {
            label: "Current Cycle",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            expectedAmount: 0,
            frequency: "monthly",
            emergencyReserveAmount: 0,
            status: "active",
          }
        }
      },
      include: includeProfile ? { profile: true } : undefined
    });
  }

  return user;
}
