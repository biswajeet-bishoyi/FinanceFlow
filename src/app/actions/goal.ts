"use server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createGoalSchema, addContributionSchema } from "@/lib/validation";
import { parseMoneyInput } from "@/lib/format";

export async function createGoal(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      targetAmount: formData.get("targetAmount") as string,
      icon: (formData.get("icon") as string) || undefined,
    };

    const parsed = createGoalSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { name, targetAmount, icon } = parsed.data;
    const targetAmountInPaise = parseMoneyInput(targetAmount);
    if (targetAmountInPaise <= 0) {
      return { success: false, error: "Target amount must be greater than 0" };
    }

    const user = await requireUser();

    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: name.trim(),
        targetAmount: targetAmountInPaise,
        status: "active",
        icon: icon || "savings",
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("createGoal error:", error);
    return { success: false, error: error.message };
  }
}

export async function addContribution(formData: FormData) {
  try {
    const rawData = {
      goalId: formData.get("goalId") as string,
      amount: formData.get("amount") as string,
    };

    const parsed = addContributionSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { goalId, amount } = parsed.data;
    const amountInPaise = parseMoneyInput(amount);
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const user = await requireUser();

    // Verify the goal belongs to this user
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId: user.id },
    });

    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    // Run in a transaction to update both the contribution log and the goal's currentAmount
    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.create({
        data: {
          goalId,
          amount: amountInPaise,
          occurredAt: new Date(),
        },
      });

      await tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amountInPaise },
        },
      });
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("addContribution error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGoal(formData: FormData) {
  try {
    const goalId = formData.get("id") as string;
    if (!goalId) {
      return { success: false, error: "Goal ID required" };
    }

    const user = await requireUser();

    // Verify the goal belongs to this user
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId: user.id },
    });

    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.deleteMany({
        where: { goalId }
      });
      await tx.savingsGoal.delete({
        where: { id: goalId }
      });
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("deleteGoal error:", error);
    return { success: false, error: error.message };
  }
}
