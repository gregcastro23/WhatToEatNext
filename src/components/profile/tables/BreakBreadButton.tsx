"use client";

/**
 * BREAK BREAD — the profile's primary social CTA (design-spec §3.5).
 * Deep-links into the PR 2 tables create/invite flow with this user
 * pre-selected. Until the tables schema exists (the API reports table
 * counts as null), it falls back to the commensal surface.
 */

import Link from "next/link";
import type { JSX } from "react";

export const BREAK_BREAD_FALLBACK_HREF = "/commensal";

export interface BreakBreadButtonProps {
  inviteUserId: string;
  /** social.tablesHosted !== null ⇒ the PR 2 tables feature is live. */
  tablesAvailable: boolean;
  className?: string;
}

export function BreakBreadButton({
  inviteUserId,
  tablesAvailable,
  className = "",
}: BreakBreadButtonProps): JSX.Element {
  const href = tablesAvailable
    ? `/tables?invite=${encodeURIComponent(inviteUserId)}`
    : BREAK_BREAD_FALLBACK_HREF;
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold border border-alchm-copper/40 bg-alchm-copper/10 text-alchm-copper-bright hover:border-alchm-copper/70 hover:shadow-[0_0_20px_rgba(254,193,132,0.25)] transition-all ${className}`}
    >
      BREAK BREAD
    </Link>
  );
}

export default BreakBreadButton;
