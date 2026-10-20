"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/format";
import { settleDebt, deleteFriend } from "@/app/actions/friends";
import { toast } from "sonner";

export type LendingRecordItem = {
  id: string;
  direction: string;
  amount: number;
  occurredAt: Date | string;
  note?: string | null;
  status: string;
};

export type FriendItem = {
  id: string;
  name: string;
  avatarColor?: string | null;
  lendingRecords: LendingRecordItem[];
};

interface FriendListWithDetailsProps {
  friends: FriendItem[];
}

export function FriendListWithDetails({ friends }: FriendListWithDetailsProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedFriendId(null);
      }
    };
    if (selectedFriendId) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedFriendId]);

  // Derive active friend from updated friends list
  const activeFriend = friends.find((f) => f.id === selectedFriendId) || null;

  const handleSettle = async (recordId: string) => {
    setSettlingId(recordId);
    const toastId = toast.loading("Settling transaction...");
    try {
      const formData = new FormData();
      formData.append("recordId", recordId);
      const res = await settleDebt(formData);
      if (res?.success) {
        toast.success("Transaction settled successfully", { id: toastId });
      } else {
        toast.error(res?.error || "Failed to settle transaction", { id: toastId });
      }
    } catch {
      toast.error("Failed to settle transaction", { id: toastId });
    } finally {
      setSettlingId(null);
    }
  };

  const handleDelete = async (friendId: string, friendName: string) => {
    if (!confirm(`Are you sure you want to remove ${friendName}? This will delete all associated lending records.`)) {
      return;
    }
    setDeletingId(friendId);
    const toastId = toast.loading(`Removing ${friendName}...`);
    try {
      const formData = new FormData();
      formData.append("personId", friendId);
      const res = await deleteFriend(formData);
      if (res?.success) {
        toast.success(`${friendName} removed`, { id: toastId });
        if (selectedFriendId === friendId) {
          setSelectedFriendId(null);
        }
      } else {
        toast.error(res?.error || "Failed to remove friend", { id: toastId });
      }
    } catch {
      toast.error("Failed to remove friend", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-8 bg-surface-container-lowest rounded-xl border border-surface-container-high">
        <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">group</span>
        <p className="text-on-surface-variant">No friends added yet. Add your friends below to track splits.</p>
      </div>
    );
  }

  // Active friend calculations
  const totalLent = activeFriend
    ? activeFriend.lendingRecords.filter((r) => r.direction === "lent").reduce((acc, r) => acc + r.amount, 0)
    : 0;
  const totalBorrowed = activeFriend
    ? activeFriend.lendingRecords.filter((r) => r.direction === "borrowed").reduce((acc, r) => acc + r.amount, 0)
    : 0;
  const activeNet = totalLent - totalBorrowed;

  return (
    <>
      {/* Friends Cards List */}
      <div className="flex flex-col gap-3">
        {friends.map((friend) => {
          const lent = friend.lendingRecords
            .filter((r) => r.direction === "lent")
            .reduce((acc, r) => acc + r.amount, 0);
          const borrowed = friend.lendingRecords
            .filter((r) => r.direction === "borrowed")
            .reduce((acc, r) => acc + r.amount, 0);
          const friendNet = lent - borrowed;
          const openRecordsCount = friend.lendingRecords.length;

          return (
            <div
              key={friend.id}
              className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-surface-container-high p-4 flex items-center justify-between hover:border-secondary/50 transition-all group"
            >
              {/* Clickable info area */}
              <button
                type="button"
                onClick={() => setSelectedFriendId(friend.id)}
                className="flex items-center gap-3.5 text-left flex-1 min-w-0 cursor-pointer"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-xs"
                  style={{ backgroundColor: friend.avatarColor || "var(--color-friend-avatar-fallback)" }}
                >
                  {friend.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md text-on-surface font-semibold truncate">
                      {friend.name}
                    </span>
                    {openRecordsCount > 0 && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant shrink-0">
                        {openRecordsCount} {openRecordsCount === 1 ? "expense" : "expenses"}
                      </span>
                    )}
                  </div>

                  <div className="font-body-sm text-body-sm mt-0.5">
                    {friendNet > 0 && (
                      <span className="text-secondary font-bold">Owes you {formatMoney(friendNet)}</span>
                    )}
                    {friendNet < 0 && (
                      <span className="text-error font-bold">You owe {formatMoney(Math.abs(friendNet))}</span>
                    )}
                    {friendNet === 0 && (
                      <span className="text-on-surface-variant font-medium">Settled up</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => setSelectedFriendId(friend.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container hover:bg-secondary/10 hover:text-secondary text-on-surface transition-colors cursor-pointer"
                  title="View transaction details"
                >
                  <span>Details</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(friend.id, friend.name)}
                  disabled={deletingId === friend.id}
                  title="Delete friend"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 75% Mini Sub-Page / Bottom Sheet */}
      {activeFriend && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop click dismiss */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedFriendId(null)}
          />

          {/* Sub-Page Modal Content Container (75% height) */}
          <div className="relative z-10 w-full sm:max-w-xl h-[75vh] max-h-[85vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col border border-surface-container-high overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Mobile swipe handle bar */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-outline-variant/40" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-xs"
                  style={{ backgroundColor: activeFriend.avatarColor || "var(--color-friend-avatar-fallback)" }}
                >
                  {activeFriend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                    {activeFriend.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">Expense & Lending Details</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFriendId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Summary Stat Strip */}
            <div className="grid grid-cols-3 gap-2 px-6 py-3.5 bg-surface-container-low border-b border-surface-container text-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  THEY OWE YOU
                </span>
                <span className="text-sm font-bold text-secondary mt-0.5">
                  {formatMoney(totalLent)}
                </span>
              </div>
              <div className="flex flex-col border-x border-surface-container">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  YOU OWE THEM
                </span>
                <span className="text-sm font-bold text-error mt-0.5">
                  {formatMoney(totalBorrowed)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  NET BALANCE
                </span>
                <span
                  className={`text-sm font-bold mt-0.5 ${
                    activeNet > 0 ? "text-secondary" : activeNet < 0 ? "text-error" : "text-on-surface-variant"
                  }`}
                >
                  {activeNet > 0
                    ? `+${formatMoney(activeNet)}`
                    : activeNet < 0
                    ? `-${formatMoney(Math.abs(activeNet))}`
                    : "Settled"}
                </span>
              </div>
            </div>

            {/* Scrollable Details Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide">
                  ALL TRANSACTIONS ({activeFriend.lendingRecords.length})
                </span>
                {activeFriend.lendingRecords.length > 0 && (
                  <span className="text-xs text-on-surface-variant">Tap Settle once resolved</span>
                )}
              </div>

              {activeFriend.lendingRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[44px] text-secondary/60 mb-2">
                    check_circle
                  </span>
                  <p className="font-semibold text-on-surface text-sm">All Settled Up!</p>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                    There are no open expenses or pending debts with {activeFriend.name}.
                  </p>
                </div>
              ) : (
                activeFriend.lendingRecords.map((record) => {
                  const isLent = record.direction === "lent";
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-container hover:border-surface-container-high transition-colors"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              isLent ? "bg-secondary/15 text-secondary" : "bg-error-container text-error"
                            }`}
                          >
                            {isLent ? "They owe you" : "You owe them"}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {new Date(record.occurredAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                          {record.note || "Split expense"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`font-currency-sm text-currency-sm font-bold text-base ${
                            isLent ? "text-secondary" : "text-error"
                          }`}
                        >
                          {isLent ? "+" : "-"}
                          {formatMoney(record.amount)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSettle(record.id)}
                          disabled={settlingId === record.id}
                          className="text-xs font-semibold text-primary hover:bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant transition-all hover:border-primary disabled:opacity-50 cursor-pointer"
                        >
                          {settlingId === record.id ? "Settling..." : "Settle"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sub-Page Footer */}
            <div className="p-4 border-t border-surface-container bg-surface-container-lowest flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFriendId(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-medium text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
