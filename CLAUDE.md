# CLAUDE.md — Engineering & Design Constitution for Student Expense Manager

This file is the persistent operating manual for any AI coding agent (Claude Code, Cursor, Antigravity, or otherwise) working on this repository. **Read this before touching any code.** The full product spec lives in `PRD.md` — this file governs *how* you build it, not *what* to build; when the two conflict on a detail, `PRD.md` wins on product behavior and this file wins on engineering/process discipline.

---

## 1. Project Identity

Student Expense Manager is a mobile-first personal finance companion for people living on **fixed, periodic, limited money** (pocket money, allowances, stipends, irregular gig income) — not a bank dashboard, not accounting software, not a generic expense tracker. The single most important thing the app does is tell the user, honestly and instantly: **how much can I safely spend today.** Everything else supports that number.

## 2. Core Philosophy

**Student-first, cycle-first, honesty-first.**

- The app's sense of time is the user's pocket-money cycle, not the calendar month.
- Every calculated number must be explainable — never a black box.
- Speed of capture beats completeness of capture. A 3-second expense log beats a 12-field form every time.
- Personality lives in tone and motion, never in the correctness of a number.

## 3. Non-Negotiable UX Rules

> **Never make it feel like boring banking software.**

Concretely, this means:
- The Home screen's Safe-to-Spend number is always the single largest, most visually dominant element on the page. Nothing may compete with it.
- No screen should ever look like a generic admin dashboard, a Stripe-style table view, or a Bootstrap panel. If a new screen's first draft looks like that, it needs a design pass before it ships — see `PRD.md` Section 40 for the recommended visual language.
- Quick Add must never take more than a few taps/seconds. If you're adding a required field to that flow, stop and reconsider — required fields belong in enrichment, not capture.
- Copy is honest and calm, never guilt-driven, shaming, or manipulative, in any personality mode (Calm / Friendly / Brutally Honest — "brutally honest" means direct language about numbers, not insults or shame).

## 4. Design Rules

- Funky, immersive, playful, sophisticated, accessible, mobile-first — in that order of visual emphasis, but accessibility is never traded away for any of the others.
- All colors, spacing, radii, shadows, and typography come from design tokens (CSS variables) defined once. **Never hardcode a hex value, a pixel spacing value, or a font-size in a component.** If a token doesn't exist yet for what you need, add it to the token layer first, then use it — don't inline a one-off value "just this once."
- One hero card per screen, maximum. Don't let a new feature compete visually with the Safe-to-Spend number on Home.
- Motion follows the tiers defined in `PRD.md` Section 17 (Fast / Standard / Slow / Celebration). Every animation must respect `prefers-reduced-motion`; if you add a new animated component, you must add its reduced-motion fallback in the same change, not as a follow-up.
- Avoid excessive glassmorphism, excessive gradients, and childish cartoon styling — this was explicitly rejected during design direction (see `PRD.md` Section 40).

## 5. Architecture Rules

- **Domain logic lives in a framework-agnostic `domain/` (or `lib/domain/`) package.** All financial calculations — safe-to-spend, burn rate, forecast, budget percentage, goal progress, transfer/refund handling, split math — are implemented **exactly once** in this package. API routes, server actions, and the AI tool layer all call into this same package. They never reimplement or approximate the formula locally.
- Frontend: Next.js App Router, server components by default, client components only where interactivity requires it (forms, animated counters, charts).
- Backend: Next.js route handlers / server actions, organized by domain (`transactions`, `cycles`, `budgets`, `goals`, `analytics`, `ai`), each authorizing every query server-side against the authenticated user — never trust a client-supplied user id.
- Database: PostgreSQL via the project's chosen ORM (Prisma, per `PRD.md` Section 33, unless a documented reason changes this). Schema changes go through migrations, reviewed before being applied — never hand-edited in production.
- Money is always stored and computed in **integer minor units** (e.g., paise), never floating point. If you see a `float`/`number` type holding a currency amount anywhere outside a display-formatting function, that's a bug.
- UI component layers: **primitives** (button, input, card, sheet, chip, toast — themed via tokens only) → **patterns** (composite components like `QuickAddSheet`, `HeroStat`, `BudgetRing`) → **pages** (compositions of patterns; pages should not define bespoke visual styling without a recorded justification comment).

## 6. Financial Logic Rules

These are the rules most likely to be silently violated by a well-meaning but unfamiliar change. Treat them as invariants with test coverage, not just documentation:

- **Transfers are not expenses.** A transfer between two of the user's own accounts must never appear in spend totals, category breakdowns, or the Safe-to-Spend calculation's "spent" side. It only moves balance between accounts.
- **Reserved money (Emergency Reserve) is not spendable.** It is subtracted before computing Safe-to-Spend and must never be included in "available balance" shown as spendable.
- **Recurring expenses affect forecasts even before they're logged as transactions.** The forecast/Safe-to-Spend engine must account for upcoming recurring expenses due before cycle end, not just historical spend.
- **Refunds restore balance but don't erase history.** A refund is a linked transaction, not a deletion or edit of the original expense; net spend for analytics excludes the refunded amount, but the original transaction stays visible.
- **Pocket-money cycles are first-class entities**, not a derived date range. "Days remaining" and every downstream calculation depend on the active cycle's `start_date`/`end_date` — never compute "days remaining" from the calendar month.
- **Split expenses don't silently reduce the payer's logged expense.** The payer's transaction stays at full amount; what others owe is tracked separately as `LendingRecord`s, surfaced as context alongside the transaction, not as a replacement value.
- **Rounding always rounds down**, never up, when computing Safe-to-Spend — a rounded-up "safe" number that isn't actually safe is a correctness bug, not a cosmetic one.
- Full worked formulas, including the V1 and V1.5 versions, live in `PRD.md` Section 37 — implement exactly what's there, including the transparency requirement (every number must be tappable into its breakdown).

## 7. AI Rules

- The AI Assistant never gets direct or unrestricted database access. It only has the tool surface defined in `PRD.md` Section 21 (`get_balance`, `get_transactions`, `get_category_spending`, `get_cycle_status`, `calculate_affordability`, `get_budget_status`, `get_goal_progress`, `get_forecast`), each of which calls the same `domain/` package used everywhere else.
- All AI tools are **read-only by default.** Any future tool that would create or modify data must return a *proposed* action, rendered as a confirmation dialog, and only executes after the user explicitly taps confirm through the normal authenticated mutation endpoint — never through the AI conversation directly.
- The AI must never invent, estimate, or "fill in" a financial figure. Every number in an AI response must trace back to a tool call result. If a system prompt or agent instruction is ever written for this assistant, it must explicitly forbid fabricated numbers.
- Every AI response should have an inspectable trace of which tools were called with which parameters (this is a product requirement, not optional debugging scaffolding — see `PRD.md` Section 13.9).
- Clearly distinguish **calculation** (deterministic domain-service output, always correct by construction) from **inference** (AI-generated insight/summary language) in both the code and the UI — never let generated prose imply it computed a number itself.

## 8. Coding Standards

- **TypeScript strict mode** everywhere. No `any` without a comment explaining why it's unavoidable.
- Naming: domain concepts use the same nouns as `PRD.md` Section 19 (Cycle, Account, Transaction, Transfer, Budget, Goal, LendingRecord, etc.) — don't invent parallel vocabulary in code (e.g., don't call a `PocketMoneyCycle` a "Period" in one file and "Cycle" in another).
- Components: one component per file, colocate its styles (Tailwind classes) and minimal local state; anything reused in 2+ places graduates to the shared `ui/` or pattern layer instead of being copy-pasted.
- Server/client boundary: default to server components; mark `"use client"` only where needed (interactivity, browser APIs, animation hooks). Never fetch data client-side when a server component can fetch it.
- Error handling: every mutation endpoint returns a typed error shape the client can render as a human-readable message (per `PRD.md` Section 29) — never leak stack traces or raw DB errors to the client.
- Validation: every mutation validated with a schema (Zod or equivalent) at the API boundary, in addition to any client-side form validation — never trust client-side validation alone.
- API patterns: consistent request/response shapes per domain; list endpoints are paginated (cursor-based); no endpoint returns unbounded result sets.
- Database access: only through the ORM/repository layer, respecting soft-delete scoping (deleted transactions excluded by default, never via ad-hoc raw queries that might forget the filter).
- Tests: any new domain-service function ships with unit tests in the same change; any new mutation endpoint ships with at least one integration test covering the authorization boundary (a user cannot read/write another user's data).

## 9. Git Rules

- Small, focused commits — one logical change per commit, not "various fixes."
- Meaningful commit messages describing *why*, not just *what* (e.g., `fix: exclude refunds from net spend total in cycle analytics` not `fix bug`).
- Never commit secrets, API keys, or `.env` files — check `PRD.md` Section 32 for the expected environment variable names and confirm none of their values are hardcoded anywhere in the diff before committing.
- Review the full diff before committing — don't stage everything blindly (`git add .`) without checking what's actually included.
- Don't rewrite or force-push shared history without explicit instruction.

## 10. UI Rules

- Build reusable components, not one-off page-specific markup, for anything that appears (or is likely to appear) more than once.
- Use design tokens exclusively for color/spacing/radius/typography/shadow — see Section 5 above; this is repeated here because it is the single most common way a change quietly drifts the visual identity.
- Consistent spacing and motion — pull from the same scale everywhere; don't introduce a new spacing value or animation duration without adding it to the token/tier system first.
- No one-off styling unless justified with a comment explaining why the design system doesn't cover this case — and if you find yourself writing that comment often for the same reason, that's a sign the token/pattern layer needs to grow, not a sign it's fine to keep working around it.

## 11. Development Workflow

Before implementing any feature:

1. Read the relevant section(s) of `PRD.md` in full — don't work from a summary or a half-remembered version of the spec.
2. Understand the existing architecture in the area you're touching (read the domain-service package, the relevant API routes, the relevant components) before writing new code.
3. Inspect related/adjacent components to avoid duplicating something that already exists.
4. Identify dependencies — check `PRD.md` Section 34's roadmap dependency notes; don't build a V1.5+ feature's UI ahead of the domain data it depends on existing.
5. Plan the implementation (which layer changes: domain service? API route? component? all three?) before writing code.
6. Implement, following Sections 5–10 above.
7. Test — unit tests for any calculation, integration tests for any new endpoint, per Section 8.
8. Check responsive behavior across mobile/tablet/desktop — don't only verify one breakpoint.
9. Check accessibility — keyboard navigation, focus states, screen-reader labels, contrast, reduced-motion fallback.
10. Update documentation — if the change affects product behavior described in `PRD.md`, note the discrepancy; if it's a new architectural decision, record it (a short ADR note or a comment at the decision site is sufficient).

## 12. Definition of Done

A feature is not complete until:
- It works, and its behavior exactly matches the formula/spec in `PRD.md` (no drift between what the UI shows, what the API returns, and what the AI tool layer reports for the same underlying data).
- It is responsive across mobile, tablet, and desktop.
- It is accessible per Section 18 of `PRD.md`.
- It handles errors gracefully with human-readable messages and a recovery action.
- It has a designed empty state and loading state, not just a populated-data state.
- It has tests where appropriate — financial calculations always, UI components where behavior is non-trivial.
- It follows the design system — tokens, primitives, motion tiers — with no unexplained one-off styling.
- It doesn't break existing functionality — run the existing test suite, don't just eyeball the new feature.
- Documentation (`PRD.md` or inline architectural notes) is updated if behavior or architecture changed from what was previously documented.

---

## 13. Important AI Coding Agent Behavior

**Do not:**
- Rewrite working architecture unnecessarily. If something works and matches the spec, leave it.
- Replace libraries without a documented, specific technical justification.
- Create duplicate components or duplicate database models when an existing one already covers the need (or is close enough to extend).
- Hardcode financial calculations anywhere outside the `domain/` package.
- Hardcode colors, spacing, or other visual values directly in components.
- Create giant, do-everything components — split by responsibility, following the primitive/pattern/page layering in Section 5.
- Put business logic inside UI components — UI components render state and dispatch actions; they don't compute safe-to-spend, burn rate, or any other domain figure themselves.
- Expose secrets client-side, ever.
- Invent APIs, endpoints, or database fields that aren't in `PRD.md` Section 19/20 without first checking whether an existing one already serves the need.
- Invent financial data — never fabricate example transactions, balances, or figures in a way that could be mistaken for real user data, including in seed scripts (label seed/demo data unambiguously).
- Add dependencies that aren't clearly justified by the task at hand — check `PRD.md` Section 33 for the intended stack before reaching for a new library.

**Do:**
- Reuse existing components and existing domain-service functions.
- Follow the existing architecture and layering, even if you'd have structured it differently starting from scratch.
- Keep business logic in the `domain/` package, UI logic in components, and data-access logic in the repository/ORM layer — three separate concerns, three separate places.
- Create reusable domain services rather than inlining a calculation at the call site "just this once."
- Validate all user input, server-side, on every mutation.
- Keep financial calculations deterministic and pure (no hidden randomness, no reliance on wall-clock time inside the calculation itself — pass `today` in as a parameter so calculations are testable).
- Write tests for financial logic as a matter of course, not as an afterthought.
- Preserve backward compatibility with existing data — schema changes need a migration path for existing rows, not just a fresh-database assumption.
- Document architectural decisions where they aren't obvious from the code alone.

---

## 14. Development Strategy — Vertical Slices

**Do not generate the entire application in one giant implementation.** Work in the vertical slices defined in `PRD.md` Section 41, in order:

`Foundation → Accounts & Onboarding → Pocket Money Cycle → Transactions core → Quick Add → Safe-to-Spend Engine v1 → Transfers & Refunds → Basic Analytics → Budgets → Recurring & Reserve → Burn Rate & Forecast → Savings Goals → Split & Lending → Notifications & Calendar → AI Assistant → Smart Insights/What-If/Import-Export/Receipts → PWA/Hostel/College/Gamification/Location/Multi-currency`

Each slice must leave the application in a fully working, demoable state before starting the next one. If a requested change spans multiple slices, implement the earliest incomplete dependency first rather than building a later feature on top of a shortcut.

---

## 15. When in Doubt

If `PRD.md` doesn't clearly answer a product question, make the most student-friendly, honest, non-manipulative choice consistent with the principles in `PRD.md` Section 7, implement it, and note the assumption explicitly (in a code comment and, if significant, as a flagged open question) rather than silently guessing or blocking on it.
