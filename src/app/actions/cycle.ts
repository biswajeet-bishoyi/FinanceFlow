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

import { calculateCycleBoundaries, formatCycleLabel } from "@/lib/cycle";

export async function setCycleResetDay(formData: FormData) {
  try {
    const user = await requireUser();
    const dayStr = formData.get("resetDay") as string;
    const day = Math.min(28, Math.max(1, parseInt(dayStr, 10) || 1));

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        cycleResetDay: day,
        resetDayConfigured: true,
      },
      create: {
        userId: user.id,
        displayName: "Student",
        cycleResetDay: day,
        resetDayConfigured: true,
      },
    });

    const now = new Date();
    const { startDate, endDate } = calculateCycleBoundaries(day, now);
    const label = formatCycleLabel(startDate, endDate);

    const activeCycle = await prisma.pocketMoneyCycle.findFirst({
      where: { userId: user.id, status: "active" },
    });

    if (activeCycle) {
      await prisma.pocketMoneyCycle.update({
        where: { id: activeCycle.id },
        data: {
          startDate,
          endDate,
          label,
        },
      });
    } else {
      await prisma.pocketMoneyCycle.create({
        data: {
          userId: user.id,
          label,
          startDate,
          endDate,
          expectedAmount: 0,
          frequency: "monthly",
          emergencyReserveAmount: 0,
          status: "active",
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/analytics");
    revalidatePath("/budgets");
    revalidatePath("/calendar");
    revalidatePath("/settings");
    revalidatePath("/what-if");
    revalidatePath("/afford");
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
    const labelInput = formData.get("label") as string;
    const expectedAmountStr = formData.get("expectedAmount") as string;
    const reserveStr = formData.get("emergencyReserve") as string;

    let startDate: Date;
    let endDate: Date;
    let label = labelInput?.trim();

    if (customStartDateStr && customEndDateStr) {
      startDate = new Date(customStartDateStr);
      endDate = new Date(customEndDateStr);
      if (!label) label = "Monthly Cycle";
    } else if (startDayStr) {
      const day = Math.min(28, Math.max(1, parseInt(startDayStr, 10) || 1));
      
      // Persist chosen reset day in profile
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { cycleResetDay: day, resetDayConfigured: true },
        create: {
          userId: user.id,
          displayName: "Student",
          cycleResetDay: day,
          resetDayConfigured: true,
        },
      });

      const boundaries = calculateCycleBoundaries(day, new Date());
      startDate = boundaries.startDate;
      endDate = boundaries.endDate;
      if (!label) label = formatCycleLabel(startDate, endDate);
    } else {
      const boundaries = calculateCycleBoundaries(1, new Date());
      startDate = boundaries.startDate;
      endDate = boundaries.endDate;
      if (!label) label = formatCycleLabel(startDate, endDate);
    }

    const expectedAmount = expectedAmountStr ? parseMoneyInput(expectedAmountStr) : 0;
    const emergencyReserveAmount = reserveStr ? parseMoneyInput(reserveStr) : 0;

    if (cycleId) {
      await prisma.pocketMoneyCycle.update({
        where: { id: cycleId, userId: user.id },
        data: {
          label,
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
          label,
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
    revalidatePath("/what-if");
    revalidatePath("/afford");
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
