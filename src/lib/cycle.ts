import { prisma } from "@/lib/db";
import { PocketMoneyCycle } from "@prisma/client";

/**
 * Helper to get maximum days in a specific month (handles leap years).
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Calculates start and end dates of the monthly cycle anchored to anchorDay.
 * Clamps anchorDay to the month's maximum day (per PRD Section 37).
 */
export function calculateCycleBoundaries(anchorDay: number = 1, referenceDate: Date = new Date()) {
  const ref = new Date(referenceDate);
  const currentYear = ref.getFullYear();
  const currentMonth = ref.getMonth();
  const currentDay = ref.getDate();

  // Clamp desired anchor day between 1 and 31
  const targetDay = Math.max(1, Math.min(31, anchorDay));

  let startYear = currentYear;
  let startMonth = currentMonth;

  // Check if today is on or after the anchor day of this month
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const effectiveDayThisMonth = Math.min(targetDay, daysInCurrentMonth);

  if (currentDay >= effectiveDayThisMonth) {
    // Current cycle started this month
    startYear = currentYear;
    startMonth = currentMonth;
  } else {
    // Current cycle started last month
    startMonth = currentMonth - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = currentYear - 1;
    }
  }

  const daysInStartMonth = getDaysInMonth(startYear, startMonth);
  const actualStartDay = Math.min(targetDay, daysInStartMonth);
  const startDate = new Date(startYear, startMonth, actualStartDay, 0, 0, 0, 0);

  // Cycle ends the day before next cycle starts
  let nextStartYear = startYear;
  let nextStartMonth = startMonth + 1;
  if (nextStartMonth > 11) {
    nextStartMonth = 0;
    nextStartYear = startYear + 1;
  }

  const daysInNextMonth = getDaysInMonth(nextStartYear, nextStartMonth);
  const actualNextStartDay = Math.min(targetDay, daysInNextMonth);

  // End date is 1 millisecond before next cycle starts
  const endDate = new Date(nextStartYear, nextStartMonth, actualNextStartDay, 0, 0, 0, 0);
  endDate.setMilliseconds(endDate.getMilliseconds() - 1);

  return { startDate, endDate };
}

/**
 * Human-readable label for a cycle (e.g., "October 2026 Cycle" or "Oct 5 – Nov 4 Cycle").
 */
export function formatCycleLabel(startDate: Date, endDate: Date): string {
  const startMonthName = startDate.toLocaleDateString("en-IN", { month: "short" });
  const endMonthName = endDate.toLocaleDateString("en-IN", { month: "short" });
  const year = startDate.getFullYear();

  if (startDate.getDate() === 1) {
    return `${startDate.toLocaleDateString("en-IN", { month: "long" })} ${year}`;
  }

  if (startMonthName === endMonthName) {
    return `${startMonthName} ${startDate.getDate()}–${endDate.getDate()} ${year}`;
  }

  return `${startMonthName} ${startDate.getDate()} – ${endMonthName} ${endDate.getDate()} ${year}`;
}

/**
 * Returns the active cycle for a user.
 * If the active cycle has passed its endDate, automatically marks it as closed
 * and generates the new cycle for the current period (Lazy Auto-Rollover).
 */
export async function getOrRollActiveCycle<T extends boolean = false>(
  userId: string,
  options?: { includeIncomes?: T }
): Promise<PocketMoneyCycle & (T extends true ? { incomes: any[] } : {})> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const anchorDay = profile?.cycleResetDay || 1;
  const now = new Date();

  // Find currently active cycle
  let activeCycle = await prisma.pocketMoneyCycle.findFirst({
    where: { userId, status: "active" },
    include: options?.includeIncomes ? { incomes: true } : undefined,
    orderBy: { startDate: "desc" },
  });

  // Check if cycle is missing or expired
  if (!activeCycle || now > activeCycle.endDate) {
    // If there is an expired active cycle, close it
    if (activeCycle && now > activeCycle.endDate) {
      await prisma.pocketMoneyCycle.updateMany({
        where: { userId, status: "active", endDate: { lt: now } },
        data: { status: "closed" },
      });
    }

    // Compute boundaries for the new cycle
    const { startDate, endDate } = calculateCycleBoundaries(anchorDay, now);
    const label = formatCycleLabel(startDate, endDate);

    // Carry forward settings from previous cycle if available
    const expectedAmount = activeCycle?.expectedAmount || 0;
    const emergencyReserveAmount = activeCycle?.emergencyReserveAmount || 0;
    const frequency = activeCycle?.frequency || "monthly";

    // Close any other active cycles just in case
    await prisma.pocketMoneyCycle.updateMany({
      where: { userId, status: "active" },
      data: { status: "closed" },
    });

    activeCycle = await prisma.pocketMoneyCycle.create({
      data: {
        userId,
        label,
        startDate,
        endDate,
        expectedAmount,
        frequency,
        emergencyReserveAmount,
        status: "active",
      },
      include: options?.includeIncomes ? { incomes: true } : undefined,
    });
  }

  return activeCycle as any;
}
