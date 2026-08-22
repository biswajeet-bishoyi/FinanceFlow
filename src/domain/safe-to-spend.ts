export interface SafeToSpendInput {
  availableBalance: number;
  cycleEndDate: Date;
  today: Date;
  emergencyReserve?: number;
  upcomingExpenses?: number;
}

export interface SafeToSpendBreakdown {
  availableBalance: number;
  emergencyReserve: number;
  upcomingExpenses: number;
  spendable: number;
  daysRemaining: number;
  safeToSpendToday: number;
  weeklySafeSpend: number;
}

/**
 * Calculates the safe-to-spend amount based on PRD V1.5 logic.
 * All amounts are in minor units (e.g. paise).
 */
export function calculateSafeToSpend(input: SafeToSpendInput): SafeToSpendBreakdown {
  const {
    availableBalance,
    cycleEndDate,
    today,
    emergencyReserve = 0,
    upcomingExpenses = 0,
  } = input;

  // Calculate days remaining (inclusive of today)
  const diffTime = cycleEndDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Floor at 1 so we never divide by zero
  const daysRemaining = Math.max(1, diffDays);

  // Spendable calculation
  const spendable = availableBalance - emergencyReserve - upcomingExpenses;

  // Safe to spend today (round down to nearest whole unit per PRD)
  // Since we are working in minor units (e.g., paise), "nearest whole currency unit"
  // means we divide by 100, round down, and multiply by 100? 
  // Wait, PRD Section 37: "always round down to the nearest whole currency unit"
  // If currency is INR, 1 unit = 100 paise.
  const safeDaily = Math.floor(spendable / daysRemaining);
  const safeToSpendToday = Math.floor(safeDaily / 100) * 100;

  // Floor at 0 for safe to spend per Section 28
  const finalSafeToSpend = Math.max(0, safeToSpendToday);

  return {
    availableBalance,
    emergencyReserve,
    upcomingExpenses,
    spendable,
    daysRemaining,
    safeToSpendToday: finalSafeToSpend,
    weeklySafeSpend: finalSafeToSpend * Math.min(7, daysRemaining),
  };
}
