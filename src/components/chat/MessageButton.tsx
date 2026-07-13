"use client";

/**
 * MessageButton — the DM affordance on a linked-companion card
 * (docs/plans/pr3-messaging-plan.md §5). Ensures the canonical DM conversation
 * for the pair and navigates to it. Renders NOTHING when the client DM flag is
 * off (NEXT_PUBLIC_CHAT_DMS), so companion cards stay unchanged until DMs open.
 * Server-side gates (accepted-commensal, blocks) still apply on ensure.
 */

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isDmsEnabledClient } from "@/lib/chat/flags";
import type { JSX } from "react";

export interface MessageButtonProps {
  otherUserId: string;
  className?: string;
  label?: string;
}

export function MessageButton({
  otherUserId,
  className = "",
  label = "Message",
}: MessageButtonProps): JSX.Element | null {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (!isDmsEnabledClient()) return null;

  const open = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind: "dm", otherUserId }),
      });
      if (!res.ok) {
        setError(true);
        setBusy(false);
        return;
      }
      const data = (await res.json()) as { conversation?: { id: string } };
      if (data.conversation?.id) {
        router.push(`/messages/${data.conversation.id}`);
        return;
      }
      setError(true);
      setBusy(false);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void open();
      }}
      disabled={busy}
      title={error ? "Couldn't open the conversation" : label}
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:border-purple-200 hover:text-purple-600 disabled:opacity-50 ${className}`}
    >
      <MessageCircle size={13} aria-hidden />
      {label}
    </button>
  );
}

export default MessageButton;
