"use client";

import { useState } from "react";
import { SystemNotification } from "@/domain/notifications";
import Link from "next/link";

export function NotificationsView({ initialNotifications }: { initialNotifications: SystemNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-xs">
        <span className="font-label-caps text-xs text-on-surface-variant font-semibold">
          {notifications.length} Alerts & Updates
        </span>

        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <>
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-error hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-surface-container-high flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-outline text-[48px]">notifications_off</span>
            <p className="font-headline-md text-on-surface font-semibold">All Caught Up!</p>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-xs">
              No new alerts right now. We will notify you about budget limits, safe daily spend updates, and bills.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all shadow-xs ${
                notif.isRead
                  ? "bg-surface-container-lowest border-surface-container opacity-70"
                  : "bg-surface-container-lowest border-surface-container-high ring-1 ring-primary/10"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${notif.color}`}>
                <span className="material-symbols-outlined text-[22px]">{notif.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">{notif.title}</h3>
                  <span className="font-label-caps text-[10px] text-on-surface-variant shrink-0 bg-surface-container px-2 py-0.5 rounded">
                    {notif.timeAgo}
                  </span>
                </div>

                <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.actionUrl && notif.actionLabel && (
                  <div className="mt-3">
                    <Link
                      href={notif.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {notif.actionLabel}
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
