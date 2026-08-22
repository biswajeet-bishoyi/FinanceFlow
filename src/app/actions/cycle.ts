"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateEmergencyReserve(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return { success: false, error: "Not logged in" };

    const cycleId = formData.get("cycleId") as string;
    const amountStr = formData.get("amount") as string;

    if (!cycleId || !amountStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Math.round(parseFloat(amountStr) * 100);

    await prisma.pocketMoneyCycle.update({
      where: { id: cycleId, userId: user.id },
      data: { emergencyReserveAmount: amount },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
