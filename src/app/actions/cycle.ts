import { requireUser } from "@/lib/auth";
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateEmergencyReserve(formData: FormData) {
  try {
    const user = await requireUser();
    

    const cycleId = formData.get("cycleId") as string;
    const amountStr = formData.get("amount") as string;

    if (!cycleId || !amountStr) {
      return;
    }

    const amount = Math.round(parseFloat(amountStr) * 100);

    await prisma.pocketMoneyCycle.update({
      where: { id: cycleId, userId: user.id },
      data: { emergencyReserveAmount: amount },
    });

    revalidatePath("/");
    return;
  } catch (error: any) {
    return;
  }
}
