import { calculateDailyNightRecap } from "./daily-recap";

describe("Daily Night Recap Generator", () => {
  const fixedNow = new Date("2026-09-08T21:30:00"); // 9:30 PM (Night time)

  it("should detect night time correctly (8 PM to 4 AM)", () => {
    const nightResult = calculateDailyNightRecap({
      transactions: [],
      safeToSpendToday: 50000,
      now: new Date("2026-09-08T22:00:00"),
    });
    expect(nightResult.isNightTime).toBe(true);

    const dayResult = calculateDailyNightRecap({
      transactions: [],
      safeToSpendToday: 50000,
      now: new Date("2026-09-08T14:00:00"),
    });
    expect(dayResult.isNightTime).toBe(false);

    const earlyMorningResult = calculateDailyNightRecap({
      transactions: [],
      safeToSpendToday: 50000,
      now: new Date("2026-09-08T02:30:00"),
    });
    expect(earlyMorningResult.isNightTime).toBe(true);
  });

  it("should only include same-day expenses and ignore other days or income", () => {
    const transactions = [
      // Today expense
      {
        id: "tx-1",
        amount: 15000, // ₹150
        type: "expense",
        occurredAt: new Date("2026-09-08T12:00:00"),
        category: { name: "Food", icon: "restaurant" },
      },
      // Today income (should be excluded from spent)
      {
        id: "tx-2",
        amount: 50000,
        type: "income",
        occurredAt: new Date("2026-09-08T10:00:00"),
        category: { name: "Salary" },
      },
      // Yesterday expense (should be excluded)
      {
        id: "tx-3",
        amount: 20000,
        type: "expense",
        occurredAt: new Date("2026-09-07T21:00:00"),
        category: { name: "Shopping" },
      },
      // Today another expense
      {
        id: "tx-4",
        amount: 10000, // ₹100
        type: "expense",
        occurredAt: new Date("2026-09-08T19:45:00"),
        category: { name: "Transport", icon: "directions_bus" },
      },
    ];

    const result = calculateDailyNightRecap({
      transactions,
      safeToSpendToday: 50000, // ₹500
      now: fixedNow,
    });

    expect(result.transactionsToday.length).toBe(2);
    expect(result.totalSpentToday).toBe(25000); // 15000 + 10000 = ₹250
    expect(result.status).toBe("under_budget");
    expect(result.differencePaise).toBe(25000); // Saved ₹250
  });

  it("should calculate category breakdown and percentages correctly", () => {
    const transactions = [
      {
        id: "tx-1",
        amount: 30000, // ₹300 (75%)
        type: "expense",
        occurredAt: new Date("2026-09-08T13:00:00"),
        category: { name: "Food" },
      },
      {
        id: "tx-2",
        amount: 10000, // ₹100 (25%)
        type: "expense",
        occurredAt: new Date("2026-09-08T15:00:00"),
        category: { name: "Stationery" },
      },
    ];

    const result = calculateDailyNightRecap({
      transactions,
      safeToSpendToday: 30000, // ₹300 allowance -> spent ₹400 -> over_budget
      now: fixedNow,
    });

    expect(result.status).toBe("over_budget");
    expect(result.categoryBreakdown.length).toBe(2);
    expect(result.categoryBreakdown[0].categoryName).toBe("Food");
    expect(result.categoryBreakdown[0].percentage).toBe(75);
    expect(result.categoryBreakdown[1].categoryName).toBe("Stationery");
    expect(result.categoryBreakdown[1].percentage).toBe(25);
  });

  it("should handle zero spend days gracefully", () => {
    const result = calculateDailyNightRecap({
      transactions: [],
      safeToSpendToday: 40000,
      now: fixedNow,
    });

    expect(result.status).toBe("zero_spend");
    expect(result.totalSpentToday).toBe(0);
    expect(result.categoryBreakdown.length).toBe(0);
  });
});
