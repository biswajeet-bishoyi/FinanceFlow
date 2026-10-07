"use client";

import { useFormStatus } from "react-dom";
import { BatLoader } from "./bat-loader";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className || ""} ${
        pending ? "opacity-75 cursor-not-allowed pointer-events-none" : ""
      } flex items-center justify-center gap-2 transition-all`}
    >
      {pending && <BatLoader size="sm" />}
      <span>{pending ? pendingText || "Saving..." : children}</span>
    </button>
  );
}
