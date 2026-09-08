"use client";
import { useState, useEffect } from "react";

type Friend = { id: string; name: string; avatarColor?: string | null };

interface SplitSectionProps {
  friends: Friend[];
}

interface Participant {
  personId: string;
  name: string;
  avatarColor?: string | null;
  customAmount: string; // user-typed value
}

export function SplitSection({ friends }: SplitSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectingFriend, setSelectingFriend] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");

  // Listen to amount input changes from the parent form
  useEffect(() => {
    const amountInput = document.querySelector<HTMLInputElement>('input[name="amount"]');
    if (!amountInput) return;

    const handler = () => setTotalAmount(amountInput.value);
    amountInput.addEventListener("input", handler);
    return () => amountInput.removeEventListener("input", handler);
  }, []);

  const total = parseFloat(totalAmount) || 0;
  const totalPeople = participants.length + 1; // +1 for "me"
  const equalShare = totalPeople > 1 ? total / totalPeople : 0;

  function addParticipant(friend: Friend) {
    if (participants.some((p) => p.personId === friend.id)) return;
    setParticipants((prev) => [
      ...prev,
      { personId: friend.id, name: friend.name, avatarColor: friend.avatarColor, customAmount: "" },
    ]);
    setSelectingFriend(false);
  }

  function removeParticipant(personId: string) {
    setParticipants((prev) => prev.filter((p) => p.personId !== personId));
  }

  function updateCustomAmount(personId: string, value: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.personId === personId ? { ...p, customAmount: value } : p))
    );
  }

  const availableFriends = friends.filter(
    (f) => !participants.some((p) => p.personId === f.id)
  );

  // Calculate "my share" for custom mode
  const customTotal = participants.reduce((acc, p) => acc + (parseFloat(p.customAmount) || 0), 0);
  const myCustomShare = Math.max(0, total - customTotal);

  if (!enabled) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => {
            if (friends.length === 0) return;
            setEnabled(true);
          }}
          className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
            friends.length === 0
              ? "border-surface-container-high text-on-surface-variant/40 cursor-not-allowed"
              : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-secondary/5 cursor-pointer"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">call_split</span>
          <span className="font-body-sm text-body-sm font-medium">
            {friends.length === 0 ? "Add friends first to split expenses" : "Split this expense"}
          </span>
          {friends.length > 0 && (
            <span className="ml-auto material-symbols-outlined text-[16px]">add</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">call_split</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wide uppercase">
            SPLIT EXPENSE
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEnabled(false);
            setParticipants([]);
          }}
          className="text-on-surface-variant hover:text-error text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          Remove split
        </button>
      </div>

      {/* Split Method Toggle */}
      <div className="flex bg-input-bg p-1 rounded-xl border border-surface-container-high">
        <button
          type="button"
          onClick={() => setSplitMethod("equal")}
          className={`flex-1 py-2 rounded-lg text-body-sm font-semibold transition-all ${
            splitMethod === "equal"
              ? "bg-surface-container-lowest text-on-surface shadow-xs border border-surface-container-high"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Equal Split
        </button>
        <button
          type="button"
          onClick={() => setSplitMethod("custom")}
          className={`flex-1 py-2 rounded-lg text-body-sm font-semibold transition-all ${
            splitMethod === "custom"
              ? "bg-surface-container-lowest text-on-surface shadow-xs border border-surface-container-high"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Custom Amounts
        </button>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="splitMethod" value={splitMethod} />
      {participants.map((p) => (
        <span key={p.personId}>
          <input type="hidden" name="splitPersonIds" value={p.personId} />
          {splitMethod === "custom" && (
            <input
              type="hidden"
              name={`splitAmount_${p.personId}`}
              value={p.customAmount || "0"}
            />
          )}
        </span>
      ))}

      {/* Participants List */}
      {participants.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden">
          {/* Me */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-container">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[16px]">person</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface font-medium flex-1">
              You (me)
            </span>
            <div className="text-right">
              {splitMethod === "equal" ? (
                <span className="font-currency-sm text-currency-sm text-primary font-bold">
                  ₹{equalShare > 0 ? equalShare.toFixed(2) : "—"}
                </span>
              ) : (
                <span className="font-currency-sm text-currency-sm text-primary font-bold">
                  ₹{total > 0 ? myCustomShare.toFixed(2) : "—"}
                </span>
              )}
            </div>
          </div>

          {/* Each friend */}
          {participants.map((p, idx) => (
            <div
              key={p.personId}
              className={`flex items-center gap-3 px-4 py-3 ${
                idx < participants.length - 1 ? "border-b border-surface-container" : ""
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                style={{ backgroundColor: p.avatarColor || "var(--color-friend-avatar-fallback)" }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface font-medium flex-1 truncate">
                {p.name}
              </span>

              {splitMethod === "equal" ? (
                <span className="font-currency-sm text-currency-sm text-secondary font-bold shrink-0">
                  ₹{equalShare > 0 ? equalShare.toFixed(2) : "—"}
                </span>
              ) : (
                <div className="relative shrink-0 w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={p.customAmount}
                    onChange={(e) => updateCustomAmount(p.personId, e.target.value)}
                    className="bg-input-bg border-0 text-primary text-sm rounded-lg focus:ring-1 focus:ring-secondary block w-full pl-6 pr-2 py-1.5 transition-colors"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => removeParticipant(p.personId)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 shrink-0 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">remove_circle</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary for custom split */}
      {splitMethod === "custom" && participants.length > 0 && total > 0 && (
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
            Math.abs(customTotal - total) < 0.01
              ? "bg-secondary/10 text-secondary"
              : customTotal > total
              ? "bg-error-container text-error"
              : "bg-[#f59e0b]/10 text-[#f59e0b]"
          }`}
        >
          <span>
            {Math.abs(customTotal - total) < 0.01
              ? "✓ Amounts balance perfectly"
              : customTotal > total
              ? `⚠ Exceeds total by ₹${(customTotal - total).toFixed(2)}`
              : `Remaining for you: ₹${myCustomShare.toFixed(2)}`}
          </span>
          <span className="opacity-70">
            ₹{customTotal.toFixed(2)} / ₹{total.toFixed(2)}
          </span>
        </div>
      )}

      {/* Equal split info */}
      {splitMethod === "equal" && participants.length > 0 && total > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 text-secondary text-xs font-medium">
          <span className="material-symbols-outlined text-[14px]">info</span>
          <span>
            ₹{total.toFixed(2)} ÷ {totalPeople} people = ₹{equalShare.toFixed(2)} each
          </span>
        </div>
      )}

      {/* Add person / dropdown */}
      {availableFriends.length > 0 && (
        <div className="relative">
          {!selectingFriend ? (
            <button
              type="button"
              onClick={() => setSelectingFriend(true)}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all text-sm font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add another person ({availableFriends.length} available)
            </button>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-surface-container">
                <span className="text-xs text-on-surface-variant font-medium">Select a friend</span>
                <button
                  type="button"
                  onClick={() => setSelectingFriend(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              {availableFriends.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => addParticipant(f)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface-container transition-colors text-left border-b border-surface-container last:border-b-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ backgroundColor: f.avatarColor || "var(--color-friend-avatar-fallback)" }}
                  >
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface">{f.name}</span>
                  <span className="ml-auto material-symbols-outlined text-[16px] text-on-surface-variant">add</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No friends left to add */}
      {availableFriends.length === 0 && participants.length > 0 && (
        <p className="text-xs text-on-surface-variant text-center py-1">
          All your friends have been added to this split.
        </p>
      )}

      {/* Prompt to add first person */}
      {participants.length === 0 && !selectingFriend && (
        <button
          type="button"
          onClick={() => setSelectingFriend(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all text-sm font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add someone to split with
        </button>
      )}

      {/* Selecting first person inline */}
      {participants.length === 0 && selectingFriend && (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-container">
            <span className="text-xs text-on-surface-variant font-medium">Select a friend</span>
            <button
              type="button"
              onClick={() => setSelectingFriend(false)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          {friends.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => addParticipant(f)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface-container transition-colors text-left border-b border-surface-container last:border-b-0"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                style={{ backgroundColor: f.avatarColor || "var(--color-friend-avatar-fallback)" }}
              >
                {f.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface">{f.name}</span>
              <span className="ml-auto material-symbols-outlined text-[16px] text-on-surface-variant">add</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
