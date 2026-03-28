"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

type ToastType = "success" | "info" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  /** Show a toast notification */
  showToast: (
    message: string,
    type?: ToastType,
    options?: { duration?: number; action?: Toast["action"] },
  ) => void;
  /** Dismiss a specific toast */
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  dismiss: () => {},
});

const TOAST_COLORS: Record<ToastType, { bg: string; border: string }> = {
  success: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.4)" },
  info: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)" },
  warning: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)" },
  error: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      options?: { duration?: number; action?: Toast["action"] },
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const duration = options?.duration ?? (type === "error" ? 6000 : 4000);

      const toast: Toast = { id, message, type, duration, action: options?.action };

      setToasts((prev) => {
        // Limit to 5 toasts max
        const updated = [...prev, toast];
        return updated.length > 5 ? updated.slice(-5) : updated;
      });

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      {toasts.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxWidth: "400px",
            pointerEvents: "none",
          }}
        >
          {toasts.map((toast) => {
            const colors = TOAST_COLORS[toast.type];
            return (
              <div
                key={toast.id}
                style={{
                  padding: "0.75rem 1rem",
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  backdropFilter: "blur(12px)",
                  pointerEvents: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  animation: "slideInRight 0.25s ease-out",
                }}
                role="alert"
              >
                <span style={{ flex: 1, fontSize: "0.875rem" }}>
                  {toast.message}
                </span>
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    style={{
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.15)",
                      color: "inherit",
                      border: "none",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismiss(toast.id)}
                  style={{
                    padding: "0.125rem 0.375rem",
                    fontSize: "0.875rem",
                    background: "transparent",
                    color: "inherit",
                    border: "none",
                    cursor: "pointer",
                    opacity: 0.5,
                  }}
                  aria-label="Dismiss"
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export default ToastProvider;
