"use client";

/**
 * CommentComposer — inline "Add a memory..." composer built from kit primitives
 * (GlassPanel shell + transparent input + GradientButton send). Signed-out
 * viewers get a sign-in link instead. Posts to /api/feed/comments, appends the
 * canonical comment optimistically via onPosted, and reveals a practice reward
 * when the response carries one.
 */

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useState, type JSX } from "react";
import { GlassPanel, GradientButton } from "@/components/tables/ui";
import { revealPracticeReward } from "@/lib/economy/practiceClient";
import type { FeedComment } from "@/services/feedCommentsDatabaseService";

const MAX = 1000;

export interface CommentComposerProps {
  eventId: string;
  onPosted: (comment: FeedComment) => void;
}

export function CommentComposer({ eventId, onPosted }: CommentComposerProps): JSX.Element {
  const { status } = useSession();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    const body = value.trim();
    if (!body || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/feed/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, body }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        comment?: FeedComment;
        reward?: { tokenType: string; amount: number; hint: string } | null;
        message?: string;
      };
      if (json.success && json.comment) {
        onPosted(json.comment);
        setValue("");
        if (json.reward) revealPracticeReward(json.reward);
      } else {
        setError(json.message || "Could not post your comment.");
      }
    } catch {
      setError("Could not post your comment.");
    } finally {
      setBusy(false);
    }
  }, [busy, eventId, onPosted, value]);

  if (status !== "authenticated") {
    return (
      <p className="text-xs text-white/45">
        <Link href="/login" className="text-purple-300 underline underline-offset-2 hover:text-purple-200">
          Sign in
        </Link>{" "}
        to leave a memory.
      </p>
    );
  }

  return (
    <div>
      <GlassPanel className="flex items-center gap-2 px-3 py-2">
        <input
          type="text"
          value={value}
          maxLength={MAX}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Add a memory..."
          aria-label="Add a comment"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
        <GradientButton
          onClick={() => void submit()}
          disabled={busy || !value.trim()}
          className="px-4 py-1.5 text-xs"
        >
          {busy ? "Posting…" : "Send"}
        </GradientButton>
      </GlassPanel>
      {error && <p className="mt-1.5 text-[11px] text-rose-300">{error}</p>}
    </div>
  );
}

export default CommentComposer;
