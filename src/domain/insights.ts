export type SmartInsight = {
  id: string;
  type: "trend" | "saving" | "warning" | "achievement" | "tip";
  title: string;
  description: string;
  icon: string;
  color: string;
  impact?: string;
  category?: string;
};

export function generateSmartInsights({
  transactions,
  cycle,
  safeToSpendToday,
  daysRemaining,
  availableBalance,
}: {
  transactions: Array<{
    amount: number;
    type: string;
    occurredAt: Date | string;
    category?: { name: string };
  }>;
  cycle: {
    startDate: Date | string;
    endDate: Date | string;
    emergencyReserveAmount: number;
    expectedAmount: number;
  };
  safeToSpendToday: number;
  daysRemaining: number;
  availableBalance: number;
}): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const expenses = transactions.filter((t) => t.type === "expense");

  // 1. Safe to spend runway insight
  if (daysRemaining > 0) {
    if (safeToSpendToday > 50000) { // > ₹500/day
      insights.push({
        id: "runway-healthy",
        type: "saving",
        title: "Healthy Daily Allowance",
        description: `You can comfortably spend up to ₹${(safeToSpendToday / 100).toFixed(0)} per day for the next ${daysRemaining} days.`,
        icon: "sentiment_satisfied",
        color: "text-secondary bg-secondary-container/20 border-secondary/40",
      });
    } else if (safeToSpendToday < 15000 && safeToSpendToday > 0) { // < ₹150/day
      insights.push({
        id: "runway-tight",
        type: "warning",
        title: "Daily Spend Running Low",
        description: `Your safe allowance is ₹${(safeToSpendToday / 100).toFixed(0)}/day. Try cooking at hostel or reducing snacks to make it last ${daysRemaining} more days.`,
        icon: "warning",
        color: "text-warning-amber bg-warning-amber/15 border-warning-amber/40",
      });
    }
  }

  // 2. Top spending category insight
  const catTotals: Record<string, number> = {};
  expenses.forEach((t) => {
    const cat = t.category?.name || "Other";
    catTotals[cat] = (catTotals[cat] || 0) + t.amount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0 && sortedCats[0][1] > 0) {
    const [topCat, topAmt] = sortedCats[0];
    insights.push({
      id: "top-category",
      type: "trend",
      title: `${topCat} is your top expense`,
      description: `You've spent ₹${(topAmt / 100).toFixed(2)} on ${topCat} so far in this cycle.`,
      icon: "pie_chart",
      color: "text-info-blue bg-info-blue-bg border-info-blue/30",
    });
  }

  // 3. Weekend vs Weekday analysis
  let weekdaySpend = 0;
  let weekdayCount = 0;
  let weekendSpend = 0;
  let weekendCount = 0;

  expenses.forEach((t) => {
    const day = new Date(t.occurredAt).getDay();
    if (day === 0 || day === 6) {
      weekendSpend += t.amount;
      weekendCount++;
    } else {
      weekdaySpend += t.amount;
      weekdayCount++;
    }
  });

  if (weekendCount > 0 && weekdayCount > 0) {
    const avgWeekend = weekendSpend / weekendCount;
    const avgWeekday = weekdaySpend / weekdayCount;
    if (avgWeekend > avgWeekday * 1.3) {
      insights.push({
        id: "weekend-surge",
        type: "tip",
        title: "Weekend spending surges",
        description: `You tend to spend ~${Math.round((avgWeekend / avgWeekday - 1) * 100)}% more on weekends with outings & food delivery.`,
        icon: "local_cafe",
        color: "text-violet bg-violet-bg border-violet/30",
      });
    }
  }

  // 4. Reserve Protection
  if (cycle.emergencyReserveAmount > 0 && availableBalance > cycle.emergencyReserveAmount) {
    insights.push({
      id: "reserve-intact",
      type: "achievement",
      title: "Emergency Reserve is 100% Intact",
      description: `Your ₹${(cycle.emergencyReserveAmount / 100).toFixed(0)} safety net is completely protected.`,
      icon: "shield",
      color: "text-secondary bg-secondary-container/20 border-secondary/40",
    });
  }

  // 5. Default tip if few transactions
  if (insights.length < 2) {
    insights.push({
      id: "smart-rule-tip",
      type: "tip",
      title: "Student Pro-Tip: Settle splits quickly",
      description: "Ask hostel friends to settle canteen & chai splits within 24 hours so your safe daily spend stays accurate.",
      icon: "lightbulb",
      color: "text-primary bg-surface-container border-surface-container-high",
    });
  }

  return insights;
}
