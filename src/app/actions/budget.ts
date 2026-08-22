"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDemoBudget() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");

  const category = await prisma.category.findFirst({
    where: { name: "Food" }
  });

  if (!category) throw new Error("No food category found");

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
}
