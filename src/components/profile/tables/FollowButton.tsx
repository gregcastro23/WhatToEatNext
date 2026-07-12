"use client";

/**
 * FOLLOW / FOLLOWING pill for profile headers (design-spec §3.5). Renders
 * nothing unless the API sent a viewer state (signed-out viewers, the owner,
 * and blocked pairs all get `viewer: null` and therefore no button).
 */

import { GradientButton } from "@/components/tables/ui";
import { useFollow } from "@/hooks/useFollow";
import type { JSX } from "react";

export interface FollowButtonProps {
  targetUserId: string;
  /** social.viewer from GET /api/users/[userId]; null hides the button. */
  viewer: { follows: boolean; followedBy: boolean } | null;
  className?: string;
}

export function FollowButton({ targetUserId, viewer, className = "" }: FollowButtonProps): JSX.Element | null {
  // All hooks before any early return (rules-of-hooks).
  const { following, busy, toggle } = useFollow(targetUserId, viewer?.follows === true);
  if (!viewer) return null;

  if (following) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed
        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold border border-white/20 bg-white/5 text-alchm-fg-dim hover:border-white/35 hover:text-white transition-all disabled:opacity-50 ${className}`}
      >
        FOLLOWING
      </button>
    );
  }
  return (
    <GradientButton onClick={toggle} disabled={busy} aria-pressed={false} className={className}>
      {viewer.followedBy ? "FOLLOW BACK" : "FOLLOW"}
    </GradientButton>
  );
}

export default FollowButton;
