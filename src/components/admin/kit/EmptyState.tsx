"use client";

/**
 * Admin kit — three empty states that must never look alike.
 *
 * "Nothing here" is three different facts, and the admin was drawing all of
 * them as one calm green checkmark:
 *
 *   all-clear    the queue really is empty and that is good news
 *   never-used   the feature has no history at all — unproven, not healthy.
 *                (Settlements showed "✅ the rail is clear" for a rail that
 *                had never carried a single order.)
 *   cannot-read  the query failed, so emptiness is unknown. A moderation
 *                queue that reports itself clean when its source is down is
 *                worse than one that shows an error.
 *
 * Only `all-clear` is allowed to look reassuring.
 */

import React from "react";

export type EmptyKind = "all-clear" | "never-used" | "cannot-read";

const KIND: Record<
  EmptyKind,
  { glyph: string; color: string; border: string }
> = {
  "all-clear": {
    glyph: "✓",
    color: "var(--status-ok)",
    border: "color-mix(in srgb, var(--status-ok), transparent 75%)",
  },
  "never-used": {
    // Hollow circle, not a check: nothing has been proven here.
    glyph: "◌",
    color: "var(--status-unknown)",
    border: "color-mix(in srgb, var(--status-unknown), transparent 70%)",
  },
  "cannot-read": {
    glyph: "⚠",
    color: "var(--status-warn)",
    border: "color-mix(in srgb, var(--status-warn), transparent 70%)",
  },
};

export interface EmptyStateProps {
  kind: EmptyKind;
  title: string;
  /** Say why it is empty, in the operator's terms. */
  description?: string;
  /** e.g. a retry control for `cannot-read`. */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  kind,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const style = KIND[kind];

  return (
    <div
      className={className}
      role={kind === "cannot-read" ? "alert" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "36px 20px",
        borderRadius: "var(--radius, 14px)",
        border: `1px ${kind === "never-used" ? "dashed" : "solid"} ${style.border}`,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 26,
          lineHeight: 1,
          color: style.color,
          marginBottom: 10,
        }}
      >
        {style.glyph}
      </span>

      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--fg-dim, #b5adcc)",
        }}
      >
        {title}
      </p>

      {description && (
        <p
          style={{
            margin: "6px 0 0",
            maxWidth: 420,
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--fg-mute, #6e6884)",
          }}
        >
          {description}
        </p>
      )}

      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
