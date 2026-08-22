"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return { success: false, error: "Not logged in" };

    const name = formData.get("name") as string;
    const targetAmountStr = formData.get("targetAmount") as string;
    
    if (!name || !targetAmountStr) {
      return { success: false, error: "Missing required fields" };
    }

    // Convert to paise (cents)
    const targetAmount = Math.round(parseFloat(targetAmountStr) * 100);

    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name,
        targetAmount,
        status: "active",
        icon: "savings",
      },
    });

    revalidatePath("/goals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addContribution(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return { success: false, error: "Not logged in" };

    const goalId = formData.get("goalId") as string;
    const amountStr = formData.get("amount") as string;

    if (!goalId || !amountStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Math.round(parseFloat(amountStr) * 100);

    // Run in a transaction to update both the contribution log and the goal's currentAmount
    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.create({
        data: {
          goalId,
          amount,
          occurredAt: new Date(),
        },
      });

      await tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
        },
      });
    });

    revalidatePath("/goals");
    revalidatePath("/"); // Update home dashboard (affects available balance if we implement it)
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
