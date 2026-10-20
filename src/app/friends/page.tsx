import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import { addFriend, recordLending } from "@/app/actions/friends";
import { SubmitButton } from "@/components/ui/submit-button";
import { FriendListWithDetails } from "@/components/friend-list-with-details";

export default async function FriendsPage() {
  const user = await requireUser();

  const friends = await prisma.person.findMany({
    where: { userId: user.id },
    include: {
      lendingRecords: {
        where: { status: "open" },
        orderBy: { occurredAt: "desc" },
      }
    },
    orderBy: { name: "asc" }
  });

  // Calculate overall totals
  let totalOwedToYou = 0;
  let totalYouOwe = 0;

  friends.forEach(f => {
    f.lendingRecords.forEach(r => {
      if (r.direction === "lent") totalOwedToYou += r.amount;
      else if (r.direction === "borrowed") totalYouOwe += r.amount;
    });
  });

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-24">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-gap">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Friends & Splits</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Track informal lending & group splits</p>
          </div>
        </div>

        {/* Overall Balance Summary Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">THEY OWE YOU</span>
            <span className="font-currency-sm text-currency-sm text-secondary font-bold text-lg">
              {formatMoney(totalOwedToYou)}
            </span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">YOU OWE THEM</span>
            <span className="font-currency-sm text-currency-sm text-error font-bold text-lg">
              {formatMoney(totalYouOwe)}
            </span>
          </div>
        </div>
      </section>

      {/* Record a Loan / Borrow */}
      {friends.length > 0 && (
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide uppercase">RECORD LOAN / BORROW</h2>
          <form action={async (formData: FormData) => {
            "use server";
            await recordLending(formData);
          }} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">FRIEND</label>
                <select 
                  name="personId" 
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
                  required
                >
                  <option value="">Select friend</option>
                  {friends.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">TYPE</label>
                <select 
                  name="direction" 
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors"
                  required
                >
                  <option value="lent">I Lent (They owe me)</option>
                  <option value="borrowed">I Borrowed (I owe them)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">AMOUNT</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                  <input 
                    type="number" 
                    name="amount" 
                    placeholder="100.00" 
                    step="0.01"
                    min="0.01"
                    className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full pl-8 p-3 transition-colors" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">NOTE (OPTIONAL)</label>
                <input 
                  type="text" 
                  name="note" 
                  placeholder="e.g. Chai, Movie ticket, Lunch" 
                  className="bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary block w-full p-3 transition-colors" 
                />
              </div>
            </div>

            <SubmitButton 
              pendingText="Recording Amount..."
              className="bg-primary text-on-primary font-headline-md text-headline-md rounded-lg py-3 px-6 mt-1 w-full shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 transition-all active:scale-[0.98] cursor-pointer"
            >
              Record Amount
            </SubmitButton>
          </form>
        </section>
      )}

      {/* Friends List */}
      <section className="flex flex-col gap-stack-gap">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant tracking-wide uppercase">FRIEND BALANCES ({friends.length})</h2>
        <FriendListWithDetails friends={friends} />
      </section>

      {/* Add Friend */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide uppercase">ADD NEW FRIEND</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await addFriend(formData);
        }} className="flex gap-2">
          <input 
            type="text" 
            name="name" 
            placeholder="Friend's Name (e.g. Rahul, Priya)" 
            className="flex-grow bg-input-bg border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary p-3 transition-colors" 
            required 
          />
          <SubmitButton pendingText="Adding..." className="bg-primary text-on-primary font-medium rounded-lg px-6 hover:bg-opacity-90 transition-all active:scale-95 cursor-pointer">
            Add
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
