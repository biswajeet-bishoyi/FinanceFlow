"use server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseMoneyInput } from "@/lib/format";

const updateEmergencyReserveSchema = z.object({
  cycleId: z.string().uuid("Invalid cycle"),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Amount must be 0 or greater"),
});

const startNewCycleSchema = z.object({
  label: z.string().optional(),
  expectedAmount: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function updateEmergencyReserve(formData: FormData) {
  try {
    const rawData = {
      cycleId: formData.get("cycleId") as string,
      amount: formData.get("amount") as string,
    };

    const parsed = updateEmergencyReserveSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { cycleId, amount } = parsed.data;
    const amountInPaise = parseMoneyInput(amount.toString());

    const user = await requireUser();

    // Verify the cycle belongs to this user
    const cycle = await prisma.pocketMoneyCycle.findFirst({
      where: { id: cycleId, userId: user.id },
    });

    if (!cycle) {
      return { success: false, error: "Cycle not found" };
    }

    await prisma.pocketMoneyCycle.update({
      where: { id: cycleId, userId: user.id },
      data: { emergencyReserveAmount: amountInPaise },
    });

    revalidatePath("/");
    revalidatePath("/analytics");
    revalidatePath("/settings");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCycleSettings(formData: FormData) {
  try {
    const user = await requireUser();
    const cycleId = formData.get("cycleId") as string;
    const startDayStr = formData.get("startDay") as string;
    const customStartDateStr = formData.get("startDate") as string;
    const customEndDateStr = formData.get("endDate") as string;
    const label = (formData.get("label") as string) || "Monthly Cycle";
    const expectedAmountStr = formData.get("expectedAmount") as string;
    const reserveStr = formData.get("emergencyReserve") as string;

    let startDate: Date;
    let endDate: Date;

    if (customStartDateStr && customEndDateStr) {
      startDate = new Date(customStartDateStr);
      endDate = new Date(customEndDateStr);
    } else if (startDayStr) {
      const day = Math.min(28, Math.max(1, parseInt(startDayStr, 10) || 1));
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // If today is on or after the start day of this month
      if (today.getDate() >= day) {
        startDate = new Date(currentYear, currentMonth, day, 0, 0, 0);
        endDate = new Date(currentYear, currentMonth + 1, day - 1, 23, 59, 59);
      } else {
        // We are in the cycle that started last month
        startDate = new Date(currentYear, currentMonth - 1, day, 0, 0, 0);
        endDate = new Date(currentYear, currentMonth, day - 1, 23, 59, 59);
      }
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const expectedAmount = expectedAmountStr ? parseMoneyInput(expectedAmountStr) : 0;
    const emergencyReserveAmount = reserveStr ? parseMoneyInput(reserveStr) : 0;

    if (cycleId) {
      await prisma.pocketMoneyCycle.update({
        where: { id: cycleId, userId: user.id },
        data: {
          label: label.trim(),
          startDate,
          endDate,
          expectedAmount,
          emergencyReserveAmount,
        }
      });
    } else {
      // Create new active cycle
      await prisma.pocketMoneyCycle.updateMany({
        where: { userId: user.id, status: "active" },
        data: { status: "closed" }
      });

      await prisma.pocketMoneyCycle.create({
        data: {
          userId: user.id,
          label: label.trim(),
          startDate,
          endDate,
          expectedAmount,
          frequency: "monthly",
          emergencyReserveAmount,
          status: "active",
        }
      });
    }

    revalidatePath("/");
    revalidatePath("/analytics");
    revalidatePath("/budgets");
    revalidatePath("/calendar");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfileSettings(formData: FormData) {
  try {
    const user = await requireUser();
    const displayName = (formData.get("displayName") as string)?.trim();
    const personalityMode = (formData.get("personalityMode") as string) || "Friendly";

    if (!displayName) {
      return { success: false, error: "Display name cannot be empty" };
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        displayName,
        personalityMode,
      },
      create: {
        userId: user.id,
        displayName,
        personalityMode,
        currency: "INR",
        locale: "en-IN",
      }
    });

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function startNewCycle(formData: FormData) {
  try {
    const rawData = {
      label: (formData.get("label") as string) || undefined,
      expectedAmount: (formData.get("expectedAmount") as string) || undefined,
      startDate: (formData.get("startDate") as string) || undefined,
      endDate: (formData.get("endDate") as string) || undefined,
    };

    const parsed = startNewCycleSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const user = await requireUser();
    const label = (rawData.label || "Monthly Cycle").trim();
    const expectedAmount = rawData.expectedAmount ? parseMoneyInput(rawData.expectedAmount) : 0;

    const startDate = rawData.startDate ? new Date(rawData.startDate) : new Date();
    let endDate = rawData.endDate ? new Date(rawData.endDate) : new Date(startDate);
    if (!rawData.endDate) {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Set any existing active cycle to closed
    await prisma.pocketMoneyCycle.updateMany({
      where: { userId: user.id, status: "active" },
      data: { status: "closed" }
    });

    await prisma.pocketMoneyCycle.create({
      data: {
        userId: user.id,
        label,
        startDate,
        endDate,
        expectedAmount,
        frequency: "monthly",
        emergencyReserveAmount: 0,
        status: "active",
      }
    });

    revalidatePath("/");
    revalidatePath("/analytics");
    revalidatePath("/budgets");
    revalidatePath("/calendar");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
