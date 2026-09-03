"use server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyInput } from "@/lib/format";

const createRecurringSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be greater than 0"),
  categoryId: z.string().uuid("Invalid category"),
  nextDueAt: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  recurrenceRule: z.enum(["daily", "weekly", "monthly", "yearly"]).default("monthly"),
});

export async function createRecurringExpense(formData: FormData) {
  try {
    const rawData = {
      label: formData.get("label") as string,
      amount: formData.get("amount") as string,
      nextDueAt: formData.get("nextDueAt") as string,
      categoryId: formData.get("categoryId") as string,
      recurrenceRule: ((formData.get("recurrenceRule") as string) || "monthly") as
        | "daily" | "weekly" | "monthly" | "yearly",
    };

    const parsed = createRecurringSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { label, amount, nextDueAt, categoryId, recurrenceRule } = parsed.data;
    const amountInPaise = parseMoneyInput(amount.toString());
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const user = await requireUser();

    // Verify category belongs to user (or is system default)
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: user.id }, { isSystemDefault: true }],
      },
    });
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    let account = await prisma.account.findFirst({
      where: { userId: user.id, archivedAt: null },
    });

    if (!account) {
      account = await prisma.account.create({
        data: {
          userId: user.id,
          name: "Cash",
          type: "cash",
          startingBalance: 0,
        }
      });
    }

    await prisma.recurringExpense.create({
      data: {
        userId: user.id,
        categoryId,
        accountId: account.id,
        label: label.trim(),
        amount: amountInPaise,
        recurrenceRule,
        nextDueAt: new Date(nextDueAt),
        active: true,
      },
    });

    revalidatePath("/recurring");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("createRecurringExpense error:", error);
    return { success: false, error: error.message };
  }
}

export async function cancelRecurringExpense(formData: FormData) {
  try {
    const user = await requireUser();
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID required" };
    }

    // Verify the recurring expense belongs to this user
    const recurring = await prisma.recurringExpense.findFirst({
      where: { id, userId: user.id },
    });

    if (!recurring) {
      return { success: false, error: "Recurring expense not found" };
    }

    await prisma.recurringExpense.update({
      where: { id, userId: user.id },
      data: { active: false },
    });

    revalidatePath("/recurring");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("cancelRecurringExpense error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRecurringExpense(formData: FormData) {
  try {
    const user = await requireUser();
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID required" };
    }

    // Verify the recurring expense belongs to this user
    const recurring = await prisma.recurringExpense.findFirst({
      where: { id, userId: user.id },
    });

    if (!recurring) {
      return { success: false, error: "Recurring expense not found" };
    }

    await prisma.recurringExpense.delete({
      where: { id, userId: user.id }
    });

    revalidatePath("/recurring");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("deleteRecurringExpense error:", error);
    return { success: false, error: error.message };
  }
}
