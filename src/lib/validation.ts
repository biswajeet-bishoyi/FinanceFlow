import { z } from "zod";

/** Parse and validate a money string into minor units (paise) */
export const moneySchema = z.string().refine(
  (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
  "Amount must be a number greater than 0"
);

/** Convert validated money string to minor units */
export function parseMoneyInput(input: string): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

// Transaction validation
export const addExpenseSchema = z.object({
  amount: moneySchema,
  categoryId: z.string().uuid("Invalid category"),
  date: z.string().optional(),
  note: z.string().optional(),
  merchant: z.string().optional(),
  splitWith: z.string().uuid("Invalid friend").optional().or(z.literal("")),
});

// Goal validation
export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: moneySchema,
  icon: z.string().optional(),
});

export const addContributionSchema = z.object({
  goalId: z.string().uuid("Invalid goal"),
  amount: moneySchema,
});

// Recurring expense validation
export const createRecurringSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  amount: moneySchema,
  categoryId: z.string().uuid("Invalid category"),
  nextDueAt: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  recurrenceRule: z.enum(["daily", "weekly", "monthly", "yearly"]),
});

// Cycle validation
export const updateEmergencyReserveSchema = z.object({
  cycleId: z.string().uuid("Invalid cycle"),
  amount: z.string().refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
    "Amount must be 0 or greater"
  ),
});

// Budget validation
export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Invalid category").optional().or(z.literal("")),
  amount: moneySchema,
  period: z.enum(["weekly", "cycle"]),
  warningThresholdPct: z.coerce.number().min(1).max(99).optional().default(80),
  cautionThresholdPct: z.coerce.number().min(1).max(100).optional().default(95),
});

// Friends validation
export const addFriendSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const recordLendingSchema = z.object({
  personId: z.string().uuid("Invalid friend"),
  direction: z.enum(["lent", "borrowed"]),
  amount: moneySchema,
  note: z.string().optional(),
});
