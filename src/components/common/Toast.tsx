"use client";

/**
 * Toast Notification Component & Hook
 *
 * @file src/components/common/Toast.tsx
 * @created 2026-01-28
 */

import React, { useEffect, useState, useCallback } from "react";

interface ToastData {
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps extends ToastData {
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${typeStyles[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50`}
      role="alert"
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <p className="font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-75 focus:outline-none"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

/** Hook for toast management */
export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const dismiss = useCallback(() => setToast(null), []);

  const showSuccess = useCallback(
    (message: string) => setToast({ type: "success", message }),
    []
  );
  const showError = useCallback(
    (message: string) => setToast({ type: "error", message }),
    []
  );
  const showInfo = useCallback(
    (message: string) => setToast({ type: "info", message }),
    []
  );

  const ToastComponent = toast ? (
    <Toast type={toast.type} message={toast.message} onClose={dismiss} />
  ) : null;

  return { toast: ToastComponent, showSuccess, showError, showInfo };
}
