"use client";

/**
 * Host-only lifecycle controls: Set the Table Live (planned -> live),
 * Close the Table (live -> memory), Cancel (planned/live -> cancelled).
 * Server enforces host-only + race-safe guards; this component just
 * surfaces the right affordance per status.
 */

import { useState } from "react";
import { GradientButton, LabelXS } from "@/components/tables/ui";
import type { TableStatus } from "@/types/table";
import type { JSX } from "react";

export interface LifecycleControlsProps {
  tableId: string;
  status: TableStatus;
  onChanged?: () => void;
  className?: string;
}

type Action = "go-live" | "close" | "cancel";

export function LifecycleControls({
  tableId,
  status,
  onChanged,
  className = "",
}: LifecycleControlsProps): JSX.Element | null {
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (status === "memory" || status === "cancelled") return null;

  const run = async (action: Action) => {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/tables/${tableId}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message || "That didn't work — try again.");
        return;
      }
      setConfirmingCancel(false);
      onChanged?.();
    } catch {
      setError("That didn't work — try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={className}>
      {error && <p className="mb-2 text-sm text-rose-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {status === "planned" && (
          <GradientButton onClick={() => void run("go-live")} disabled={busy !== null}>
            {busy === "go-live" ? "Starting…" : "Set the Table Live"}
          </GradientButton>
        )}
        {status === "live" && (
          <GradientButton onClick={() => void run("close")} disabled={busy !== null}>
            {busy === "close" ? "Closing…" : "Close & Save the Memory"}
          </GradientButton>
        )}
        {!confirmingCancel ? (
          <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            disabled={busy !== null}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-alchm-fg-mute transition-colors hover:border-rose-400/40 hover:text-rose-400 disabled:opacity-40"
          >
            Cancel Table
          </button>
        ) : (
          <span className="inline-flex items-center gap-2">
            <LabelXS className="text-alchm-fg-dim">Cancel for everyone?</LabelXS>
            <button
              type="button"
              onClick={() => void run("cancel")}
              disabled={busy !== null}
              className="rounded-full border border-rose-400/40 px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
            >
              {busy === "cancel" ? "Cancelling…" : "Yes, cancel"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingCancel(false)}
              disabled={busy !== null}
              className="text-sm text-alchm-fg-mute hover:text-alchm-fg"
            >
              Keep it
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

export default LifecycleControls;
