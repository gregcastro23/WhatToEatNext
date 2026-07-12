"use client";

/**
 * useFollow — optimistic follow/unfollow against POST/DELETE /api/follows.
 * The server response's invisible reward (follow_made) is handed to the
 * delight host; failures roll the optimistic state back quietly.
 */

import { useCallback, useEffect, useState } from "react";
import { revealPracticeReward } from "@/lib/economy/practiceClient";

export interface UseFollowResult {
  following: boolean;
  busy: boolean;
  toggle: () => void;
}

export function useFollow(targetUserId: string, initialFollowing: boolean): UseFollowResult {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing, targetUserId]);

  const toggle = useCallback(() => {
    if (busy) return;
    const next = !following;
    setFollowing(next); // optimistic
    setBusy(true);
    void fetch("/api/follows", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as {
          success?: boolean;
          following?: boolean;
          reward?: { tokenType: string; amount: number; hint: string } | null;
        } | null;
        if (!res.ok || !json?.success) {
          setFollowing(!next); // roll back
          return;
        }
        if (typeof json.following === "boolean") setFollowing(json.following);
        if (json.reward) revealPracticeReward(json.reward);
      })
      .catch(() => setFollowing(!next))
      .finally(() => setBusy(false));
  }, [busy, following, targetUserId]);

  return { following, busy, toggle };
}
