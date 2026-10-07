"use client";

import React from "react";

interface BatLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function BatLoader({
  size = "md",
  className = "",
  label,
}: BatLoaderProps) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <span
        className={`bat-loader shrink-0 ${sizeClass}`}
        aria-hidden="true"
      />
      {label && <span className="font-body-sm text-body-sm font-medium">{label}</span>}
    </span>
  );
}
