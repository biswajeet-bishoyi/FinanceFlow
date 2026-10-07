import { calculateCycleBoundaries, formatCycleLabel, getDaysInMonth } from "./cycle";

describe("Cycle Boundary Calculations", () => {
  it("calculates calendar month boundaries when anchorDay is 1", () => {
    // Reference date: 15 October 2026
    const ref = new Date(2026, 9, 15); // Month 9 is October
    const { startDate, endDate } = calculateCycleBoundaries(1, ref);

    expect(startDate.getFullYear()).toBe(2026);
    expect(startDate.getMonth()).toBe(9); // October
    expect(startDate.getDate()).toBe(1);

    expect(endDate.getFullYear()).toBe(2026);
    expect(endDate.getMonth()).toBe(9); // October
    expect(endDate.getDate()).toBe(31);
  });

  it("calculates cycle boundaries when today is on or after anchorDay", () => {
    // Reference date: 10 October 2026, anchor day 5
    const ref = new Date(2026, 9, 10);
    const { startDate, endDate } = calculateCycleBoundaries(5, ref);

    // Should start on 5 October and end on 4 November
    expect(startDate.getFullYear()).toBe(2026);
    expect(startDate.getMonth()).toBe(9);
    expect(startDate.getDate()).toBe(5);

    expect(endDate.getFullYear()).toBe(2026);
    expect(endDate.getMonth()).toBe(10); // November
    expect(endDate.getDate()).toBe(4);
  });

  it("calculates cycle boundaries when today is before anchorDay", () => {
    // Reference date: 3 October 2026, anchor day 5
    const ref = new Date(2026, 9, 3);
    const { startDate, endDate } = calculateCycleBoundaries(5, ref);

    // Should start on 5 September and end on 4 October
    expect(startDate.getFullYear()).toBe(2026);
    expect(startDate.getMonth()).toBe(8); // September
    expect(startDate.getDate()).toBe(5);

    expect(endDate.getFullYear()).toBe(2026);
    expect(endDate.getMonth()).toBe(9); // October
    expect(endDate.getDate()).toBe(4);
  });

  it("handles anchorDay 31 for shorter months per PRD Section 37", () => {
    // Reference date: 15 April 2026 (April has 30 days)
    const ref = new Date(2026, 3, 15);
    const { startDate } = calculateCycleBoundaries(31, ref);

    // Should clamp anchor to 30 April if today >= 30, or 31 March if today < 30
    // On 15 April (before anchor 30), it starts on 31 March
    expect(startDate.getMonth()).toBe(2); // March
    expect(startDate.getDate()).toBe(31);

    // Reference date: 30 April 2026
    const refEnd = new Date(2026, 3, 30);
    const bounds = calculateCycleBoundaries(31, refEnd);
    expect(bounds.startDate.getMonth()).toBe(3); // April
    expect(bounds.startDate.getDate()).toBe(30); // Clamped to last day of April
  });

  it("formats cycle labels cleanly", () => {
    const s1 = new Date(2026, 9, 1);
    const e1 = new Date(2026, 9, 31);
    expect(formatCycleLabel(s1, e1)).toBe("October 2026");

    const s2 = new Date(2026, 9, 5);
    const e2 = new Date(2026, 10, 4);
    expect(formatCycleLabel(s2, e2)).toContain("Oct 5");
    expect(formatCycleLabel(s2, e2)).toContain("Nov 4");
  });
});
