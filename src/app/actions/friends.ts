"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addFriend(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return { success: false, error: "Not logged in" };

    const name = formData.get("name") as string;
    if (!name) return { success: false, error: "Name required" };

    const colors = ["#4ADE80", "#60A5FA", "#F472B6", "#FBBF24", "#A78BFA"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    await prisma.person.create({
      data: {
        userId: user.id,
        name,
        avatarColor,
      },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function settleDebt(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return { success: false, error: "Not logged in" };

    const recordId = formData.get("recordId") as string;
    
    await prisma.lendingRecord.update({
      where: { id: recordId, userId: user.id },
      data: { status: "settled" },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
