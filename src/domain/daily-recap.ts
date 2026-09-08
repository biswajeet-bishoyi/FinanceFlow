export type DailyTransactionItem = {
  id: string;
  amount: number; // in paise
  type: string;
  occurredAt: Date | string;
  merchant?: string | null;
  notes?: string | null;
  category?: {
    name: string;
    icon?: string;
    colorToken?: string;
  } | null;
};

export type CategorySpendBreakdown = {
  categoryName: string;
  icon?: string;
  colorToken?: string;
  totalAmount: number; // in paise
  percentage: number;
  transactionCount: number;
};

export type FinancialArchetype = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  gradient: string;
};

export type DailyNightRecapResult = {
  isNightTime: boolean;
  currentHour: number;
  dateStr: string;
  totalSpentToday: number; // in paise
  safeToSpendToday: number; // in paise
  differencePaise: number; // positive = saved, negative = overspent
  status: "zero_spend" | "under_budget" | "at_budget" | "over_budget";
  headline: string;
  subtext: string;
  categoryBreakdown: CategorySpendBreakdown[];
  transactionsToday: DailyTransactionItem[];
  largestPurchase: DailyTransactionItem | null;
  peakSpendingHour: string | null;
  archetype: FinancialArchetype;
  realWorldComparison: string;
};

export function calculateDailyNightRecap({
  transactions,
  safeToSpendToday,
  now = new Date(),
}: {
  transactions: DailyTransactionItem[];
  safeToSpendToday: number;
  now?: Date;
}): DailyNightRecapResult {
  const currentHour = now.getHours();
  // Evening/Night is defined as 8:00 PM (20:00) through 4:00 AM
  const isNightTime = currentHour >= 20 || currentHour < 4;

  const targetYear = now.getFullYear();
  const targetMonth = now.getMonth();
  const targetDate = now.getDate();

  // Filter only same-day expense transactions
  const sameDayExpenses = transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const d = new Date(t.occurredAt);
    return (
      d.getFullYear() === targetYear &&
      d.getMonth() === targetMonth &&
      d.getDate() === targetDate
    );
  });

  // Sort newest first
  sameDayExpenses.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  const totalSpentToday = sameDayExpenses.reduce((acc, t) => acc + t.amount, 0);

  // Group by category to answer "where money spent"
  const catMap = new Map<
    string,
    {
      totalAmount: number;
      count: number;
      icon?: string;
      colorToken?: string;
    }
  >();

  // Hour tracking for peak spending window
  const hourMap = new Map<number, number>();

  for (const t of sameDayExpenses) {
    const catName = t.category?.name || "Uncategorized";
    const existing = catMap.get(catName) || {
      totalAmount: 0,
      count: 0,
      icon: t.category?.icon,
      colorToken: t.category?.colorToken,
    };
    existing.totalAmount += t.amount;
    existing.count += 1;
    if (!existing.icon && t.category?.icon) existing.icon = t.category.icon;
    if (!existing.colorToken && t.category?.colorToken) existing.colorToken = t.category.colorToken;
    catMap.set(catName, existing);

    const txHour = new Date(t.occurredAt).getHours();
    hourMap.set(txHour, (hourMap.get(txHour) || 0) + t.amount);
  }

  const categoryBreakdown: CategorySpendBreakdown[] = Array.from(catMap.entries())
    .map(([categoryName, data]) => ({
      categoryName,
      icon: data.icon,
      colorToken: data.colorToken,
      totalAmount: data.totalAmount,
      percentage: totalSpentToday > 0 ? Math.round((data.totalAmount / totalSpentToday) * 100) : 0,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const differencePaise = safeToSpendToday - totalSpentToday;

  let status: DailyNightRecapResult["status"] = "under_budget";
  let headline = "";
  let subtext = "";

  if (totalSpentToday === 0) {
    status = "zero_spend";
    headline = "Zero-Spend Day! 🌟";
    subtext = "You didn't spend any money today. Your daily allowance will roll forward to give you a higher safe limit tomorrow!";
  } else if (differencePaise > 0) {
    status = "under_budget";
    headline = "Under Daily Allowance! 👏";
    subtext = "Great discipline today. Spending less than your daily limit keeps your month comfortable and builds savings.";
  } else if (differencePaise === 0) {
    status = "at_budget";
    headline = "Right On Target! 🎯";
    subtext = "You hit your exact daily allowance today. Perfectly balanced for the rest of your cycle.";
  } else {
    status = "over_budget";
    headline = "Over Today's Allowance ⚠️";
    subtext = "You spent more than today's target. Don't worry—your safe-to-spend runway will automatically recalculate for tomorrow.";
  }

  // 1. Single Largest Purchase Today
  let largestPurchase: DailyTransactionItem | null = null;
  if (sameDayExpenses.length > 0) {
    largestPurchase = [...sameDayExpenses].sort((a, b) => b.amount - a.amount)[0];
  }

  // 2. Peak Spending Hour
  let peakSpendingHour: string | null = null;
  if (hourMap.size > 0) {
    let maxHour = -1;
    let maxHourAmount = -1;
    for (const [hour, amt] of hourMap.entries()) {
      if (amt > maxHourAmount) {
        maxHourAmount = amt;
        maxHour = hour;
      }
    }
    if (maxHour !== -1) {
      const formatHour = (h: number) => {
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12} ${period}`;
      };
      peakSpendingHour = `${formatHour(maxHour)} – ${formatHour((maxHour + 1) % 24)}`;
    }
  }

  // 3. Spotify-Style Student Financial Archetype
  let archetype: FinancialArchetype;
  const hasLateNightTx = sameDayExpenses.some((t) => {
    const h = new Date(t.occurredAt).getHours();
    const m = new Date(t.occurredAt).getMinutes();
    return (h === 21 && m >= 30) || h >= 22 || h < 4;
  });

  const foodOrSnackTxs = sameDayExpenses.filter((t) => {
    const name = (t.category?.name || "").toLowerCase();
    const notes = (t.notes || "").toLowerCase();
    const merchant = (t.merchant || "").toLowerCase();
    return (
      name.includes("food") ||
      name.includes("snack") ||
      name.includes("cafe") ||
      name.includes("chai") ||
      notes.includes("chai") ||
      notes.includes("tea") ||
      notes.includes("coffee") ||
      merchant.includes("canteen") ||
      merchant.includes("tuck")
    );
  });

  if (totalSpentToday === 0) {
    archetype = {
      id: "zen_monk",
      name: "The Zen Monk",
      emoji: "🧘‍♂️",
      tagline: "Absolute Financial Enlightenment",
      description: "Zero paise spent today. Your bank account is resting in total tranquility and 100% savings discipline.",
      gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    };
  } else if (hasLateNightTx) {
    archetype = {
      id: "midnight_marauder",
      name: "The Midnight Marauder",
      emoji: "🦉",
      tagline: "Nocturnal Wallet Energy",
      description: "When the campus goes to sleep, your wallet comes alive. Late-night study fuel or midnight cravings made their mark.",
      gradient: "from-indigo-900 via-purple-900 to-slate-950",
    };
  } else if (foodOrSnackTxs.length >= 2 && foodOrSnackTxs.some((t) => t.amount <= 10000)) {
    archetype = {
      id: "chai_connoisseur",
      name: "The Chai Connoisseur",
      emoji: "☕",
      tagline: "Fueled by Micro-Treats",
      description: "Master of the campus tuck shop. Life happens in cutting chai, canteen snacks, and friendly hangouts.",
      gradient: "from-amber-600 via-orange-600 to-yellow-600",
    };
  } else if (safeToSpendToday > 0 && Math.abs(differencePaise) <= safeToSpendToday * 0.15) {
    archetype = {
      id: "precision_sniper",
      name: "The Precision Sniper",
      emoji: "🎯",
      tagline: "Laser-Focused Budgeting",
      description: "Bullseye accuracy! You spent almost exactly your daily safe allowance without flying off course.",
      gradient: "from-blue-600 via-indigo-600 to-violet-700",
    };
  } else if (differencePaise > 0 && safeToSpendToday > 0 && differencePaise >= safeToSpendToday * 0.35) {
    archetype = {
      id: "frugal_scholar",
      name: "The Frugal Scholar",
      emoji: "🛡️",
      tagline: "Fortress of Restraint",
      description: "You guarded your pocket money like semester exam notes. Heavy savings banked for the upcoming days!",
      gradient: "from-teal-600 via-emerald-600 to-green-600",
    };
  } else if (differencePaise < 0) {
    archetype = {
      id: "campus_baller",
      name: "The Campus Baller",
      emoji: "💸",
      tagline: "Living Like It's Payday",
      description: "You treated today to the fullest! Stretched past today's limit, but tomorrow's runway will rebalance smoothly.",
      gradient: "from-rose-600 via-fuchsia-600 to-indigo-700",
    };
  } else {
    archetype = {
      id: "steady_cruiser",
      name: "The Steady Cruiser",
      emoji: "🚀",
      tagline: "Smooth Runway Rhythm",
      description: "Cruising comfortably through your cycle. Controlled spending with plenty of room to breathe.",
      gradient: "from-violet-600 via-indigo-600 to-sky-600",
    };
  }

  // 4. Relatable Real-World College Comparison
  let realWorldComparison = "";
  const savedRupees = Math.round(differencePaise / 100);
  if (totalSpentToday === 0) {
    realWorldComparison = "100% of your daily allowance rolled forward into your runway! 🏆";
  } else if (savedRupees >= 150) {
    realWorldComparison = `You saved ₹${savedRupees} today — that's 1 canteen meal + a cold coffee in the bank! 🥤🍛`;
  } else if (savedRupees >= 30) {
    const chais = Math.floor(savedRupees / 15);
    realWorldComparison = `You saved ₹${savedRupees} today — that's equivalent to ${chais} cutting chais! ☕`;
  } else if (differencePaise < 0) {
    const overRupees = Math.round(Math.abs(differencePaise) / 100);
    realWorldComparison = `Over by ₹${overRupees}. Spread across remaining days, that's just a tiny adjustment! ⚖️`;
  } else {
    realWorldComparison = "Balanced spend today keeps your safe daily allowance rock solid! ✨";
  }

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return {
    isNightTime,
    currentHour,
    dateStr,
    totalSpentToday,
    safeToSpendToday,
    differencePaise,
    status,
    headline,
    subtext,
    categoryBreakdown,
    transactionsToday: sameDayExpenses,
    largestPurchase,
    peakSpendingHour,
    archetype,
    realWorldComparison,
  };
}
