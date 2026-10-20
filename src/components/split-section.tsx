"use client";
import { useState, useEffect, useMemo } from "react";

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
  const [totalAmount, setTotalAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Listen to amount input changes from the parent form
  useEffect(() => {
    const amountInput = document.querySelector<HTMLInputElement>('input[name="amount"]');
    if (!amountInput) return;

    if (amountInput.value) {
      setTotalAmount(amountInput.value);
    }

    const handler = () => setTotalAmount(amountInput.value);
    amountInput.addEventListener("input", handler);
    return () => amountInput.removeEventListener("input", handler);
  }, [enabled]);

  const total = parseFloat(totalAmount) || 0;
  const totalPeople = participants.length + 1; // +1 for "me"
  const equalShare = totalPeople > 1 ? total / totalPeople : 0;

  // Toggle single friend selection
  function toggleParticipant(friend: Friend) {
    setParticipants((prev) => {
      const exists = prev.some((p) => p.personId === friend.id);
      if (exists) {
        return prev.filter((p) => p.personId !== friend.id);
      } else {
        return [
          ...prev,
          {
            personId: friend.id,
            name: friend.name,
            avatarColor: friend.avatarColor,
            customAmount: "",
          },
        ];
      }
    });
  }

  // Select all friends
  function handleSelectAll() {
    setParticipants(
      friends.map((f) => {
        const existing = participants.find((p) => p.personId === f.id);
        return {
          personId: f.id,
          name: f.name,
          avatarColor: f.avatarColor,
          customAmount: existing ? existing.customAmount : "",
        };
      })
    );
  }

  // Deselect all friends
  function handleDeselectAll() {
    setParticipants([]);
  }

  function removeParticipant(personId: string) {
    setParticipants((prev) => prev.filter((p) => p.personId !== personId));
  }

  function updateCustomAmount(personId: string, value: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.personId === personId ? { ...p, customAmount: value } : p))
    );
  }

  const isAllSelected = friends.length > 0 && participants.length === friends.length;

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase().trim();
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, searchQuery]);

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
            setParticipants([]);
          }}
          className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
            friends.length === 0
              ? "border-surface-container-high text-on-surface-variant/40 cursor-not-allowed"
              : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-secondary/5 cursor-pointer"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">call_split</span>
          <span className="font-body-sm text-body-sm font-medium">
            {friends.length === 0
              ? "Add friends first to split expenses"
              : `Split this expense (${friends.length} friend${friends.length > 1 ? "s" : ""} available)`}
          </span>
          {friends.length > 0 && (
            <span className="ml-auto material-symbols-outlined text-[16px]">add</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[20px] text-secondary shrink-0">call_split</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase font-bold text-xs truncate">
            SPLIT EXPENSE
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEnabled(false);
            setParticipants([]);
            setSearchQuery("");
          }}
          className="text-on-surface-variant hover:text-error text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-error-container/20 shrink-0"
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
          Cancel
        </button>
      </div>

      {/* Friend Multi-Select Section */}
      <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-xl border border-surface-container-high flex flex-col gap-2.5">
        {/* Selected Count & Select All Bar */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-surface-container">
          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/15 text-secondary font-semibold shrink-0">
            {participants.length} of {friends.length} selected
          </span>
          <button
            type="button"
            onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAllSelected ? "deselect" : "done_all"}
            </span>
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
        </div>

        {/* Optional Search if more than 5 friends */}
        {friends.length > 5 && (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input-bg border border-surface-container-high text-xs rounded-lg block w-full pl-8 pr-3 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        )}

        {/* Multi-Select Friends List (Clean, spacious rows with full names) */}
        <div className="flex flex-col divide-y divide-surface-container/60 max-h-56 overflow-y-auto pr-0.5">
          {filteredFriends.map((friend) => {
            const isSelected = participants.some((p) => p.personId === friend.id);
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => toggleParticipant(friend)}
                className={`flex items-center gap-3 py-2.5 px-2 rounded-lg text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-secondary/10 text-on-surface font-medium"
                    : "hover:bg-surface-container/40 text-on-surface-variant"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: friend.avatarColor || "var(--color-friend-avatar-fallback)" }}
                >
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-body-sm font-medium truncate flex-1 text-xs sm:text-sm text-on-surface">
                  {friend.name}
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
                    isSelected ? "text-secondary font-bold" : "text-on-surface-variant/40"
                  }`}
                >
                  {isSelected ? "check_circle" : "radio_button_unchecked"}
                </span>
              </button>
            );
          })}
        </div>

        {filteredFriends.length === 0 && (
          <p className="text-xs text-on-surface-variant text-center py-2">
            No friends found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Split Method Toggle */}
      <div className="flex bg-input-bg p-1 rounded-xl border border-surface-container-high">
        <button
          type="button"
          onClick={() => setSplitMethod("equal")}
          className={`flex-1 py-2 rounded-lg text-body-sm font-semibold transition-all cursor-pointer ${
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
          className={`flex-1 py-2 rounded-lg text-body-sm font-semibold transition-all cursor-pointer ${
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

      {/* Participants Breakdown List */}
      {participants.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden shadow-xs">
          {/* Me */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-container bg-surface-container-low/40">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[15px]">person</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface font-semibold flex-1">
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

          {/* Each selected friend */}
          {participants.map((p, idx) => (
            <div
              key={p.personId}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                idx < participants.length - 1 ? "border-b border-surface-container" : ""
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
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
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={p.customAmount}
                    onChange={(e) => updateCustomAmount(p.personId, e.target.value)}
                    className="bg-input-bg border border-surface-container-high text-primary text-xs rounded-lg focus:ring-1 focus:ring-secondary block w-full pl-6 pr-2 py-1.5 transition-colors"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => removeParticipant(p.personId)}
                title="Remove from split"
                className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 shrink-0 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 px-3 rounded-xl border border-dashed border-outline-variant bg-surface-container/20 text-on-surface-variant text-xs flex flex-col items-center gap-1.5">
          <span className="material-symbols-outlined text-[22px] opacity-60">group_off</span>
          <span>No friends selected yet. Tap friends above or click &apos;Select All&apos; to split.</span>
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
          <span className="opacity-70 font-bold">
            ₹{customTotal.toFixed(2)} / ₹{total.toFixed(2)}
          </span>
        </div>
      )}

      {/* Equal split info */}
      {splitMethod === "equal" && participants.length > 0 && total > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 text-secondary text-xs font-medium">
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>
            ₹{total.toFixed(2)} ÷ {totalPeople} people = ₹{equalShare.toFixed(2)} each
          </span>
        </div>
      )}
    </div>
  );
}
