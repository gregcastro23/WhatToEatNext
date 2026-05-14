"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ToastProvider";
import { useNotifications } from "@/hooks/useNotifications";

const STORAGE_KEY = "alchm.masterQuestBroadcastsSeen";
const MAX_SEEN_IDS = 200;
const POLL_INTERVAL_MS = 45_000;

function loadSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function persistSeenIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = Array.from(ids).slice(-MAX_SEEN_IDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // best-effort; storage might be disabled
  }
}

export function MasterQuestBroadcastListener() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { notifications } = useNotifications({
    enabled: isAuthenticated,
    pollingMs: POLL_INTERVAL_MS,
  });
  const { showToast } = useToast();
  const seenRef = useRef<Set<string>>(loadSeenIds());

  useEffect(() => {
    if (notifications.length === 0) return;

    const seen = seenRef.current;
    let added = false;

    for (const n of notifications) {
      if (n.type !== "master_quest_broadcast") continue;
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      added = true;

      showToast(n.message || n.title, "info", { duration: 8000 });
    }

    if (added) persistSeenIds(seen);
  }, [notifications, showToast]);

  return null;
}

export default MasterQuestBroadcastListener;
