"use server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyInput } from "@/lib/format";

const createBudgetSchema = z.object({
  categoryId: z.string().uuid().optional().or(z.literal("")),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be greater than 0"),
  warningThresholdPct: z.coerce.number().min(1).max(99).default(80),
  cautionThresholdPct: z.coerce.number().min(1).max(100).default(95),
});

export async function createBudget(formData: FormData) {
  try {
    const rawData = {
      categoryId: (formData.get("categoryId") as string) || "",
      amount: formData.get("amount") as string,
      warningThresholdPct: formData.get("warningThresholdPct") as string,
      cautionThresholdPct: formData.get("cautionThresholdPct") as string,
    };

    const parsed = createBudgetSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { categoryId, amount, warningThresholdPct, cautionThresholdPct } = parsed.data;
    const amountInPaise = parseMoneyInput(amount.toString());
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    if (warningThresholdPct >= cautionThresholdPct) {
      return { success: false, error: "Warning threshold must be less than caution threshold" };
    }

    const user = await requireUser();

    // Verify category belongs to user (or is system default) if specified
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId: user.id }, { isSystemDefault: true }],
        },
      });
      if (!category) {
        return { success: false, error: "Category not found" };
      }
    }

    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryId || null,
        period: "cycle",
        amount: amountInPaise,
        warningThresholdPct,
        cautionThresholdPct,
      }
    });

    revalidatePath("/budgets");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("createBudget error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBudget(formData: FormData) {
  try {
    const user = await requireUser();
    const budgetId = formData.get("id") as string;

    if (!budgetId) {
      return { success: false, error: "Budget ID required" };
    }

    // Verify the budget belongs to this user
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId: user.id },
    });

    if (!budget) {
      return { success: false, error: "Budget not found" };
    }

    await prisma.budget.delete({
      where: { id: budgetId, userId: user.id }
    });

    revalidatePath("/budgets");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("deleteBudget error:", error);
    return { success: false, error: error.message };
  }
}

export async function createDemoBudget() {
  try {
    const user = await requireUser();

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { userId: user.id, name: "Food" },
          { isSystemDefault: true, name: "Food" }
        ]
      }
    });

    if (!category) {
      return { success: false, error: "Food category not found" };
    }

    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        period: "cycle",
        amount: 500000, // 5,000 INR
        warningThresholdPct: 80,
        cautionThresholdPct: 95,
      }
    });

    revalidatePath("/budgets");
    return { success: true };
  } catch (error: any) {
    console.error("createDemoBudget error:", error);
    return { success: false, error: error.message };
  }
}
