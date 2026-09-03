import { calculateGamificationScore } from "./gamification";

describe("Gamification Score Calculator", () => {
  it("should calculate health score across 4 pillars correctly", () => {
    const result = calculateGamificationScore({
      transactionsCount: 6,
      hasEmergencyReserve: true,
      hasGoals: true,
      goalContributionsCount: 2,
      hasBudgets: true,
      hasFriends: true,
      availableBalance: 500000,
      safeToSpendToday: 25000,
    });

    expect(result.healthScore).toBeGreaterThanOrEqual(85);
    expect(result.tier).toBe("Elite");
    expect(result.badges.filter((b) => b.isUnlocked).length).toBe(6);
  });

  it("should adjust tier down when reserves and budgets are missing", () => {
    const result = calculateGamificationScore({
      transactionsCount: 0,
      hasEmergencyReserve: false,
      hasGoals: false,
      goalContributionsCount: 0,
      hasBudgets: false,
      hasFriends: false,
      availableBalance: 0,
      safeToSpendToday: 0,
    });

    expect(result.healthScore).toBeLessThan(50);
    expect(result.tier).toBe("Improving");
  });
});
