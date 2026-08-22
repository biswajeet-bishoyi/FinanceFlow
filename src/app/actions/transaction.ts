import { requireUser } from "@/lib/auth";
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addExpense(formData: FormData) {
  const amountStr = formData.get("amount") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!amountStr || !categoryId) {
    throw new Error("Missing amount or category");
  }

  const amountInPaise = Math.round(parseFloat(amountStr) * 100);

  // For V1, we fetch the first user and their first active account to log against
  const user = await requireUser();
  

  const account = await prisma.account.findFirst({
    where: { userId: user.id },
  });
  
  if (!account) throw new Error("No account found");

    const splitWith = formData.get("splitWith") as string;

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          categoryId: categoryId,
          type: "expense",
          amount: amountInPaise,
          occurredAt: new Date(),
          paymentMethod: "Quick Add",
        },
      });

      if (splitWith) {
        const shareAmount = Math.round(amountInPaise / 2);
        
        await tx.splitExpense.create({
          data: {
            transactionId: transaction.id,
            splitMethod: "equal",
            totalAmount: amountInPaise,
          }
        });

        // Friend owes you half
        await tx.lendingRecord.create({
          data: {
            userId: user.id,
            personId: splitWith,
            direction: "lent",
            amount: shareAmount,
            occurredAt: new Date(),
            status: "open",
          }
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/friends");
    return;
}
