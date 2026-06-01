"use client";

/**
 * Opens a group chat between the planetary-degree agents involved in a transit.
 *
 * Flow (matches the "deep-link to PA, new tab" + "create-then-redirect" decision):
 *   1. Open a blank tab SYNCHRONOUSLY inside the click handler — this preserves the
 *      user-gesture so the browser does not treat the post-await navigation as a
 *      blocked popup. We keep the window handle (no `noopener`) so we can point it
 *      at the session URL once it resolves.
 *   2. POST the participants to `/api/agents/group-chat`, which creates the PA
 *      session and returns the chat `url` (or a graceful single-agent fallback).
 *   3. Navigate the pre-opened tab to that url. If the popup was blocked we fall
 *      back to same-tab navigation.
 */

import { track } from "@vercel/analytics";
import { useCallback, useState } from "react";
import type { TransitParticipant, TransitDescriptor } from "@/lib/agents/transitAgents";

export function useTransitGroupChat() {
  const [pending, setPending] = useState(false);

  const open = useCallback(
    async (
      participants: TransitParticipant[],
      descriptor: TransitDescriptor,
      source = "transit-click",
    ) => {
      if (pending || !participants.length || typeof window === "undefined") return;

      // 1. Synchronous tab — keeps the gesture alive for the async navigation.
      const tab = window.open("about:blank", "_blank");
      setPending(true);

      try {
        track("transit_group_chat_open", {
          transit: descriptor.key,
          aspect: descriptor.aspect ?? "none",
          agents: participants.length,
          source,
        });
      } catch {
        /* analytics is best-effort */
      }

      try {
        const res = await fetch("/api/agents/group-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agents: participants, transit: descriptor, source }),
        });
        const data = (await res.json().catch(() => ({}))) as { url?: string };

        if (data.url) {
          if (tab) {
            try {
              tab.opener = null;
            } catch {
              /* cross-origin opener clear may throw — non-fatal */
            }
            tab.location.href = data.url;
          } else {
            // Popup blocked → navigate the current tab instead.
            window.location.href = data.url;
          }
        } else if (tab) {
          tab.close();
        }
      } catch {
        if (tab) tab.close();
      } finally {
        setPending(false);
      }
    },
    [pending],
  );

  return { open, pending };
}
