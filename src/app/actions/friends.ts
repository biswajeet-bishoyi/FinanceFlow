"use server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyInput } from "@/lib/format";

const addFriendSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

const recordLendingSchema = z.object({
  personId: z.string().uuid("Invalid friend"),
  direction: z.enum(["lent", "borrowed"]).default("lent"),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be greater than 0"),
  note: z.string().optional(),
});

export async function addFriend(formData: FormData) {
  try {
    const rawData = {
      name: (formData.get("name") as string)?.trim() || "",
    };

    const parsed = addFriendSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { name } = parsed.data;
    const user = await requireUser();

    // Deterministic color assignment based on name hash
    const colors = [
      "var(--color-secondary)",
      "var(--color-info-blue)",
      "var(--color-violet)",
      "var(--color-warning-amber)",
      "var(--color-on-primary-container)",
    ];
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const avatarColor = colors[hash % colors.length];

    await prisma.person.create({
      data: {
        userId: user.id,
        name,
        avatarColor,
      },
    });

    revalidatePath("/friends");
    revalidatePath("/add");
    return { success: true };
  } catch (error: any) {
    console.error("addFriend error:", error);
    return { success: false, error: error.message };
  }
}

export async function recordLending(formData: FormData) {
  try {
    const rawData = {
      personId: formData.get("personId") as string,
      direction: ((formData.get("direction") as string) || "lent") as "lent" | "borrowed",
      amount: formData.get("amount") as string,
      note: (formData.get("note") as string) || undefined,
    };

    const parsed = recordLendingSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { personId, direction, amount, note } = parsed.data;
    const amountInPaise = parseMoneyInput(amount.toString());
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const user = await requireUser();

    // Verify the friend exists for this user
    const friend = await prisma.person.findFirst({
      where: { id: personId, userId: user.id },
    });

    if (!friend) {
      return { success: false, error: "Friend not found" };
    }

    await prisma.lendingRecord.create({
      data: {
        userId: user.id,
        personId,
        direction,
        amount: amountInPaise,
        note: note?.trim() || "Direct loan",
        occurredAt: new Date(),
        status: "open",
      }
    });

    revalidatePath("/friends");
    return { success: true };
  } catch (error: any) {
    console.error("recordLending error:", error);
    return { success: false, error: error.message };
  }
}

export async function settleDebt(formData: FormData) {
  try {
    const user = await requireUser();
    const recordId = formData.get("recordId") as string;

    if (!recordId) {
      return { success: false, error: "Record ID required" };
    }

    // Verify the lending record belongs to this user
    const record = await prisma.lendingRecord.findFirst({
      where: { id: recordId, userId: user.id },
    });

    if (!record) {
      return { success: false, error: "Lending record not found" };
    }

    await prisma.lendingRecord.update({
      where: { id: recordId, userId: user.id },
      data: { status: "settled" },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch (error: any) {
    console.error("settleDebt error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFriend(formData: FormData) {
  try {
    const user = await requireUser();
    const personId = formData.get("personId") as string;

    if (!personId) {
      return { success: false, error: "Friend ID required" };
    }

    // Verify the friend exists for this user
    const friend = await prisma.person.findFirst({
      where: { id: personId, userId: user.id },
    });

    if (!friend) {
      return { success: false, error: "Friend not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.lendingRecord.deleteMany({
        where: { personId, userId: user.id }
      });
      await tx.person.delete({
        where: { id: personId, userId: user.id }
      });
    });

    revalidatePath("/friends");
    revalidatePath("/add");
    return { success: true };
  } catch (error: any) {
    console.error("deleteFriend error:", error);
    return { success: false, error: error.message };
  }
}
