import { generateSmartInsights } from "./insights";

describe("Smart Insights Generator", () => {
  it("should generate runway healthy insight when safe-to-spend is high", () => {
    const insights = generateSmartInsights({
      transactions: [],
      cycle: {
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-30"),
        emergencyReserveAmount: 50000,
        expectedAmount: 1000000,
      },
      safeToSpendToday: 60000, // ₹600/day
      daysRemaining: 15,
      availableBalance: 900000,
    });

    expect(insights.some((i) => i.id === "runway-healthy")).toBe(true);
    expect(insights.some((i) => i.id === "reserve-intact")).toBe(true);
  });

  it("should identify top spending category", () => {
    const insights = generateSmartInsights({
      transactions: [
        { amount: 50000, type: "expense", occurredAt: new Date(), category: { name: "Food" } },
        { amount: 20000, type: "expense", occurredAt: new Date(), category: { name: "Transport" } },
      ],
      cycle: {
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-30"),
        emergencyReserveAmount: 0,
        expectedAmount: 500000,
      },
      safeToSpendToday: 20000,
      daysRemaining: 10,
      availableBalance: 200000,
    });

    const topCatInsight = insights.find((i) => i.id === "top-category");
    expect(topCatInsight).toBeDefined();
    expect(topCatInsight?.title).toContain("Food");
  });
});
