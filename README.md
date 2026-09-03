# 💸 FinanceFlow — Student Pocket Money & Safe-to-Spend Runway Manager

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**Stop running out of pocket money before the month ends.**  
FinanceFlow is an intelligent personal finance manager tailored specifically for students and young adults living on a recurring monthly allowance.

[Live Demo](https://finance-flow-mngr.vercel.app) • [Report Bug](https://github.com/biswajeet-bishoyi/FinanceFlow/issues) • [Request Feature](https://github.com/biswajeet-bishoyi/FinanceFlow/issues)

</div>

---

## 🌟 Core Highlights

Traditional budget apps assume continuous income and annual salary planning. **FinanceFlow** reasons around discrete pocket money cycles and gives you an instant, mathematically guaranteed answer to: **"How much can I safely spend today without starving on the 28th?"**

```
                         Available Balance − Emergency Reserve − Upcoming Bills
Safe-to-Spend / Day  =  ────────────────────────────────────────────────────────
                                         Days Remaining in Cycle
```

---

## 🚀 Key Features

### 1. 🛡️ Safe-to-Spend Dashboard (`/`)
- **Real-time Runway Hero**: Displays daily spend limit, remaining days, and total balance.
- **Emergency Reserve Protection**: Locks away a safety net so unplanned expenses don't zero your accounts.
- **7-Day Spend Trajectory**: Live micro-chart displaying daily spend velocity with today highlighted.

### 2. 🎯 "Can I Afford This?" Simulator (`/afford`)
- **Instant Purchase Feasibility**: Type any purchase amount (e.g. ₹650 for sneakers or ₹350 for dinner).
- **Color-Coded Verdict**:
  - 🟢 **Safely Affordable**: Fits within budget without dropping daily allowance below safety threshold.
  - 🟡 **Tight Squeeze**: Warns that daily allowance will shrink.
  - 🔴 **Reserve Breach / Deficit Alert**: Blocks impulse spending that triggers financial deficits.
- **1-Tap Direct Log**: Convert approved simulations into real transactions with one tap.

### 3. 🔮 What-If Scenario Simulator (`/what-if`)
- **Reactive Scenario Modeling**: Zero-reload interactive sliders to plan financial decisions:
  - Extra Income / Freelance Gigs (`+₹2,000` / `+₹5,000`).
  - One-time planned purchases (`-₹1,500` textbook / travel).
  - Canteen & snack spend cuts (`10%` / `20%` / `35%` savings).
  - Subscription additions or cancellations (`±₹299/mo`).
- **Before vs. After Comparison**: Live delta calculation for daily safe allowance, balance, and runway.

### 4. 💡 Smart Behavioral Insights
- **Rule-based Intelligence**: Dynamic observation engine detecting spending trends:
  - 🛡️ Reserve shield integrity status.
  - 📊 Top spending category tracking.
  - ☕ Weekend canteen/food delivery spikes (`~35% higher spend`).
  - 💡 Student pro-tips (e.g., settling hostel chai splits quickly).

### 5. 🏆 Gamification & Financial Health Score (`/achievements`)
- **Financial Health Score (0 – 100)**: Evaluated across 4 pillars (Emergency Buffer, Active Tracking, Budget Discipline, Savings Goals).
- **Flame Streak Counter**: Daily transaction logging streak (`local_fire_department`).
- **6 Unlockable Badges**: *Reserve Guardian*, *Daily Tracker*, *Goal Stasher*, *Budget Boss*, *Social Splitter*, *Positive Runway*.

### 6. 🔔 Smart Notifications Center (`/notifications`)
- **Top App Bar Bell Indicator**: Live unread alerts badge.
- **Automated Alerts**:
  - ☀️ *Daily Morning Brief*: Today's safe allowance limit.
  - 📅 *Upcoming Bill Reminders*: 7-day proactive subscription notice.
  - ⚠️ *Budget Caution Threshold*: Alerts when category spend exceeds 80% / 95%.
  - 🤝 *Friend Split Reminders*: Open debts owed to you by friends.
  - ⏳ *Cycle Rollover Alert*: 3-day countdown before cycle renewal.

### 7. 📅 Interactive Cycle Calendar (`/calendar`)
- **Cycle-Aware Grid**: Month-at-a-glance calendar displaying daily spend badges (`-₹...`), income markers (`+₹...`), and subscription bill due dates.
- **Day Inspector**: Tap any date to view itemized breakdown and receipts.

### 8. ⚙️ Cycle Start Date & Settings (`/settings`)
- **Custom Pocket Money Day**: Set your cycle to start on the 1st, 5th, 10th, 25th, or any custom day (1–28).
- **Personality Mode**: Choose between *Friendly*, *Calm*, and *Brutally Honest* guidance tones.
- **Data Export & Backup**: 1-click **Export to CSV (Excel)** and **Export to JSON**.

### 9. 👥 Friends & Split Expenses (`/friends`)
- **Hostel & Group Splits**: Track shared canteen bills, cab rides, and informal student IOUs with partial settlement support.

### 10. 💳 Subscriptions & Recurring Bills (`/recurring`)
- **Automated Bills**: Track fixed monthly recurring costs (Hostel Wi-Fi, Spotify, Gym, Mess dues).

### 11. 📱 Mobile PWA Ready
- Standalone web app with touch targets, safe area insets, and offline manifest support.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) | Server Components, Server Actions, Route Handlers |
| **UI Library** | React 19 | Optimized client rendering and state transitions |
| **Styling** | TailwindCSS v4 + Vanilla CSS Tokens | Zero-runtime CSS variables, rich dark/light surface tokens |
| **Database ORM** | Prisma 7.9 | Type-safe queries, relational schema migrations |
| **Database** | PostgreSQL (Supabase / Neon) | Relational store with foreign keys & transaction pooling |
| **Charts** | Recharts | Responsive daily spend & category donut visualizations |
| **Design System** | Google Material Symbols | High-contrast vector ligature icons |
| **Deployment** | Vercel | Production edge network with CI/CD GitHub integration |

---

## 📐 Mathematical Domain Architecture

All financial calculations follow strict domain-driven design principles:
- **Integer Minor Units (Paise)**: All currency amounts are stored and computed as integer paise (`₹10.50` = `1050`) to eliminate floating-point rounding errors.
- **Pure Functions**: Formulas in `src/domain/` are 100% pure, deterministic, and test-covered:
  - `src/domain/safe-to-spend.ts` & `src/domain/safe-to-spend.test.ts`
  - `src/domain/cycle-balance.ts`
  - `src/domain/insights.ts` & `src/domain/insights.test.ts`
  - `src/domain/gamification.ts` & `src/domain/gamification.test.ts`
  - `src/domain/notifications.ts`

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/biswajeet-bishoyi/FinanceFlow.git
cd FinanceFlow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Run database migrations & generate Prisma client
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the development server
```bash
npm run dev
# App will run at http://localhost:3000 (or custom port via -p 4000)
```

---

## 🧪 Testing & Verification

Run the test suite:
```bash
npx tsc --noEmit        # TypeScript type checks
npm run build           # Full Next.js production build test
```

---

## 📂 Project Structure

```
FinanceFlow/
├── prisma/
│   └── schema.prisma              # Relational models (Cycles, Accounts, Transactions, etc.)
├── public/
│   └── manifest.json              # PWA standalone manifest
├── src/
│   ├── app/
│   │   ├── (auth)/login & signup  # Supabase authentication
│   │   ├── achievements/          # Gamification, score & badges
│   │   ├── afford/                # "Can I Afford This?" decision simulator
│   │   ├── analytics/             # Burn rate & category breakdown
│   │   ├── api/export/            # CSV / JSON data backup route
│   │   ├── budgets/               # Category budget limits
│   │   ├── calendar/              # Month spend & bill calendar
│   │   ├── friends/               # Social splits & IOU ledger
│   │   ├── goals/                 # Savings stash & targets
│   │   ├── notifications/         # Real-time notification center
│   │   ├── recurring/             # Subscriptions & recurring bills
│   │   ├── settings/              # Cycle start date & profile
│   │   ├── transactions/          # Full transaction history
│   │   ├── what-if/               # Scenario planning simulator
│   │   └── page.tsx               # Safe-to-Spend Home Dashboard
│   ├── components/                # Reusable design system primitives
│   ├── domain/                    # Pure math formulas (Runway, Insights, Gamification)
│   └── lib/                       # Database client, auth helpers, formatters
└── README.md
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
Built with ❤️ for students striving for financial freedom.
</div>
