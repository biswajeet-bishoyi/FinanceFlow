import { calculateSafeToSpend } from './safe-to-spend';

describe('Safe-to-Spend Engine', () => {
  it('calculates V1 formula correctly (MVP)', () => {
    // Given available balance ₹2,340 (234000 paise) and 12 days remaining
    const result = calculateSafeToSpend({
      availableBalance: 234000,
      cycleEndDate: new Date('2026-08-28T00:00:00Z'),
      today: new Date('2026-08-16T00:00:00Z'), // 12 days diff
    });

    // 2340 / 12 = 195
    expect(result.daysRemaining).toBe(12);
    expect(result.safeToSpendToday).toBe(19500); // 195 INR in paise
  });

  it('calculates V1.5 formula correctly with reserve and upcoming expenses', () => {
    // Given balance ₹2,340, 12 days remaining, emergency reserve ₹500, upcoming ₹300
    const result = calculateSafeToSpend({
      availableBalance: 234000,
      cycleEndDate: new Date('2026-08-28T00:00:00Z'),
      today: new Date('2026-08-16T00:00:00Z'), // 12 days diff
      emergencyReserve: 50000,
      upcomingExpenses: 30000,
    });

    // spendable = 2340 - 500 - 300 = 1540
    // 1540 / 12 = 128.333 -> round down to 128
    expect(result.spendable).toBe(154000);
    expect(result.safeToSpendToday).toBe(12800); // 128 INR in paise
  });

  it('floors safe to spend at zero', () => {
    // Negative spendable
    const result = calculateSafeToSpend({
      availableBalance: 10000, // 100 INR
      cycleEndDate: new Date('2026-08-28T00:00:00Z'),
      today: new Date('2026-08-16T00:00:00Z'),
      emergencyReserve: 50000, // 500 INR
      upcomingExpenses: 0,
    });

    expect(result.spendable).toBe(-40000);
    expect(result.safeToSpendToday).toBe(0);
  });

  it('floors days remaining at 1 on the last day', () => {
    const result = calculateSafeToSpend({
      availableBalance: 15000, // 150 INR
      cycleEndDate: new Date('2026-08-16T00:00:00Z'), // Same day
      today: new Date('2026-08-16T00:00:00Z'),
    });

    expect(result.daysRemaining).toBe(1);
    expect(result.safeToSpendToday).toBe(15000);
  });
});
