import { formatMoney } from "@/lib/format";

export type SystemNotification = {
  id: string;
  type: "safe_spend" | "bill_due" | "budget_alert" | "friend_iou" | "cycle_ending" | "tip";
  title: string;
  message: string;
  icon: string;
  color: string;
  timeAgo: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
};

export function generateSystemNotifications({
  safeToSpendToday,
  daysRemaining,
  recurringExpenses,
  budgets,
  transactions,
  friends,
}: {
  safeToSpendToday: number;
  daysRemaining: number;
  recurringExpenses: Array<{ label: string; amount: number; nextDueAt: Date | string }>;
  budgets: Array<{ category?: { name: string } | null; amount: number; cautionThresholdPct: number; categoryId?: string | null }>;
  transactions: Array<{ amount: number; categoryId: string; type: string }>;
  friends: Array<{ name: string; lendingRecords: Array<{ direction: string; amount: number; status: string; note?: string | null }> }>;
}): SystemNotification[] {
  const notifs: SystemNotification[] = [];

  // 1. Daily Morning Brief
  notifs.push({
    id: "notif-safe-today",
    type: "safe_spend",
    title: "Today's Safe Allowance",
    message: `You can comfortably spend up to ${formatMoney(safeToSpendToday)} today. Keep it under this to stay on track!`,
    icon: "account_balance_wallet",
    color: "bg-secondary-container text-secondary",
    timeAgo: "Today",
    actionUrl: "/add",
    actionLabel: "Log Expense",
    isRead: false,
  });

  // 2. Upcoming Subscription Bills
  const today = new Date();
  recurringExpenses.forEach((r, idx) => {
    const dueDate = new Date(r.nextDueAt);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
      notifs.push({
        id: `notif-bill-${idx}`,
        type: "bill_due",
        title: `Bill Due Soon: ${r.label}`,
        message: `${r.label} of ${formatMoney(r.amount)} is due on ${dueDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}.`,
        icon: "subscriptions",
        color: "bg-info-blue-bg text-info-blue",
        timeAgo: diffDays === 0 ? "Due Today" : `In ${diffDays} days`,
        actionUrl: "/recurring",
        actionLabel: "View Bill",
        isRead: false,
      });
    }
  });

  // 3. Category Budget Approaching
  budgets.forEach((b, idx) => {
    const spent = transactions
      .filter((t) => (b.categoryId ? t.categoryId === b.categoryId : true) && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const pct = (spent / b.amount) * 100;
    if (pct >= b.cautionThresholdPct) {
      const catName = b.category?.name || "Overall";
      notifs.push({
        id: `notif-budget-${idx}`,
        type: "budget_alert",
        title: `Caution: ${catName} Budget at ${Math.round(pct)}%`,
        message: `You have spent ${formatMoney(spent)} of your ${formatMoney(b.amount)} limit for ${catName}.`,
        icon: "warning",
        color: "bg-error-container text-error",
        timeAgo: "Recent",
        actionUrl: "/budgets",
        actionLabel: "View Budget",
        isRead: false,
      });
    }
  });

  // 4. Friend Lending Reminder
  friends.forEach((f, idx) => {
    const lentRecords = f.lendingRecords.filter((r) => r.direction === "lent" && r.status === "open");
    const totalLent = lentRecords.reduce((acc, r) => acc + r.amount, 0);
    if (totalLent > 0) {
      notifs.push({
        id: `notif-friend-${idx}`,
        type: "friend_iou",
        title: `Pending Split: ${f.name}`,
        message: `${f.name} owes you ${formatMoney(totalLent)}. Send a gentle reminder to settle up!`,
        icon: "group",
        color: "bg-[#FFF3E0] text-[#E65100]",
        timeAgo: "Open Debt",
        actionUrl: "/friends",
        actionLabel: "Settle",
        isRead: false,
      });
    }
  });

  // 5. Cycle Ending Soon
  if (daysRemaining <= 3 && daysRemaining > 0) {
    notifs.push({
      id: "notif-cycle-ending",
      type: "cycle_ending",
      title: "Cycle Ending Soon",
      message: `Only ${daysRemaining} days left in your current pocket money cycle. Any leftover balance will carry forward!`,
      icon: "event",
      color: "bg-surface-container text-primary",
      timeAgo: `${daysRemaining} days left`,
      actionUrl: "/settings",
      actionLabel: "Cycle Info",
      isRead: false,
    });
  }

  return notifs;
}
