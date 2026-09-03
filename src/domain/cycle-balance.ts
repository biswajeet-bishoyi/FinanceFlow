import { PocketMoneyCycle } from "@prisma/client";

export interface CycleBalanceInput {
  accounts: { startingBalance: number }[];
  cycle: PocketMoneyCycle & { incomes: { amount: number }[] };
  transactions: {
    amount: number;
    type: "expense" | "income" | "refund";
    occurredAt: Date;
  }[];
  goals: { currentAmount: number }[];
  recurringExpenses: {
    amount: number;
    nextDueAt: Date;
    active: boolean;
  }[];
}

/**
 * Calculates the available balance and related metrics for a pocket money cycle.
 * All amounts are in minor units (e.g. paise).
 * This is a pure function that can be unit tested.
 */
export function calculateCycleBalance(input: CycleBalanceInput) {
  const {
    accounts,
    cycle,
    transactions,
    goals,
    recurringExpenses,
  } = input;

  // Calculate starting balance from all accounts
  const startingBalance = accounts.reduce(
    (acc, account) => acc + account.startingBalance,
    0
  );

  // Calculate total income (only from the cycle's incomes)
  const totalIncome = cycle.incomes.reduce((acc, inc) => acc + inc.amount, 0);

  // Calculate total expenses for current cycle only
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const tDate = new Date(t.occurredAt);
      const cycleStart = new Date(cycle.startDate);
      const cycleEnd = new Date(cycle.endDate);
      return tDate >= cycleStart && tDate <= cycleEnd;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  // Calculate total saved from goals
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  // Calculate available balance
  // Available = starting + income - expenses - saved
  const availableBalance = startingBalance + totalIncome - totalExpenses - totalSaved;

  // Calculate upcoming recurring expenses due before cycle end
  const upcomingExpenses = recurringExpenses
    .filter(r => r.active)
    .filter(r => {
      const dueDate = new Date(r.nextDueAt);
      const cycleEnd = new Date(cycle.endDate);
      const today = new Date();
      return dueDate >= today && dueDate <= cycleEnd;
    })
    .reduce((acc, r) => acc + r.amount, 0);

  return {
    availableBalance,
    totalIncome,
    totalExpenses,
    totalSaved,
    upcomingExpenses,
  };
}