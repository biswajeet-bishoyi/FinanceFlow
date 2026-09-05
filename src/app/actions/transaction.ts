"use server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { addExpenseSchema, addContributionSchema } from "@/lib/validation";
import { parseMoneyInput } from "@/lib/format";

export async function addExpense(formData: FormData) {
  const rawData = {
    amount: formData.get("amount") as string,
    categoryId: formData.get("categoryId") as string,
    date: formData.get("date") as string,
    note: (formData.get("note") as string) || "",
    splitWith: (formData.get("splitWith") as string) || "",
  };

  const parsed = addExpenseSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { amount, categoryId, date, note, splitWith } = parsed.data;
  const amountInPaise = parseMoneyInput(amount);
  if (amountInPaise <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  const user = await requireUser();

  const [category, existingAccount] = await Promise.all([
    prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: user.id }, { isSystemDefault: true }],
      },
    }),
    prisma.account.findFirst({
      where: { userId: user.id, archivedAt: null },
    }),
  ]);

  if (!category) {
    return { success: false, error: "Category not found" };
  }

  let account = existingAccount;
  if (!account) {
    account = await prisma.account.create({
      data: {
        userId: user.id,
        name: "Cash",
        type: "cash",
        startingBalance: 0,
      },
    });
  }

  const occurredAt = date ? new Date(date) : new Date();

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        accountId: account!.id,
        categoryId: categoryId,
        type: "expense",
        amount: amountInPaise,
        occurredAt,
        merchant: note?.trim() || undefined,
        notes: note?.trim() || undefined,
        paymentMethod: "Quick Add",
      },
    });

    if (splitWith) {
      // Verify friend exists for this user
      const friend = await tx.person.findFirst({
        where: { id: splitWith, userId: user.id },
      });
      if (!friend) {
        throw new Error("Friend not found");
      }

      // Equal split: payer + 1 friend = 2 shares
      const shareAmount = Math.round(amountInPaise / 2);

      // Create split expense
      await tx.splitExpense.create({
        data: {
          transactionId: transaction.id,
          splitMethod: "equal",
          totalAmount: amountInPaise,
        }
      });

      // Friend owes you the share (excluding your own share)
      await tx.lendingRecord.create({
        data: {
          userId: user.id,
          personId: splitWith,
          direction: "lent",
          amount: shareAmount,
          note: note ? `Split: ${note}` : "Split expense",
          occurredAt,
          status: "open",
        }
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/friends");
  revalidatePath("/analytics");
  revalidatePath("/budgets");
  return { success: true };
}

export async function addIncome(formData: FormData) {
  const amountStr = formData.get("amount") as string;
  const note = (formData.get("note") as string) || "Pocket Money";
  const dateStr = formData.get("date") as string;
  const sourceType = (formData.get("sourceType") as string) || "pocket_money";

  if (!amountStr) {
    return { success: false, error: "Amount is required" };
  }

  const amountInPaise = parseMoneyInput(amountStr);
  if (amountInPaise <= 0) {
    return { success: false, error: "Invalid amount" };
  }

  const user = await requireUser();

  // Fetch cycle, account, and category concurrently
  const [initialCycle, initialAccount, initialCategory] = await Promise.all([
    prisma.pocketMoneyCycle.findFirst({
      where: { userId: user.id, status: "active" },
    }),
    prisma.account.findFirst({
      where: { userId: user.id, archivedAt: null },
    }),
    prisma.category.findFirst({
      where: {
        userId: user.id,
        name: "Income",
      },
    }),
  ]);

  let cycle = initialCycle;
  if (!cycle) {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);

    cycle = await prisma.pocketMoneyCycle.create({
      data: {
        userId: user.id,
        label: "Current Cycle",
        startDate: now,
        endDate: nextMonth,
        expectedAmount: amountInPaise,
        frequency: "monthly",
        status: "active",
      },
    });
  }

  let account = initialAccount;
  if (!account) {
    account = await prisma.account.create({
      data: {
        userId: user.id,
        name: "Cash",
        type: "cash",
        startingBalance: 0,
      },
    });
  }

  let incomeCategory = initialCategory;
  if (!incomeCategory) {
    incomeCategory = await prisma.category.create({
      data: {
        userId: user.id,
        name: "Income",
        icon: "payments",
        colorToken: "var(--color-secondary)",
      },
    });
  }

  const occurredAt = dateStr ? new Date(dateStr) : new Date();

  await prisma.$transaction(async (tx) => {
    // 1. Create Income record
    await tx.income.create({
      data: {
        userId: user.id,
        cycleId: cycle!.id,
        amount: amountInPaise,
        sourceType,
        receivedAt: occurredAt,
        note: note.trim() || undefined,
      }
    });

    // 2. Create Transaction record so it appears in history
    await tx.transaction.create({
      data: {
        userId: user.id,
        accountId: account!.id,
        categoryId: incomeCategory!.id,
        type: "income",
        amount: amountInPaise,
        occurredAt,
        merchant: note.trim() || "Income",
        notes: note.trim() || undefined,
        paymentMethod: "Direct",
      }
    });
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  return { success: true };
}

export async function deleteTransaction(formData: FormData) {
  const transactionId = formData.get("id") as string;
  if (!transactionId) return { success: false, error: "Transaction ID required" };

  const user = await requireUser();

  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: user.id },
    include: { splitExpense: true }
  });

  if (!tx) return { success: false, error: "Transaction not found" };

  await prisma.$transaction(async (prismaTx) => {
    if (tx.splitExpense) {
      await prismaTx.splitExpense.deleteMany({
        where: { transactionId: tx.id }
      });
    }
    await prismaTx.transaction.delete({
      where: { id: transactionId }
    });
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  revalidatePath("/budgets");
  return { success: true };
}

export async function transferFunds(formData: FormData) {
  const amountStr = formData.get("amount") as string;
  const fromAccountId = formData.get("fromAccountId") as string;
  const toAccountId = formData.get("toAccountId") as string;
  const note = (formData.get("note") as string) || "Account transfer";

  if (!amountStr || !fromAccountId || !toAccountId) {
    return { success: false, error: "All fields required" };
  }

  if (fromAccountId === toAccountId) {
    return { success: false, error: "Source and destination accounts must be different" };
  }

  const amountInPaise = parseMoneyInput(amountStr);
  if (amountInPaise <= 0) {
    return { success: false, error: "Invalid transfer amount" };
  }

  const user = await requireUser();

  // Verify both accounts belong to the user
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: [fromAccountId, toAccountId] },
      userId: user.id,
    },
  });

  if (accounts.length !== 2) {
    return { success: false, error: "One or more accounts not found" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.transfer.create({
      data: {
        userId: user.id,
        fromAccountId,
        toAccountId,
        amount: amountInPaise,
        occurredAt: new Date(),
        note,
      }
    });
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}
