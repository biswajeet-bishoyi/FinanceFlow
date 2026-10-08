# 💰 FinanceFlow — Student Pocket Money & Safe-to-Spend Runway Manager

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**Stop running out of pocket money before the month ends.**  
FinanceFlow is an intelligent personal finance manager tailored for students living on a recurring monthly allowance.

[Report Bug](https://github.com/biswajeet-bishoyi/FinanceFlow/issues) • [Request Feature](https://github.com/biswajeet-bishoyi/FinanceFlow/issues)

</div>

---

## 🌟 Overview

Most budgeting apps cater to salaried professionals with monthly paychecks and complex investment portfolios. **FinanceFlow** is engineered specifically for students, hostelers, and young adults managing an allowance. Instead of passive retrospective tracking, FinanceFlow answers the singular question that matters every morning:

$$\text{Safe Daily Allowance} = \frac{\text{Current Balance} - \text{Committed Bills} - \text{Emergency Reserve}}{\text{Days Remaining in Cycle}}$$

---

## 🚀 Key Features

### 1. 🛡️ Dynamic Safe-to-Spend Runway (Home Dashboard)
- **Live Daily Spend Limit**: Dynamic daily burn rate that automatically recalculates whenever you log a transaction.
- **Cycle Health Gauge**: Visual runway indicator letting you know if you are ahead of, on track with, or falling behind your budget.
- **7-Day Velocity Chart**: Micro-chart visualizing daily expenditure patterns with current day benchmarking.

### 2. 🤔 "Can I Afford This?" Decision Simulator (`/afford`)
- **Instant Purchase Feasibility**: Enter any planned purchase (e.g. ₹650 for books or ₹350 for dinner).
- **Color-Coded Verdict**:
  - 🟢 **Safely Affordable**: Fits within budget without shrinking your daily allowance below your minimum comfort limit.
  - 🟡 **Tight Squeeze**: Warns how much your daily allowance will shrink for the remainder of the month.
  - 🔴 **Reserve Breach / Deficit Alert**: Flags transactions that will drain emergency buffers.
- **1-Tap Direct Logging**: Convert approved simulations into real transactions with a single click.

### 3. 🎛️ What-If Scenario Simulator (`/what-if`)
- **Zero-Reload Interactive Sliders**:
  - Extra Income / Freelance Gigs (`+₹2,000` / `+₹5,000`).
  - One-time planned purchases (`-₹1,500` travel / gadgets).
  - Canteen & snack spend cuts (`10%` / `20%` / `35%` savings).
  - Subscription additions or cancellations (`±₹299/mo`).
- **Live Delta Computation**: Instant feedback on changes to daily safe allowance, reserve balance, and runway.

### 4. 🧠 Smart Behavioral Insights & Alerts
- Rule-based detection of recurring financial traps:
  - Weekend food delivery spikes (~35% higher spend).
  - Hostel canteen chai/snack cumulative leaks.
  - Idle subscriptions eating into monthly runway.

### 5. 🏆 Gamification & Financial Health Score (`/achievements`)
- **Health Score (0 – 100)**: Evaluated across Emergency Buffer, Active Tracking, Budget Discipline, and Savings Goals.
- **Streak Counter**: Daily logging streak tracker.
- **6 Unlockable Badges**: *Reserve Guardian*, *Daily Tracker*, *Goal Stasher*, *Budget Boss*, *Social Splitter*, *Positive Runway*.

### 6. 🤝 Hostel & Group Splits (`/friends`)
- Track shared canteen bills, cab rides, and informal student IOUs with partial settlement history.

### 7. 📅 Interactive Cycle Calendar (`/calendar`)
- Calendar highlighting daily spend badges, income markers, and subscription due dates.

---

## 🏛️ Mathematical Domain Architecture

All financial calculations follow strict domain-driven design principles:
- **Integer Minor Units (Paise)**: All currency amounts are stored and computed as integer paise (`₹10.50` = `1050`) to eliminate floating-point rounding errors.
- **Pure Functions**: Formulas in `src/domain/` are 100% deterministic, side-effect free, and thoroughly unit tested:
  - `src/domain/safe-to-spend.ts`
  - `src/domain/cycle-balance.ts`
  - `src/domain/insights.ts`
  - `src/domain/gamification.ts`

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **UI Library** | React 19 |
| **Styling** | TailwindCSS v4 + CSS Tokens |
| **Database ORM** | Prisma 7.9 |
| **Database** | PostgreSQL (Supabase / Neon) |
| **Visualizations** | Recharts |
| **Icons** | Google Material Symbols |

---

## 💻 Quick Start

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
DATABASE_URL="postgresql://user:password@host:5432/postgres"
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
```

Open `http://localhost:3000` in your browser.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with ❤️ for students by <a href="https://github.com/biswajeet-bishoyi">Biswajeet Bishoyi</a>
</div>
