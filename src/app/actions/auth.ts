"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  
  const supabase = await createClient();

  // 1. Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    // 2. Create user in Prisma
    const user = await prisma.user.create({
      data: {
        authId: data.user.id,
        profile: {
          create: {
            displayName: name || email.split("@")[0],
          }
        }
      }
    });

    // 3. Setup default categories for this user
    await prisma.category.createMany({
      data: [
        { userId: user.id, name: "Food", icon: "restaurant", colorToken: "#006c49" },
        { userId: user.id, name: "Transport", icon: "directions_car", colorToken: "#ba1a1a" },
        { userId: user.id, name: "Shopping", icon: "shopping_bag", colorToken: "#07006c" },
        { userId: user.id, name: "Bills", icon: "receipt", colorToken: "#7c839b" },
      ]
    });
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
