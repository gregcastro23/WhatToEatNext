"use client";

/**
 * PlannerUndoToast — non-blocking toast with an optional Undo action.
 *
 * @file src/components/menu-planner/shell/PlannerUndoToast.tsx
 */

import { Undo2, X } from "lucide-react";
import React from "react";
import { usePlannerUI } from "./PlannerUIContext";

export default function PlannerUndoToast(): React.ReactElement | null {
  const { state, dismissToast } = usePlannerUI();
  const { undoToast } = state;

  if (!undoToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full border border-active-violet/40 bg-surface-container-high/95 backdrop-blur-md text-primary shadow-2xl font-mono text-xs animate-slide-up"
    >
      <span>{undoToast.message}</span>
      {undoToast.onUndo && (
        <button
          type="button"
          onClick={() => {
            dismissToast();
            undoToast.onUndo?.();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-active-violet text-background font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
        >
          <Undo2 className="h-3 w-3" />
          Undo
        </button>
      )}
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Dismiss notification"
        className="text-on-surface-variant hover:text-primary transition-colors p-0.5 ml-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
