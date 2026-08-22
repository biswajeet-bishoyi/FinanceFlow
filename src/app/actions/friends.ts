"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addFriend(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const name = formData.get("name") as string;
    if (!name) return;

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
    return;
  } catch (error: any) {
    return;
  }
}

export async function settleDebt(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const recordId = formData.get("recordId") as string;
    
    await prisma.lendingRecord.update({
      where: { id: recordId, userId: user.id },
      data: { status: "settled" },
    });

    revalidatePath("/friends");
    return;
  } catch (error: any) {
    return;
  }
}
