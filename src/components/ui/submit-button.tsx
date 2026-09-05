"use client";

import { useFormStatus } from "react-dom";

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
      {pending && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      )}
      <span>{pending ? pendingText || "Saving..." : children}</span>
    </button>
  );
}
