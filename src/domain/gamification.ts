export type AchievementBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progressPct: number;
  unlockedAtText?: string;
  category: "saving" | "habit" | "budget" | "social";
};

export type FinancialHealthData = {
  healthScore: number; // 0 - 100
  tier: "Elite" | "Healthy" | "Improving" | "Needs Attention";
  tierColor: string;
  scoreFactors: {
    name: string;
    score: number;
    maxScore: number;
    description: string;
  }[];
  streakDays: number;
  badges: AchievementBadge[];
};

export function calculateGamificationScore({
  transactionsCount,
  hasEmergencyReserve,
  hasGoals,
  goalContributionsCount,
  hasBudgets,
  hasFriends,
  availableBalance,
  safeToSpendToday,
}: {
  transactionsCount: number;
  hasEmergencyReserve: boolean;
  hasGoals: boolean;
  goalContributionsCount: number;
  hasBudgets: boolean;
  hasFriends: boolean;
  availableBalance: number;
  safeToSpendToday: number;
}): FinancialHealthData {
  // 1. Calculate Score Factors (Total = 100)
  const reserveScore = hasEmergencyReserve ? 25 : 10;
  const loggingScore = Math.min(25, transactionsCount * 5);
  const budgetScore = hasBudgets ? 25 : (safeToSpendToday > 0 ? 15 : 5);
  const goalScore = hasGoals ? (goalContributionsCount > 0 ? 25 : 15) : 10;

  const healthScore = Math.min(100, Math.max(10, reserveScore + loggingScore + budgetScore + goalScore));

  let tier: "Elite" | "Healthy" | "Improving" | "Needs Attention" = "Improving";
  let tierColor = "text-warning-amber";

  if (healthScore >= 85) {
    tier = "Elite";
    tierColor = "text-secondary";
  } else if (healthScore >= 65) {
    tier = "Healthy";
    tierColor = "text-info-blue";
  } else if (healthScore >= 40) {
    tier = "Improving";
    tierColor = "text-warning-amber";
  } else {
    tier = "Needs Attention";
    tierColor = "text-error";
  }

  // 2. Badges
  const badges: AchievementBadge[] = [
    {
      id: "reserve-guardian",
      name: "Reserve Guardian",
      description: "Protected a safety cushion for emergencies",
      icon: "shield",
      isUnlocked: hasEmergencyReserve,
      progressPct: hasEmergencyReserve ? 100 : 0,
      unlockedAtText: hasEmergencyReserve ? "Active" : "Set reserve in Settings",
      category: "saving",
    },
    {
      id: "habit-logger",
      name: "Daily Tracker",
      description: "Logged 5+ real transactions in your cycle",
      icon: "bolt",
      isUnlocked: transactionsCount >= 5,
      progressPct: Math.min(100, Math.round((transactionsCount / 5) * 100)),
      unlockedAtText: transactionsCount >= 5 ? "Unlocked" : `${transactionsCount}/5 logged`,
      category: "habit",
    },
    {
      id: "goal-crusher",
      name: "Goal Stasher",
      description: "Created a savings milestone and stashed money",
      icon: "target",
      isUnlocked: hasGoals,
      progressPct: hasGoals ? 100 : 0,
      unlockedAtText: hasGoals ? "Unlocked" : "Create a goal",
      category: "saving",
    },
    {
      id: "budget-boss",
      name: "Budget Boss",
      description: "Set conscious limits for categories",
      icon: "pie_chart",
      isUnlocked: hasBudgets,
      progressPct: hasBudgets ? 100 : 0,
      unlockedAtText: hasBudgets ? "Unlocked" : "Set a budget",
      category: "budget",
    },
    {
      id: "split-master",
      name: "Social Splitter",
      description: "Added friends to track group expenses & chai splits",
      icon: "group",
      isUnlocked: hasFriends,
      progressPct: hasFriends ? 100 : 0,
      unlockedAtText: hasFriends ? "Unlocked" : "Add a friend",
      category: "social",
    },
    {
      id: "zero-panic",
      name: "Positive Runway",
      description: "Maintained a positive Safe-to-Spend balance",
      icon: "sentiment_very_satisfied",
      isUnlocked: safeToSpendToday > 0 && availableBalance > 0,
      progressPct: safeToSpendToday > 0 ? 100 : 0,
      unlockedAtText: safeToSpendToday > 0 ? "Unlocked" : "Maintain positive balance",
      category: "saving",
    },
  ];

  return {
    healthScore,
    tier,
    tierColor,
    scoreFactors: [
      { name: "Emergency Buffer", score: reserveScore, maxScore: 25, description: "Reserve protection status" },
      { name: "Active Tracking", score: loggingScore, maxScore: 25, description: "Regular daily transaction capture" },
      { name: "Budget Discipline", score: budgetScore, maxScore: 25, description: "Category limits & adherence" },
      { name: "Savings Milestones", score: goalScore, maxScore: 25, description: "Stashing towards goals" },
    ],
    streakDays: Math.max(1, Math.min(14, transactionsCount)),
    badges,
  };
}
