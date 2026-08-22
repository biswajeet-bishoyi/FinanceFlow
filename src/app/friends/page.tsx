import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addFriend, settleDebt } from "@/app/actions/friends";

export default async function FriendsPage() {
  const user = await requireUser();
  

  const friends = await prisma.person.findMany({
    where: { userId: user.id },
    include: {
      lendingRecords: {
        where: { status: "open" }
      }
    }
  });

  const formatMoney = (amount: number) => {
    return (amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
  };

  return (
    <main className="max-w-3xl mx-auto p-container-padding flex flex-col gap-section-gap pt-6 pb-20">
      <section className="flex flex-col gap-stack-gap">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Friends & Splits</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Keep track of who owes who.</p>
        </div>
      </section>

      {/* Add Friend */}
      <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 tracking-wide">ADD FRIEND</h2>
        <form action={addFriend} className="flex gap-2">
          <input 
            type="text" 
            name="name" 
            placeholder="Friend's Name" 
            className="flex-grow bg-[#F1F5F9] border-0 text-primary text-body-lg rounded-lg focus:ring-1 focus:ring-primary p-3 transition-colors" 
            required 
          />
          <button type="submit" className="bg-primary text-on-primary font-medium rounded-lg px-6 hover:bg-opacity-90 transition-all">
            Add
          </button>
        </form>
      </section>

      {/* Friends List */}
      <section className="flex flex-col gap-stack-gap">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant tracking-wide">BALANCES</h2>
        {friends.length === 0 ? (
          <p className="text-on-surface-variant text-center py-8 bg-surface-container-lowest rounded-xl">No friends added yet.</p>
        ) : (
          friends.map(friend => {
            const totalLent = friend.lendingRecords.filter(r => r.direction === "lent").reduce((acc, r) => acc + r.amount, 0);
            const totalBorrowed = friend.lendingRecords.filter(r => r.direction === "borrowed").reduce((acc, r) => acc + r.amount, 0);
            const netBalance = totalLent - totalBorrowed;

            return (
              <div key={friend.id} className="bg-surface-container-lowest rounded-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: friend.avatarColor || '#ccc' }}>
                    {friend.name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <span className="font-headline-md text-headline-md text-on-surface">{friend.name}</span>
                    <div className="font-body-sm text-body-sm">
                      {netBalance > 0 && <span className="text-secondary">Owes you {formatMoney(netBalance)}</span>}
                      {netBalance < 0 && <span className="text-error">You owe {formatMoney(Math.abs(netBalance))}</span>}
                      {netBalance === 0 && <span className="text-on-surface-variant">Settled up</span>}
                    </div>
                  </div>
                </div>

                {friend.lendingRecords.length > 0 && (
                  <div className="border-t border-surface-container pt-3 flex flex-col gap-2">
                    {friend.lendingRecords.map(record => (
                      <div key={record.id} className="flex justify-between items-center">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{record.note || "Split expense"}</span>
                        <div className="flex items-center gap-4">
                          <span className={`font-currency-sm text-currency-sm ${record.direction === "lent" ? "text-secondary" : "text-error"}`}>
                            {record.direction === "lent" ? "+" : "-"}{formatMoney(record.amount)}
                          </span>
                          <form action={settleDebt}>
                            <input type="hidden" name="recordId" value={record.id} />
                            <button type="submit" className="text-primary font-body-sm text-body-sm hover:underline border border-primary px-2 py-1 rounded">Settle</button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
