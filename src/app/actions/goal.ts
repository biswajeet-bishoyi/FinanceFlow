"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const name = formData.get("name") as string;
    const targetAmountStr = formData.get("targetAmount") as string;
    
    if (!name || !targetAmountStr) {
      return;
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
    return;
  } catch (error: any) {
    return;
  }
}

export async function addContribution(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const goalId = formData.get("goalId") as string;
    const amountStr = formData.get("amount") as string;

    if (!goalId || !amountStr) {
      return;
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
    return;
  } catch (error: any) {
    return;
  }
}
