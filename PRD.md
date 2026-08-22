# Student Expense Manager — Product Requirements Document

**Version:** 1.0
**Status:** Source of truth for design + engineering
**Working product name:** Student Expense Manager

> Optional brand name candidates (keep "Student Expense Manager" as the working name throughout this document): **Dabba** (Hindi/Hinglish for "box," as in the box your money lives in), **Kharcha** ("expense" in Hindi/Urdu, immediately legible to the target market), **Tank** (as in "how much is in the tank"), **Runway** (a nod to "days until empty," reframed playfully). If a brand name is chosen later, only marketing surfaces change — the domain model and internal naming stay in English/neutral terms.

---

## 1. Product Overview

Student Expense Manager is a mobile-first personal finance companion built specifically for people living on **fixed, periodic, limited money** — pocket money, allowances, stipends, scholarships, and irregular gig income — rather than a salary. It is not a budgeting spreadsheet, not a bank dashboard, and not accounting software. It is a daily-use companion whose single job is to answer, instantly and honestly:

> **"How much can I safely spend today?"**

Every other feature (transactions, budgets, goals, analytics, AI assistant) exists to make that one number more accurate, more trustworthy, and more actionable.

## 2. Problem Statement

Students receive money in irregular lumps (monthly pocket money, a weekly allowance, a scholarship disbursement, occasional gig income) and must make it last until the next lump arrives. Existing finance apps are built for people with salaries, credit scores, and investment portfolios — they assume a financial life the target user doesn't have. As a result, students either:

- Use no tracking at all and get an unpleasant surprise a few days before the next pocket-money date, or
- Use a generic expense tracker that shows *what* they spent but never tells them *whether they're on track*, or
- Use a notes app / mental math that breaks down the moment spending gets irregular (a big one-off purchase, a split dinner bill, a friend who owes them money).

The gap is not "expense logging." It's **daily decision support under a hard, periodic budget constraint.**

## 3. Product Vision

A financial companion that a student *wants* to open every morning — the way they'd check a weather app — because it gives them one clear, trustworthy number and a handful of honest, non-judgmental observations about their money. Over time it becomes the place they track goals (a laptop, a trip), settle friend debts, and understand their own spending patterns, without ever feeling like they've opened a banking app.

## 4. Target Users

**Primary**
- College/university students on monthly or weekly pocket money from family
- Hostel/PG students managing mess, laundry, and shared costs
- Students who transact primarily via UPI, cash, and debit cards
- Students who want awareness and control, not investment advice

**Secondary**
- Students with internship or freelance income (irregular, not fixed-cycle)
- Scholarship recipients (lump-sum, infrequent)
- Students receiving support from multiple sources (parents + relatives + part-time work)

**Explicitly out of scope for the user's financial profile:** salary income, loans/EMIs, credit scores, stock/mutual-fund portfolios, insurance. These may appear as future extensions but must never be assumed as present.

## 5. Personas

**Ananya, 19, first-year hostel student.** Gets ₹8,000 on the 5th of every month from her parents. Has never tracked money before college. Wants something simple that doesn't feel like her dad's tally book. Primary need: "Am I going to be okay this month?"

**Rahul, 21, final-year, part-time freelancer.** Gets ₹6,000 monthly pocket money plus irregular freelance payments (₹2,000–₹15,000, no fixed schedule). Wants to see freelance income folded into his safe-spending number without it being treated like guaranteed monthly income.

**Priya, 20, day scholar, budget-conscious.** Gets weekly pocket money (₹1,500/week) because her parents want tighter oversight. Splits dinner and outing costs with a group of 5 friends constantly. Primary need: settle who owes whom without an argument.

## 6. Jobs-to-be-Done

1. When I open the app, help me instantly know if I'm financially okay today.
2. When I'm about to buy something, help me decide if I can afford it without guilt or shame.
3. When my pocket money is running low, warn me early enough that I can adjust.
4. When I get money from an unexpected source, help me fold it into my plan correctly.
5. When I split a bill with friends, help me track who owes what without spreadsheets.
6. When I want to save for something, help me see a believable path to it.
7. When I look back at a cycle, help me understand where the money actually went, in plain language.

## 7. Product Principles

1. **One number rules them all.** Safe-to-spend-today is always the most visually dominant element on Home.
2. **Speed over completeness at capture time.** Logging an expense must never take more than ~3 taps/seconds; enrichment (notes, receipts, tags) is optional and deferred.
3. **Transparent math, not magic.** Every calculated number has a "why" the user can tap into.
4. **Honest, never manipulative.** Insights and personality copy describe reality; they never guilt, shame, or use dark patterns to drive engagement.
5. **Cycle-first, not calendar-first.** The app's sense of time is the user's pocket-money cycle, not the Gregorian month.
6. **Playful surface, serious core.** Visual personality lives in motion, color, and copy — never in the correctness of a number.
7. **Works with what a student actually has.** No assumptions about salary, credit, or investment products.
8. **Read-only AI by default.** Anything that touches money requires an explicit human tap to confirm.

## 8. Feature Inventory

| Domain | Features |
|---|---|
| Core money model | Pocket Money Cycles, Accounts, Transactions, Transfers, Categories |
| Daily decision engine | Safe-to-Spend Engine, Burn Rate, Cycle Forecast, "Can I Afford This?" |
| Planning | Budgets, Recurring Expenses, Savings Goals, Emergency Reserve, What-If Simulator |
| Social money | Split Expenses, Lending/Borrowing |
| Understanding | Analytics, Comparisons, Calendar, Smart Insights |
| Assistance | AI Assistant, Natural-Language Search, Receipt Scanner |
| Data | Import, Export, Backup |
| Context modes | Hostel Mode, College Mode, Location Spending |
| Engagement | Notifications, Gamification, Financial Health Score |
| Platform | Auth, Settings, PWA/Offline, Accessibility, Multi-currency |

## 9. MVP Scope (V1)

Auth & profile · Onboarding · Pocket Money Cycle (single active cycle, monthly/weekly/custom) · Accounts (cash, bank, UPI, card, custom) · Transactions (expense/income) · Transfers · Default + custom categories · Ultra-fast expense entry · Home dashboard with Safe-to-Spend Engine (v1 formula) · Basic analytics (category breakdown, daily/weekly totals, recent transactions) · Settings (profile, currency, personality mode, appearance).

**Excluded from V1:** budgets, recurring expenses, goals, reserve, burn-rate forecasting, split/lending, AI, calendar, import/export, notifications, gamification, offline/PWA, multi-currency conversion, location, hostel/college modes.

## 10. Future Scope

See **Section 34 — Roadmap** for the full V1.5 / V2 / V3 breakdown and dependency graph.

## 11. Information Architecture

```
App
├─ Onboarding (first run only)
├─ Home                         (dashboard — the daily landing page)
├─ Transactions                 (list, search, filter, detail, edit)
├─ Analytics                    (breakdowns, trends, comparisons)
├─ Budgets                      (category + cycle budgets)
├─ Goals                        (savings goals, contributions, forecast)
├─ Accounts                     (secondary — accessed from Home/Settings)
├─ Pocket Money                 (secondary — cycle management, income log)
├─ Recurring                    (secondary)
├─ Split & Lending              (secondary — "Friends" surface)
├─ AI Assistant                 (secondary — chat surface, V2)
├─ Settings
│   ├─ Profile
│   ├─ Appearance & Personality
│   ├─ Pocket Money & Cycle
│   ├─ Budget Defaults & Reserve
│   ├─ Notifications
│   └─ Data (import/export/delete)
└─ Global: Quick Add (FAB, available from every primary screen)
```

**Primary bottom navigation (mobile):** Home · Transactions · **+ (Quick Add, center, elevated)** · Analytics · Goals. Budgets, Accounts, Pocket Money, Split/Lending, AI, and Settings are reached via Home shortcuts and a "More" sheet — mobile nav stays at 5 slots max.

**Desktop/tablet:** left rail with all primary + secondary items visible; Quick Add is a persistent floating button, bottom-right.

## 12. User Flows

### 12.1 Onboarding → First Dashboard
1. Welcome screen (product promise in one line + illustration, no form fields yet).
2. Name.
3. Currency (default inferred from locale, editable).
4. Pocket money amount + frequency (monthly/weekly/custom) + next expected date.
5. Emergency reserve (optional, skippable, default 0).
6. Optional: create first savings goal (skippable).
7. App generates the first Pocket Money Cycle and lands directly on Home with the hero number already computed. Total flow target: **under 60 seconds**, 6 inputs max, everything else skippable.

### 12.2 Quick Add Expense
1. Tap FAB → bottom sheet slides up with numeric keypad focused and amount field active.
2. User types amount.
3. User taps one category chip (recent/frequent categories surfaced first, in a row of icons).
4. Sheet auto-dismisses, transaction is saved, Home's hero numbers animate to new values, a small toast confirms with an undo action.
5. Everything else (merchant, notes, account, tags, receipt) is optional and reachable via "Add details" — collapsed by default.

### 12.3 Can I Afford This?
1. From Home or FAB long-press → "Can I afford this?" calculator opens.
2. User types an amount.
3. Live preview shows balance-after, days-remaining, new safe-daily-spend, and a GREEN/YELLOW/RED read, updating as the user types (no submit button).
4. User can tap "Log this as an expense" to convert the check directly into a transaction.

### 12.4 Settle a Split
1. User creates a split expense (amount, participants, split method).
2. App computes each person's share and creates a Lending/Borrowing record per participant (excluding the payer, unless self-included).
3. When a friend pays back, user marks that specific record "Settled" (full or partial), which does not touch the original transaction, only the lending ledger.

### 12.5 Cycle Rollover
1. On the cycle's end date (or when a new Pocket Money payment is logged that the user confirms starts a new cycle), the app closes the current cycle, computes carry-forward (unspent balance, minus any amount the user chooses to "reset"), and opens a new cycle.
2. User sees a short "cycle recap" (spent, saved, biggest category, one comparison insight) before landing on the new cycle's Home.

## 13. Page-by-Page Specifications

### 13.1 Home
**Purpose:** answer "am I okay today?" in under 2 seconds.

- **Hero block:** Available balance (large animated counter) → days remaining in cycle → Safe-to-Spend-Today (largest, most visually dominant number on the page, with a tap target that opens the transparent breakdown from Section 20).
- **Secondary row:** Weekly safe spending · Today's spending so far · Burn-rate chip (normal/fast/slow, V1.5+).
- **Pocket Money Cycle card:** received amount, date range, spent, remaining, progress ring.
- **Upcoming card:** next 1–3 upcoming recurring expenses (V1.5+).
- **Goal card:** active goal progress ring, if any (V1.5+).
- **Insights strip:** 1–3 short, dismissible insight cards (V2+ for generated insights; V1 may show static rule-based ones such as "3 days since your last coffee purchase").
- **Recent transactions:** last 5, with a "See all" link to Transactions.
- **Quick Add / Quick Income:** FAB (expense) + secondary affordance for income entry (long-press FAB or a small "+income" pill).

Empty state (no cycle configured): prompts pocket-money setup. Empty state (cycle configured, zero transactions): "Your wallet is suspiciously clean" + Add first expense CTA.

### 13.2 Transactions
List view grouped by day, each row: category icon, merchant/label, amount (color-coded income/expense), account glyph. Sticky filter bar: date range, category, account, type, amount range, search box. Tap row → detail sheet (all fields, edit, delete, duplicate). Swipe actions on mobile (edit / delete, with delete requiring confirmation). Bulk select mode for multi-delete or multi-recategorize. Virtualized/paginated list for performance.

### 13.3 Analytics
Segmented control: Cycle / Week / Month / Custom range. Sections: Category breakdown (donut + list, tap category to drill into its transactions), Trend chart (line/area, daily spend over the selected range with the safe-daily-line overlaid), Merchant breakdown (top merchants by spend), Payment-method / Account breakdown, Comparison block (this cycle vs previous — see Section 14), Key stats row (avg transaction, largest expense, highest-spend day). Every chart must be answering a named question (see Section 21); no decorative charts.

### 13.4 Budgets
List of category budgets + one overall cycle budget, each as a progress bar/ring with status color (Normal/Warning/Caution/Exceeded per Section 22 thresholds, all thresholds user-editable in Settings). "Create budget" flow: pick category → pick period (weekly/cycle) → set amount, optionally seeded from historical average for that category. Tapping a budget shows its transactions filtered.

### 13.5 Goals
Grid/list of goal cards (image/icon, name, progress ring, amount saved/target, forecast date at current contribution rate). Goal detail: contribution history, "Add contribution" (manual or auto from cycle surplus), edit target/deadline, delete/archive.

### 13.6 Accounts (secondary)
List of accounts with current balance, quick "transfer between accounts" action, add/edit/archive account. Archiving (not hard delete) preserves historical transactions.

### 13.7 Pocket Money (secondary)
Current cycle detail (mirrors the Home card but expanded), cycle history list, "Log pocket money received" action, cycle configuration (frequency, day, carry-forward rule).

### 13.8 Split & Lending ("Friends," secondary)
Two tabs: **Split Expenses** (create/view splits, per-person share, settle status) and **Lending/Borrowing** (people list, net balance per person, settle actions, due-date reminders).

### 13.9 AI Assistant (secondary, V2)
Chat-style surface. Suggested prompt chips on first open. Every AI response that references a number shows a small "based on: [tool calls used]" disclosure, expandable. Any AI action that would create/edit data renders as a confirm card, never auto-executes.

### 13.10 Settings
Sectioned list per Section 30 below, each opening its own screen. Danger zone (data export, account deletion) visually separated at the bottom.

## 14. Component Requirements

Design-system-driven, reusable, documented in Storybook (or equivalent) before being used in more than one page:

- `AnimatedNumber` (currency-aware, count-up/count-down, respects reduced motion)
- `HeroStat` (the Safe-to-Spend display)
- `BudgetRing` / `GoalRing` (circular progress, status-colored)
- `TransactionRow`, `TransactionSheet`
- `QuickAddSheet`
- `CategoryChip` / `CategoryPicker`
- `TrendChart`, `DonutChart`, `ComparisonBars` (chart wrappers over Recharts with design-system theming baked in)
- `InsightCard`
- `AffordabilityCalculator`
- `CycleCard`
- `EmptyState`, `ErrorState`, `LoadingSkeleton`
- `ConfirmationDialog` (used for all destructive/financial-mutation confirms, including AI-proposed ones)
- `Toast` (with undo affordance for delete/quick-add)

## 15. UX Requirements

- No required field should block a user from logging an expense except **amount** and **category**.
- Every destructive action (delete transaction, delete account, delete goal) requires confirmation and offers undo where feasible (soft-delete window).
- Every number derived from a calculation must be tappable/expandable to reveal its inputs.
- The app must never show a blank/loading Home; always render skeletons matching the final layout.
- Personality copy (Calm/Friendly/Brutally Honest) changes tone only, never the underlying numbers or the presence/absence of information.
- Mobile: all primary actions reachable with one thumb (bottom-anchored FAB and nav).

## 16. UI / Design System

See **Section 40 — Creative Direction** for the full recommended visual language, tokens, and rationale. Summary of system layers:

- **Tokens:** color (semantic), spacing scale, radius scale, elevation/shadow scale, typography scale — all as CSS variables, never hardcoded in components.
- **Primitives:** buttons, inputs, chips, cards, sheets, modals, toasts — built once in a shared `ui/` package, themed via tokens.
- **Patterns:** the composite components in Section 14, built from primitives.
- **Pages:** compositions of patterns only; pages must not define one-off visual styling except with explicit justification recorded in a code comment.

## 17. Motion System

| Tier | Duration | Easing | Use |
|---|---|---|---|
| Fast | 120–150ms | ease-out | Button press, chip select, toggle |
| Standard | 200–300ms | ease-in-out | Sheet open/close, tab switch, card expand |
| Slow | 400–600ms | custom spring | Page transitions, hero number count-up, ring fill |
| Celebration | 600–900ms | spring w/ overshoot | Goal reached, achievement unlocked (subtle, one-shot, never looping) |

Rules: animate state changes, not decoration; never animate more than one hero element simultaneously; all durations/easings pulled from tokens, never inlined; `prefers-reduced-motion: reduce` disables count-ups (values render final-state instantly), disables spring/overshoot (crossfade instead), and disables background ambient motion entirely.

## 18. Accessibility

WCAG 2.1 AA baseline. Full keyboard navigation for all interactive elements, visible focus rings using the design system's focus token (never removed, only restyled). Semantic HTML landmarks and ARIA labels on icon-only buttons (e.g., category icons, FAB). Color is never the sole signal for status (budget/warning states pair color with icon + text label). Minimum contrast 4.5:1 for body text, 3:1 for large text/graphics. Charts include an accessible data-table fallback or summary text. All animated counters have an instant, correct final value available to assistive tech (not just visually implied). Touch targets minimum 44×44px.

## 19. Database Model

Relational schema (PostgreSQL). Rationale for each table below; full DDL-level detail belongs in the engineering repo, not this PRD, but core shape is specified here.

**User** — auth identity, 1:1 with Profile. *(needed: every other table scopes to a user)*
**Profile** — display name, currency, locale, personality_mode, appearance_mode, onboarding_completed_at. *(separates auth concerns from app-facing settings)*
**PocketMoneyCycle** — id, user_id, label, start_date, end_date, expected_amount, frequency (monthly/weekly/custom), status (active/closed), carry_forward_amount, emergency_reserve_amount. *(first-class time boundary the whole app reasons around; without it, "days remaining" and "safe to spend" have no denominator)*
**Income** — id, user_id, cycle_id (nullable — freelance/gift income may not belong to a specific cycle's expected pocket money), amount, source_type (pocket_money/gift/scholarship/freelance/other), received_at, note. *(separates "money coming in" as an event log from the cycle's expected/actual reconciliation)*
**Account** — id, user_id, name, type (cash/bank/upi/debit/credit/wallet/custom), starting_balance, archived_at. *(tracks where money physically sits, independent of category/cycle)*
**Transaction** — id, user_id, account_id, category_id, type (expense/income/refund), amount, occurred_at, merchant, payment_method, notes, tags (array), receipt_id (nullable), recurring_expense_id (nullable, marks generated instances), transfer_id (nullable, links both legs of a transfer), created_at, updated_at, deleted_at (soft delete). *(the atomic financial event; soft-deleted so historical analytics aren't silently corrupted — see Section 25)*
**Category** — id, user_id (nullable = system default), name, parent_category_id (nullable, for subcategories), icon, color_token, is_system_default. *(hierarchical; user-created categories coexist with system defaults)*
**CategorizationRule** — id, user_id, match_pattern (merchant text), category_id, learned_from_transaction_id. *(stores user corrections so the rule-based categorizer improves per-user without an ML pipeline in V1)*
**Transfer** — id, user_id, from_account_id, to_account_id, amount, occurred_at, note, from_transaction_id, to_transaction_id. *(explicit record so transfers can never be mistakenly summed as spending — see Section 25)*
**Budget** — id, user_id, category_id (nullable = overall cycle budget), period (weekly/cycle), amount, warning_threshold_pct, caution_threshold_pct. *(thresholds are configurable per Section 22)*
**RecurringExpense** — id, user_id, category_id, account_id, label, amount, recurrence_rule (rrule-style: frequency + interval + optional day-of-month), next_due_at, active. *(distinguished from Transaction so the forecast engine can project future instances without them existing as logged transactions yet)*
**SavingsGoal** — id, user_id, name, target_amount, current_amount (denormalized, recomputed from contributions), deadline (nullable), icon, status (active/completed/archived).
**GoalContribution** — id, goal_id, amount, occurred_at, source_transaction_id (nullable — manual vs linked-from-expense-cycle-surplus). *(keeps an auditable contribution history rather than just a mutable current_amount)*
**Person** — id, user_id, name, avatar/color. *(represents a friend for split/lending, not a system User — no auth required for the other side)*
**SplitExpense** — id, transaction_id (the payer's logged expense), split_method (equal/custom), total_amount.
**SplitParticipant** — id, split_expense_id, person_id (nullable if participant is the app's own user), share_amount, settled_at (nullable).
**LendingRecord** — id, user_id, person_id, direction (lent/borrowed), amount, occurred_at, due_at (nullable), note, status (open/partially_settled/settled), split_participant_id (nullable — links back if generated from a split). *(one ledger for both manual IOUs and split-generated debts)*
**Notification** — id, user_id, type, payload (jsonb), read_at, created_at.
**Insight** — id, user_id, cycle_id, type, payload (jsonb), generated_at, dismissed_at. *(persisted so insights don't regenerate/flicker on every load and so "dismissed" sticks)*
**AIConversation** — id, user_id, title, created_at.
**AIMessage** — id, conversation_id, role (user/assistant/tool), content, tool_calls (jsonb), created_at. *(auditable log of exactly which tools the AI invoked, for the transparency requirement in Section 23)*
**Receipt** — id, user_id, transaction_id (nullable until confirmed), image_url, extracted_payload (jsonb), status (pending/confirmed/discarded).

**Constraints & indexes (minimum):** `Transaction(user_id, occurred_at)` composite index for range queries; `Transaction(user_id, category_id)` for breakdowns; `PocketMoneyCycle(user_id, status)`; soft-delete columns excluded from default query scope via a repository-layer filter, never trusted to ad-hoc `WHERE` clauses; monetary columns stored as integer minor units (paise), never floating point; all `user_id` foreign keys `ON DELETE CASCADE` scoped to a user-deletion flow that runs in a transaction (see Section 25 for account-deletion handling).

## 20. API Architecture

Next.js server actions / route handlers, organized by domain (`/api/transactions`, `/api/cycles`, `/api/budgets`, `/api/goals`, `/api/analytics`, `/api/ai`), each with:

- **Authorization at the query layer** — every query is scoped by the authenticated user's id server-side; no client-supplied user id is ever trusted.
- **Input validation** — every mutation validated with a schema (Zod) before touching the database; amounts validated as positive integers (minor units), dates validated as real dates in sane ranges.
- **Domain services layer** — calculation logic (safe-to-spend, burn rate, forecast, budget %, goal progress) lives in a pure, framework-agnostic `domain/` package, unit-tested independently, and is the *only* place these formulas are implemented. API routes and the AI tool layer both call into this same package — never reimplement the math.
- **Pagination** on all list endpoints (`Transactions`, `Notifications`, `Insights`) via cursor-based pagination.
- **Rate limiting** on mutation endpoints and especially the AI endpoint.

## 21. AI Architecture

The AI Assistant (V2) is a **tool-using layer over the same domain services**, never a direct database client and never a source of financial truth on its own.

**Tool surface (read-only, V1 of the AI layer):**
`get_balance`, `get_transactions(filters)`, `get_category_spending(range)`, `get_cycle_status`, `calculate_affordability(amount)`, `get_budget_status`, `get_goal_progress`, `get_forecast`.

**Rules:**
1. The model is given tool definitions only — never raw SQL access, never a generic "query the database" tool.
2. Every numeric claim in an AI response must originate from a tool result, not from model generation; system prompt explicitly forbids estimating or inventing figures.
3. Any tool that would **mutate** data (e.g., a future `log_expense` tool) returns a *proposed* action object, rendered client-side as a `ConfirmationDialog`; the mutation only executes after explicit user confirmation, via the normal authenticated mutation endpoint — the AI conversation never has direct write access.
4. Every AI response is paired with an expandable "how I got this" trace showing which tools were called and with what parameters (satisfies the transparency principle and doubles as a debugging surface).
5. Natural-language search (Section on Transactions) compiles user queries into the same structured filter object used by the Transactions page filter bar — not a freeform database query — so results are always well-defined and safe.

## 22. Security

- Authentication via a managed provider (Auth.js/Clerk/Supabase Auth — see Section 32 for rationale); no custom password storage.
- All financial data access server-side authorized per-user; no client-side-only authorization checks.
- Input validation and output encoding on every endpoint; parameterized queries only (ORM-enforced).
- Rate limiting on auth, mutation, and AI endpoints.
- No storage of UPI PINs, bank passwords, or card numbers — the app tracks *that* a payment method was used, never credentials for it.
- Optional app-level PIN/biometric lock (device-level, via WebAuthn/platform biometric APIs where available) gating app open, independent of account auth.
- Secrets (API keys, DB credentials) only in server-side environment variables, never shipped to the client, never committed to the repo.

## 23. Privacy

- Data minimization: location is never collected unless the user explicitly enables Location Spending (V3), and only coarse (campus/off-campus geofence or manual tagging), never continuous tracking.
- Full data export (Section 26) and full account deletion (hard delete of all user-scoped rows, including soft-deleted transactions) available in Settings, self-service, no support ticket required.
- AI conversation history is user data like any other — exportable and deletable.
- No sale or third-party sharing of financial data; no ad targeting based on spending data.

## 24. Performance

- Home dashboard target: interactive within 1.5s on a mid-range mobile device on 4G.
- Optimistic UI for Quick Add (transaction appears in list and hero numbers update before server confirmation returns; rolled back with a toast on failure).
- Analytics queries pre-aggregated/cached per cycle where possible (materialized daily/category rollups), recomputed on write rather than on every read.
- Transaction list virtualized/paginated (50 per page, infinite scroll).
- Code-split by route; heavy chart libraries loaded only on Analytics/Home, not in the initial bundle.
- Images (receipts, icons) served via an optimized CDN pipeline with responsive sizing.

## 25. Offline / PWA Strategy (V3)

- Installable PWA (manifest, service worker, icons for common platforms).
- Offline transaction entry: Quick Add writes to a local IndexedDB queue when offline, UI shows an "unsynced" badge; background sync pushes queued transactions on reconnect.
- Conflict handling: since transactions are user-scoped and rarely edited concurrently across devices, last-write-wins on edits with a visible "updated elsewhere" notice if a conflict is detected on sync; queued creates are never silently dropped — failed syncs surface to the user for manual resolution.
- Read views (Home, Analytics) served from a locally cached last-known state when offline, clearly labeled "offline — last updated [time]."

## 26. Notifications

Types: budget approaching/exceeded threshold, pocket money expected (day-of and optionally 1 day before), recurring expense due, goal milestone reached, spending unusually high (burn-rate anomaly), cycle ending soon (3 days / 1 day). All notification types individually toggleable in Settings; a global "quiet mode" mutes non-critical types. Delivered via in-app notification center always; push notifications (V3, requires PWA) are opt-in per type.

## 27. Analytics (Product Telemetry — distinct from in-app financial Analytics)

Track (anonymized/aggregated, never tied to transaction content): feature adoption (goals created, budgets created, AI assistant usage), Quick Add completion time (validates the "seconds not minutes" UX goal), Home dashboard daily-open rate, drop-off point in onboarding. This telemetry is separate from the user-facing financial Analytics page and must never include actual transaction amounts/categories in product-analytics events.

## 28. Edge Cases

Explicit handling required for all of the following (cross-referenced to the owning subsystem):

- **Zero / negative balance:** Safe-to-spend floors at ₹0 and switches to a distinct "you're over" visual state rather than showing a negative number as if it were spendable.
- **No pocket money configured yet:** Home shows a setup prompt in place of the hero stat, not a broken/zero calculation.
- **First-time user, no transactions:** empty state per Section 36.
- **Multiple pocket-money payments in one cycle:** each is a separate `Income` row; cycle's actual-received is the sum, shown alongside `expected_amount`.
- **Pocket money arrives late:** cycle simply continues with whatever balance exists; no forced cycle-close until the user confirms or the configured end date passes.
- **Extra/unexpected money (gift, scholarship):** logged as `Income` with the appropriate `source_type`; included in available balance; excluded from "expected pocket money" reporting so comparisons stay meaningful.
- **Carry-forward:** at cycle close, unspent balance becomes `carry_forward_amount` on the new cycle by default, editable/resettable by the user before the new cycle starts.
- **Expense larger than balance:** allowed (real life doesn't block overspending), but flows through the RED affordability state and pushes balance negative with a clear visual/notification.
- **Refund:** logged as `type = refund` on `Transaction`, linked to the original transaction where possible; included in balance as a positive adjustment; excluded from "total spent" aggregates so it doesn't understate the original purchase's category impact while still correctly restoring balance.
- **Transfer:** never counted in income/expense totals or category analytics; only affects per-account balances (Section 25 of feature spec / Section 19 schema).
- **Duplicate transaction:** manual entry — user can merge/delete via multi-select; import — deduplicated by (amount, date, merchant) fuzzy match with a review step before commit (Section "Import").
- **Deleted category:** transactions referencing it are reassigned to an "Uncategorized" system category, never left dangling.
- **Deleted account:** archived, not hard-deleted, while it has transactions; balance frozen at archive time; still visible in historical analytics.
- **Recurring expense skipped:** user can mark a due instance "skip this one" without deactivating the whole recurrence.
- **User changes pocket-money day/cycle:** applies to the *next* cycle only; current cycle unaffected mid-stream unless user explicitly edits it.
- **User changes currency:** V1 treats this as a display-only change with a one-time confirmation warning that historical figures are not converted (true multi-currency conversion is V3+).
- **Offline transaction / sync conflict:** Section 25.
- **Imported duplicate:** Section "Import."
- **Leap years / month-end / time zones:** all dates stored in UTC with the user's profile timezone applied at render and at cycle-boundary calculation; monthly cycles anchored to a day-of-month with explicit rollover rule for months shorter than the anchor day (e.g., "31st" cycles anchor to the last day of shorter months).
- **Partial settlements (split/lending):** `LendingRecord.status` supports `partially_settled` with a running settled-amount, not just a boolean.
- **Split expense modified after creation:** editing participant shares recalculates all associated `LendingRecord` rows; already-settled records are not silently altered without a warning.

## 29. Error Handling

User-facing errors are always plain language with a recovery action (e.g., "Couldn't save that expense — check your connection and try again" with a retry button), never a stack trace, raw error code, or database message. All errors are logged server-side with correlation IDs for debugging, but that detail never reaches the client response body. Form-level validation errors are inline and specific ("Amount must be greater than 0"), not generic.

## 30. Testing Strategy

- **Unit tests:** domain services (Section 20) — especially safe-to-spend, burn rate, forecast, budget %, goal progress, transfer/refund handling, split math — must have exhaustive test coverage including the worked example in Section 37, boundary conditions (zero days remaining, zero balance, negative balance), and the edge cases in Section 28.
- **Integration tests:** API routes against a test database, covering authorization boundaries (user A can never read/mutate user B's data).
- **Database tests:** migrations run cleanly up/down; constraint violations behave as expected (e.g., soft-deleted transactions excluded from default scope).
- **Component tests:** design-system primitives and key patterns (AnimatedNumber, QuickAddSheet, AffordabilityCalculator) tested for correct rendering across states (empty/loading/error/populated).
- **End-to-end tests:** onboarding → first transaction → Home reflects updated numbers; Quick Add full happy path; cycle rollover.
- Financial calculation tests are a **release blocker** — no deploy ships with a failing domain-service test.

## 31. Deployment

Frontend + API on Vercel (or equivalent Next.js-native host). Database on a managed Postgres provider (Supabase/Neon). Preview deployments per pull request. Migrations run as a distinct, reviewed step before promoting a deploy (never auto-applied silently on boot in production). Feature flags for staged rollout of V1.5/V2/V3 features so the domain model can ship ahead of UI exposure.

## 32. Environment Variables

```
DATABASE_URL=
DIRECT_DATABASE_URL=            # for migrations, if pooled connection is used at runtime
AUTH_SECRET=
AUTH_PROVIDER_CLIENT_ID=
AUTH_PROVIDER_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
AI_PROVIDER_API_KEY=            # server-side only, never exposed to client
AI_MODEL_NAME=
RATE_LIMIT_REDIS_URL=           # if using a redis-backed limiter
RECEIPT_STORAGE_BUCKET=         # for future receipt scanner
RECEIPT_STORAGE_ACCESS_KEY=
RECEIPT_STORAGE_SECRET_KEY=
NODE_ENV=
```

## 33. Tech Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js (App Router) + TypeScript | Server components reduce client bundle for a data-heavy dashboard; one framework for both frontend and API surfaces reduces operational complexity for a small team. |
| Styling | Tailwind CSS + a small custom token layer | Utility-first speeds up building a highly custom, non-templated visual identity (Section 40) without fighting a component library's opinions. |
| Component primitives | shadcn/ui as a *starting scaffold only* | Copy-in components are fully ownable/restylable — critical because the brief explicitly forbids a "generic Tailwind SaaS" look; shadcn is a base to heavily reskin, not a visual identity. |
| Charts | Recharts | Composable, themeable via CSS variables, good enough performance for cycle-scale (not tick-by-tick) financial data. |
| ORM | Prisma | Strong TypeScript inference for a domain-heavy schema (Section 19); migration tooling suits a solo/small-team workflow. |
| Database | PostgreSQL (Supabase or Neon) | Relational integrity matters for financial data (foreign keys, constraints); Supabase adds managed auth if chosen for Section "Auth" too. |
| Auth | Auth.js or Supabase Auth | Managed auth avoids hand-rolling password/session security (Section 22); either integrates cleanly with the chosen DB host. |
| AI | Provider API called only from server-side route handlers, tool-calling pattern | Keeps API keys off the client and enforces the read-only-by-default rule (Section 21) at the architecture level, not just by convention. |
| Deployment | Vercel | Native fit for Next.js, preview deployments per PR support the vertical-slice delivery strategy (Section 41). |

## 34. Roadmap

### Phase 0 — Architecture & Design System
Design tokens, primitive components, domain-service package skeleton, database schema + migrations, auth scaffold. No user-facing feature work ships before this exists.

### V1 / MVP
Auth & profile, onboarding, single active Pocket Money Cycle, Accounts, Transactions (expense/income), Transfers, default + custom Categories, ultra-fast Quick Add, Home dashboard with the **v1 Safe-to-Spend formula** (Section 37 §A), basic Analytics (category breakdown, daily/weekly totals, recent transactions).
*Dependency:* everything downstream depends on Transaction + Account + PocketMoneyCycle existing and being correct.

### V1.5
Budgets, Recurring Expenses, Savings Goals, Emergency Reserve, Burn Rate, Cycle Forecast, the full **Safe-to-Spend formula** (Section 37 §B, now including reserve/upcoming/budget awareness), Notifications, Calendar view, Split Expenses, Lending/Borrowing.
*Dependency:* Recurring Expenses and Emergency Reserve must ship before the full Safe-to-Spend formula can honestly include them; Budgets should ship before Notifications' "approaching limit" type is meaningful.

### V2
AI Assistant (read-only tool layer), Natural-Language Search, rule-based Smart Categorization + user-correction learning, generated Smart Insights, What-If Simulator, Receipt Scanner, Import/Export.
*Dependency:* AI tool layer depends on the domain-service package (Phase 0) being stable and on Analytics existing (tools largely wrap Analytics queries); What-If Simulator depends on the full forecast engine (V1.5).

### V3
PWA/offline, Hostel Mode, College Mode, Gamification, Location Spending, advanced PDF reports, multi-currency, advanced Financial Health Score, dashboard widget customization.
*Dependency:* Hostel/College Modes are category presets + optional dashboard filters over existing Categories/Transactions — low technical risk, sequence last because they're additive, not foundational.

## 35. Acceptance Criteria (Representative)

### Daily Safe Spending (V1 formula)
**Given** available balance ₹2,340 and 12 days remaining in the active cycle, **when** no reserve/budgets/upcoming expenses exist (V1), **then** Safe-to-Spend-Today = ₹2,340 ÷ 12 = **₹195**, and the breakdown view shows exactly these two inputs.

### Daily Safe Spending (V1.5 formula)
**Given** balance ₹2,340, 12 days remaining, emergency reserve ₹500, upcoming recurring expenses due before cycle end totaling ₹300, **when** computed, **then** spendable = 2,340 − 500 − 300 = ₹1,540, Safe-to-Spend-Today = 1,540 ÷ 12 = **₹128** (rounded per Section 37 rounding rule), and the breakdown view lists all four inputs with their individual contribution.

### Transfers
**Given** a transfer of ₹2,000 from Bank to Cash, **then** Bank balance decreases ₹2,000, Cash balance increases ₹2,000, total available balance is unchanged, and neither leg appears in category/expense analytics.

### Refunds
**Given** an original expense of ₹1,200 in "Shopping" and a linked refund of ₹1,200, **then** available balance is restored by ₹1,200, "total spent" for the cycle excludes the refunded amount from net spend, and the original transaction remains visible in history (not deleted).

### Split Expense
**Given** a ₹1,200 dinner split equally among 4 people (including the payer), **then** 3 `LendingRecord` rows of ₹300 each (direction = lent) are created for the non-payer participants, and the payer's own logged transaction remains ₹1,200 (their true out-of-pocket cost is not silently reduced to ₹300 in the Transactions list — the "you're owed ₹900" context appears alongside it, not instead of it).

## 36. Definition of Done

A feature is done when: it implements the documented formula/behavior exactly (no silent formula drift between UI, API, and AI tool layer); it is responsive across mobile/tablet/desktop; it meets the Section 18 accessibility bar; it has an explicit empty state, loading state, and error state; it has unit tests for any calculation and integration tests for any new endpoint; it uses only design-system tokens/primitives (no one-off inline styling without a recorded justification); it does not regress any existing test; and any new user-facing copy has been checked against all three personality modes.

---

## 37. The Daily Safe Spending Engine — Full Specification

**V1 formula (MVP):**
```
Safe-to-Spend-Today = Available Balance ÷ Days Remaining in Cycle
```

**V1.5 formula (full):**
```
Spendable = Available Balance
           − Emergency Reserve
           − Sum(Upcoming Recurring Expenses due before cycle end)
           − Sum(Planned/committed expenses the user has flagged, if any)
Safe-to-Spend-Today = Spendable ÷ Days Remaining in Cycle
```

**Rounding rule:** always round *down* to the nearest whole currency unit (never round up — a rounded-up "safe" number that isn't actually safe violates Principle 3, honest math).

**Days Remaining:** `cycle.end_date − today`, inclusive of today, floored at 1 (never divide by zero on the cycle's last day).

**Transparency requirement (Section 20 of the feature brief):** the breakdown view always lists every term above with its literal value, in the order they're subtracted, so the user can verify the arithmetic themselves — this is a hard product requirement, not a nice-to-have, because trust in the one core number is the entire value proposition.

**Weekly Safe Spending** is a derived, secondary figure: `Safe-to-Spend-Today × min(7, Days Remaining)` — presented as context, never as an alternate primary number.

**Burn Rate (V1.5):** `Current Daily Average = Sum(spend, last N days) ÷ N` (N = 7, configurable) compared against `Historical Daily Average = Sum(spend, prior full cycle) ÷ prior cycle length`. Velocity = `(Current − Historical) ÷ Historical`. Projected depletion date = today + `Available Balance ÷ Current Daily Average` days, only shown when it falls before the cycle's actual end date.

---

## 38. Category Taxonomy (Default Set)

Food (Mess, Restaurant, Food Delivery, Snacks, Coffee, Groceries) · Transport (Bus, Metro, Auto, Cab, Fuel, Parking) · College (Books, Stationery, Printing, Projects, Lab, Fees) · Entertainment (Movies, Games, OTT, Events, Going Out) · Personal (Clothes, Grooming, Electronics, Miscellaneous) · Hostel (Laundry, Room Supplies, Maintenance, Other) · Travel · Health · Friends · Subscriptions · Other. All are system defaults (editable icon/color, not deletable, but hideable); users may add unlimited custom categories/subcategories parented under any of the above or standalone.

## 39. Smart Categorization Rules (V1 logic, rule-based)

Merchant-string matching against a seeded default rule table (e.g., "Swiggy"/"Zomato" → Food ▸ Food Delivery; "Uber"/"Ola" → Transport ▸ Cab; "Netflix"/"Spotify"/"YouTube Premium" → Subscriptions; "Amazon"/"Flipkart" → Shopping). Every user correction (re-categorizing a transaction) writes a `CategorizationRule` scoped to that user which takes priority over the default table on future matches of the same merchant string. AI/ML-based categorization is explicitly deferred to V2+; V1 must work correctly with pure string matching.

## 40. Creative Direction

Five candidate visual directions were considered:

1. **"Neo-brutalist ledger"** — thick borders, flat colors, mono-spaced numerals, stamp/receipt motifs. Distinctive but risks feeling like a gimmick rather than a daily-use tool.
2. **"Glass & neon nightlife"** — heavy glassmorphism, neon glows, dark club aesthetic. Explicitly discouraged by the brief (excessive glassmorphism) and risks poor legibility for numbers.
3. **"Paper & ink journal"** — warm paper texture, handwritten accents, muted palette. Cozy but skews younger/childish and undersells the "premium" requirement.
4. **"Kinetic type dashboard"** — a dark, spacious canvas where large expressive numerals and typography *are* the primary visual interest, punctuated by a small set of bright, purposeful accent colors and organic (not rectangular) card shapes, with motion doing the work that ornament would otherwise do.
5. **"Data terrarium"** — an illustrated, garden/growth metaphor (money "grows," goals are "plants"). Charming but forces every future feature through a metaphor that will eventually strain (what does a lending record look like in a garden?).

**Recommended direction: #4, "Kinetic Type Dashboard."** It satisfies "playful + sophisticated" directly — the playfulness lives in motion, scale contrast, and color accents rather than in illustration or metaphor, so it ages well and scales cleanly to every future feature (a lending record, an AI chat bubble, and a savings goal can all live in the same visual language without a strained metaphor).

**Visual concept.** A near-black surface (not pure black) with a small number of electric accent colors used with intention, not decoration. The hero number on Home is treated typographically the way a magazine treats a cover line — oversized, tight tracking, real weight contrast against everything else on the page. Cards are not uniform rounded rectangles; radius and even silhouette vary slightly by card *purpose* (e.g., the Safe-to-Spend hero card can have an asymmetric corner treatment that no other card uses, making it instantly recognizable at a glance even before reading the number).

**Typography.** A confident, slightly condensed display face for numerals and headings (numerals must be tabular/monospaced-figures so amounts don't jitter in width as they animate) paired with a warm, highly legible grotesque for body/UI text. Two families total — never more. Numerals get their own oversized type scale distinct from headings, because the number *is* the content on Home.

**Color philosophy.** Semantic tokens, dark-mode-first:
```
--color-background      /* near-black, not pure black */
--color-surface         /* card surface, one step up from background */
--color-surface-raised  /* elevated/modal surface */
--color-text-primary
--color-text-secondary
--color-income           /* electric green */
--color-expense          /* warm coral/orange, not alarmist red */
--color-warning          /* amber */
--color-danger           /* reserved for true "over budget / negative" states only */
--color-accent-primary    /* electric green, doubles as the brand's "money" color */
--color-accent-secondary  /* violet/blue, used for goals, AI, secondary actions */
```
Light mode is a first-class second theme (same tokens, remapped), not an inverted afterthought — many students will use the app in bright daylight on campus.

**Card philosophy.** Cards are grouped by *weight class*: hero (one per screen, maximum visual dominance), primary (2–4 per screen, standard elevation), and utility (list rows, chips — minimal chrome). No screen has more than one hero card, enforcing the "one number rules them all" principle visually, not just in copy.

**Background treatment.** Mostly flat and calm to keep numbers legible, with a single, subtle layered gradient mesh anchored to one corner of the Home screen only (not repeated on data-dense screens like Transactions/Analytics, where a flat background aids scanning). No particle systems, no busy textures.

**Icon style.** A single consistent outline icon set (custom or a heavily-restyled base set — never mixed styles), category icons rendered in a soft filled circle using that category's accent color, so the Transactions list is scannable by color/shape before reading text.

**Motion style.** Per Section 17's motion tiers. The signature interaction is the Home hero number's count-up/count-down whenever it changes (new transaction, cycle rollover) — this single animation is the app's most repeated, most recognizable moment, and should never be reused trivially elsewhere.

**Charts.** Minimal, label-forward, no 3D, no unnecessary gridlines; every chart's accent color matches the semantic token of what it represents (expense trend in `--color-expense`, income in `--color-income`) so charts are legible even at a glance without reading the legend.

**Micro-interactions.** Category chip selection in Quick Add gives a small scale-bounce + haptic (mobile) on tap; budget rings fill with a slight overshoot-and-settle when crossing a threshold color boundary; the affordability calculator's GREEN/YELLOW/RED state crossfades (not hard-cuts) as the user types.

**Empty states.** Follow Section 36 copy exactly; illustration style is simple line-art in the accent palette, never a generic stock "empty box" icon.

**Loading states.** Skeletons match final layout exactly (shape/size of the hero number, cards, chart axes) so nothing "pops" into a different position once data arrives; no generic spinners on primary screens.

**Mobile behavior.** Bottom nav + center-elevated FAB per Section 11; Quick Add is a bottom sheet, never a full-page navigation, to preserve context; swipe gestures on Transaction rows for edit/delete; pull-to-refresh on Home re-triggers the hero count-up animation intentionally (it's satisfying, and it's the one place a "just for delight" repeat animation is justified because it's user-initiated, not automatic).

**Example Home dashboard composition (top to bottom, mobile):** status bar → small greeting/date line → Pocket Money Cycle mini-card (compact, secondary weight) → **Hero card**: Available Balance → Days Remaining → Safe-to-Spend-Today (largest element on the entire screen, tappable for breakdown) → secondary stat row (Today's spending · Weekly safe spend) → Insights strip (horizontally scrollable, 1–3 cards) → Goal ring card (if any active goal) → Recent Transactions (last 5) → bottom nav with center FAB.

## 41. Recommended Implementation Order (Vertical Slices)

1. **Slice 0 — Foundation:** repo scaffold, design tokens, primitive components (button/input/card/sheet/toast), domain-service package skeleton, database schema + migrations, auth.
2. **Slice 1 — Accounts & Onboarding:** Profile, Account CRUD, onboarding flow ending in a real (even if minimal) Home screen.
3. **Slice 2 — Pocket Money Cycle:** PocketMoneyCycle + Income models, cycle creation from onboarding, cycle card on Home.
4. **Slice 3 — Transactions core:** Transaction CRUD (expense/income), default Categories, Transactions list/detail/edit/delete.
5. **Slice 4 — Quick Add:** the fast-entry sheet, FAB, optimistic UI, undo toast — this is the app's most-repeated interaction and deserves its own slice.
6. **Slice 5 — Safe-to-Spend Engine v1:** the V1 formula wired into the Home hero, with the transparent breakdown view.
7. **Slice 6 — Transfers & Refunds:** correct exclusion from spend analytics, per Section 28/35 acceptance criteria.
8. **Slice 7 — Basic Analytics:** category breakdown, daily/weekly totals, recent-transactions widget.
9. **Slice 8 — Budgets:** category + cycle budgets, threshold states, budget rings.
10. **Slice 9 — Recurring Expenses & Emergency Reserve:** unlocks the full V1.5 Safe-to-Spend formula.
11. **Slice 10 — Burn Rate & Forecast.**
12. **Slice 11 — Savings Goals.**
13. **Slice 12 — Split Expenses & Lending.**
14. **Slice 13 — Notifications & Calendar.**
15. **Slice 14 — AI Assistant (read-only tool layer) & Natural-Language Search.**
16. **Slice 15 — Smart Insights, What-If Simulator, Import/Export, Receipt Scanner.**
17. **Slice 16 — PWA/Offline, Hostel/College Modes, Gamification, Location, Multi-currency.**

Each slice must leave the app in a fully working, demoable state before the next begins, per the "no giant implementation" development strategy.
