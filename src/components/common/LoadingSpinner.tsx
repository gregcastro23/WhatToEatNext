"use client";

/**
 * Loading Spinner Component
 * Reusable spinner with optional message
 *
 * @file src/components/common/LoadingSpinner.tsx
 * @created 2026-01-28
 */

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export default function LoadingSpinner({
  size = "md",
  message,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizes[size]} border-gray-300 border-t-amber-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
