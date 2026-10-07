---
name: project-corrections
description: Persistent log of corrections, updates, decisions, and architectural notes for the Student Expense Manager project
type: project
---

# Project Corrections & Updates Log

**Last Updated:** 2026-10-07

This file tracks all corrections, updates, new requirements, architectural decisions, and important instructions discovered during development of the Student Expense Manager project.

---

## Corrections

### 1. Monthly Cycle & Budgets Not Resetting After Each Month (2026-10-07)
- **Problem**: When a calendar month passed, category budgets and daily Safe-to-Spend runway did not reset.
- **Root Cause**:
  - `PocketMoneyCycle` in PostgreSQL remained permanently in `status: "active"` with fixed initial `startDate` and `endDate`.
  - All pages queried `prisma.pocketMoneyCycle.findFirst({ where: { status: "active" } })` without checking if `now > cycle.endDate`.
  - In `safe-to-spend.ts`, expired cycles caused `diffDays = cycleEndDate - today` to become negative, permanently clamping `daysRemaining` to `1`.
  - In `budgets/page.tsx` and `analytics/page.tsx`, transaction queries filtered by `t.occurredAt >= cycle.startDate && t.occurredAt <= cycle.endDate`, excluding all newly logged transactions from the active budget.
- **Fix**:
  - Created `getOrRollActiveCycle(userId)` in `src/lib/cycle.ts`.
  - Implemented automatic lazy rollover: if `now > cycle.endDate`, the old cycle is closed (`status: "closed"`) and a new active cycle is created for the current cycle window, carrying forward expected allowances and emergency reserves.
  - Replaced ad-hoc raw cycle queries with `getOrRollActiveCycle` across all pages (`/`, `/budgets`, `/analytics`, `/calendar`, `/settings`, `/what-if`, `/afford`, `/achievements`, `/notifications`, and transaction actions).

---

## Updates & Additions

### 1. Customizable Monthly Reset Date & Setup Prompt (2026-10-07)
- **Profile Schema**: Added `cycleResetDay` (Int, default 1) and `resetDayConfigured` (Boolean, default false) to `Profile` in `prisma/schema.prisma`.
- **First-time Prompt Component**: Built `CycleResetPrompt` (`src/components/cycle-reset-prompt.tsx`) displayed on Home:
  - If unconfigured, prominently asks: *"Which day of the month should your budget & allowance reset?"* with quick pills (1, 5, 7, 10, 15, 20, 25) and custom input (1–28).
  - Once configured, collapses into a clean status banner displaying the active reset day with a "Change" button.
- **Settings Integration**: Connected to `src/app/settings/page.tsx` allowing users to view and modify their reset day at any time.
- **Server Actions**: Added `setCycleResetDay` and updated `updateCycleSettings` in `src/app/actions/cycle.ts` to persist `cycleResetDay` and realign the active cycle boundaries immediately.
- **Unit Tests**: Added `src/lib/cycle.test.ts` covering boundary math, anchor day adjustments, and month length edge cases.

---

## Architectural Decisions

### 1. Lazy Rollover on Access vs. Scheduled Cron
- **Decision**: Perform cycle rollover on-demand whenever the user visits the app or calls an action, rather than relying on external background crons (e.g. Supabase `pg_cron` or serverless schedulers).
- **Rationale**: Guarantees consistency even if cron jobs fail, avoids serverless cold-start cron complexities, and ensures the active cycle is always accurate the moment a user interacts with the app.

### 2. Month-End and Shorter Months Handling (PRD Section 37)
- **Decision**: In `calculateCycleBoundaries()`, anchor days beyond a month's length (e.g., day 31 in April or February) clamp to `getDaysInMonth(year, month)` so cycles remain continuous and never skip or error.

---

## Changed Requirements

- **User-Defined Reset Date**: Pocket-money cycle reset day is no longer hardcoded to the account signup date. Users specify and can change the exact date of the month (1–28) on which their allowance arrives and budgets renew.

---

## Removed/Deprecated Items

*(No deprecations recorded yet)*

---

## Important Notes & Reminders

- **Domain Logic Centralization:** All financial calculations (safe-to-spend, burn rate, forecast, budget percentage, goal progress, transfer/refund handling, split math) must be implemented exactly once in the `domain/` package. API routes, server actions, and AI tools all call into this same package.
- **Money Storage:** Always use integer minor units (paise), never floating point, for currency amounts outside display-formatting functions.
- **Pocket-Money Cycles:** Cycles are first-class entities with explicit `start_date`/`end_date`. Never compute "days remaining" from the calendar month.
- **Financial Invariants:** 
  - Transfers are not expenses
  - Emergency Reserve is not spendable
  - Recurring expenses affect forecasts even before logged
  - Refunds restore balance but don't erase history
  - Split expenses don't silently reduce payer's logged amount
  - Rounding always rounds down
- **Design System:** All colors, spacing, radii, shadows, typography come from CSS tokens. Never hardcode values directly in components.
- **AI Safety:** AI Assistant never gets direct DB access, only read-only tools per PRD.md Section 21. Never invents/fabricates financial figures.
- **Testing:** Financial calculations always need unit tests. New mutation endpoints need integration tests for authorization boundaries.

---

## Open Questions

*(No open questions recorded yet)*
