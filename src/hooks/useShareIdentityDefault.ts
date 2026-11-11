"use client";

/**
 * useShareIdentityDefault — the composer half of the identity flip.
 *
 * Loads the caller's global share_identity default (GET /api/user/identity)
 * so "Post anonymously" checkboxes can pre-check for users who opted out.
 * Pair with shareIdentityForPost (src/lib/feed/identity.ts) to build the
 * per-post `shareIdentity` field. Fails open to the shared default —
 * exactly what the server stamps when the field is absent.
 */

import { useEffect, useState } from "react";
import { z } from "zod";
import { readJson } from "@/lib/api/json";

const UserIdentityResponseSchema = z.object({
  success: z.boolean().optional(),
  shareIdentity: z.boolean().optional(),
});

export interface ShareIdentityDefault {
  /** false until the GET resolves (or fails). */
  loaded: boolean;
  /** The user's global default: true = named, false = anonymous. */
  shareByDefault: boolean;
}

export function useShareIdentityDefault(): ShareIdentityDefault {
  const [state, setState] = useState<ShareIdentityDefault>({
    loaded: false,
    shareByDefault: true,
  });

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/user/identity")
      .then(async (res) => {
        if (!res.ok) return null;
        return await readJson(res, { parse: UserIdentityResponseSchema.parse });
      })
      .then((json) => {
        if (cancelled) return;
        setState({
          loaded: true,
          shareByDefault: json?.success ? json.shareIdentity !== false : true,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, shareByDefault: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
