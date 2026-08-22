"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createRecurringExpense(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const label = formData.get("label") as string;
    const amountStr = formData.get("amount") as string;
    const nextDueAtStr = formData.get("nextDueAt") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!label || !amountStr || !nextDueAtStr || !categoryId) {
      return;
    }

    const amount = Math.round(parseFloat(amountStr) * 100);
    const nextDueAt = new Date(nextDueAtStr);

    const account = await prisma.account.findFirst({
      where: { userId: user.id },
    });
    if (!account) return;

    await prisma.recurringExpense.create({
      data: {
        userId: user.id,
        categoryId,
        accountId: account.id,
        label,
        amount,
        recurrenceRule: "monthly", // simplified for MVP
        nextDueAt,
        active: true,
      },
    });

    revalidatePath("/recurring");
    revalidatePath("/");
    return;
  } catch (error: any) {
    return;
  }
}

export async function cancelRecurringExpense(formData: FormData) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const id = formData.get("id") as string;

    await prisma.recurringExpense.update({
      where: { id, userId: user.id },
      data: { active: false },
    });

    revalidatePath("/recurring");
    revalidatePath("/");
    return;
  } catch (error: any) {
    return;
  }
}
