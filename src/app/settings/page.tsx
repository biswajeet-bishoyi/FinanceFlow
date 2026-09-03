import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { updateCycleSettings, updateProfileSettings } from "@/app/actions/cycle";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await requireUser(true);

  let cycle = await prisma.pocketMoneyCycle.findFirst({
    where: { userId: user.id, status: "active" },
  });

  if (!cycle) {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);

    cycle = await prisma.pocketMoneyCycle.create({
      data: {
        userId: user.id,
        label: "Current Cycle",
        startDate: now,
        endDate: nextMonth,
        expectedAmount: 0,
        frequency: "monthly",
        emergencyReserveAmount: 0,
        status: "active",
      },
    });
  }

  const cycleStartDate = new Date(cycle.startDate);
  const cycleEndDate = new Date(cycle.endDate);
  const currentStartDay = cycleStartDate.getDate();

  // Calculate days elapsed and remaining
  const today = new Date();
  const totalDuration = Math.max(1, Math.ceil((cycleEndDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(1, Math.ceil((cycleEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.round((daysElapsed / totalDuration) * 100));

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Cycle & Settings</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Configure your monthly pocket-money cycle & preferences
          </p>
        </div>

        <Link
          href="/calendar"
          className="flex items-center gap-1.5 text-xs font-semibold bg-surface-container text-primary px-3.5 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          View Calendar
        </Link>
      </div>

      {/* Active Cycle Status Card */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Active Cycle
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{cycle.label}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {cycleStartDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} –{" "}
              {cycleEndDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="text-right">
            <span className="font-label-caps text-[11px] text-on-surface-variant block">DAYS REMAINING</span>
            <span className="font-currency-sm text-currency-sm text-primary font-bold text-xl">
              {daysRemaining} days
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-label-caps text-on-surface-variant">
            <span>Day {daysElapsed} of {totalDuration}</span>
            <span>{progressPercent}% completed</span>
          </div>
          <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Monthly Cycle Start Configuration Form */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-[22px]">event_repeat</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Monthly Cycle Start Date</h2>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
          Choose which day of the month your pocket money arrives (e.g. 1st, 5th, 10th). Safe-to-Spend automatically resets on this day.
        </p>

        <form
          action={async (formData: FormData) => {
            "use server";
            await updateCycleSettings(formData);
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="cycleId" value={cycle.id} />

          {/* Quick Start Day Selector Pills */}
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              MONTHLY CYCLE STARTS ON
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[1, 5, 7, 10, 15, 20, 25].map((day) => (
                <label key={day} className="cursor-pointer">
                  <input
                    type="radio"
                    name="startDay"
                    value={day}
                    defaultChecked={currentStartDay === day}
                    className="peer sr-only"
                  />
                  <div className="py-2.5 px-2 text-center rounded-xl bg-[#F8FAFC] border border-surface-container text-body-sm font-semibold text-on-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary peer-checked:shadow-sm transition-all hover:bg-surface-container">
                    Day {day}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Day Number Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">
                OR ENTER CUSTOM DAY (1 - 28)
              </label>
              <input
                type="number"
                name="startDay"
                min="1"
                max="28"
                placeholder="e.g. 1st, 10th"
                defaultValue={currentStartDay}
                className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-xl focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
              />
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">
                CYCLE LABEL
              </label>
              <input
                type="text"
                name="label"
                defaultValue={cycle.label}
                placeholder="e.g. September Pocket Money"
                className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-xl focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
                required
              />
            </div>
          </div>

          {/* Expected Amount and Emergency Reserve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">
                EXPECTED MONTHLY ALLOWANCE
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                <input
                  type="number"
                  name="expectedAmount"
                  placeholder="5000.00"
                  step="0.01"
                  min="0"
                  defaultValue={cycle.expectedAmount ? (cycle.expectedAmount / 100).toString() : ""}
                  className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-xl focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">
                EMERGENCY RESERVE AMOUNT
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                <input
                  type="number"
                  name="emergencyReserve"
                  placeholder="500.00"
                  step="0.01"
                  min="0"
                  defaultValue={cycle.emergencyReserveAmount ? (cycle.emergencyReserveAmount / 100).toString() : ""}
                  className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-xl focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Custom Date Overrides (Optional) */}
          <div className="pt-2 border-t border-surface-container">
            <span className="font-label-caps text-xs text-on-surface-variant block mb-2 font-semibold uppercase">
              Custom Date Range Override (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">START DATE</label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={cycleStartDate.toISOString().split("T")[0]}
                  className="bg-[#F1F5F9] border-0 text-primary text-body-sm rounded-xl focus:ring-1 focus:ring-primary block w-full p-2.5 transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">END DATE</label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={cycleEndDate.toISOString().split("T")[0]}
                  className="bg-[#F1F5F9] border-0 text-primary text-body-sm rounded-xl focus:ring-1 focus:ring-primary block w-full p-2.5 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-on-primary font-headline-md text-headline-md rounded-xl py-3.5 px-6 mt-1 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            Save Cycle Settings
          </button>
        </form>
      </section>

      {/* Profile & Tone Settings */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-[22px]">person</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Profile & Personality</h2>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
          Customize your display name and tone of financial guidance.
        </p>

        <form
          action={async (formData: FormData) => {
            "use server";
            await updateProfileSettings(formData);
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">YOUR NAME</label>
            <input
              type="text"
              name="displayName"
              defaultValue={user.profile?.displayName || "Student"}
              className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-xl focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">
              PERSONALITY MODE
            </label>
            <select
              name="personalityMode"
              defaultValue={user.profile?.personalityMode || "Friendly"}
              className="bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-xl focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
            >
              <option value="Friendly">Friendly — Encouraging & supportive</option>
              <option value="Calm">Calm — Quiet & numbers-only</option>
              <option value="Brutally Honest">Brutally Honest — Direct numbers about overspending</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-surface-container text-on-surface font-semibold text-body-md rounded-xl py-3 px-6 mt-1 w-full hover:bg-surface-container-high transition-colors active:scale-[0.98]"
          >
            Update Profile
          </button>
        </form>
      </section>

      {/* Data Export & Backup */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_16px_rgba(15,23,42,0.06)] border border-surface-container-high flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">download</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Data Export & Backup</h2>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Export your complete transaction history anytime for spreadsheets or personal backup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="/api/export?format=csv"
            download
            className="p-3.5 rounded-xl border border-surface-container bg-[#F8FAFC] hover:bg-surface-container text-on-surface font-semibold text-body-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">table_chart</span>
            Export as CSV (Excel)
          </a>

          <a
            href="/api/export?format=json"
            download
            className="p-3.5 rounded-xl border border-surface-container bg-[#F8FAFC] hover:bg-surface-container text-on-surface font-semibold text-body-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">data_object</span>
            Export as JSON (Backup)
          </a>
        </div>
      </section>
    </main>
  );
}

