"use client";

/**
 * "Resonance" — durable table comments (table_comments, NOT chat; live chat
 * is PR 3's conversations model). Any member may read and post; comments
 * keep accreting on the memory page.
 */

import { useCallback, useEffect, useState } from "react";
import { GlassPanel, LabelXS } from "@/components/tables/ui";
import type { TableComment } from "@/types/table";
import type { JSX } from "react";

export interface CommentListProps {
  tableId: string;
  hostId?: string;
  canComment: boolean;
  className?: string;
}

export function CommentList({
  tableId,
  hostId,
  canComment,
  className = "",
}: CommentListProps): JSX.Element {
  const [comments, setComments] = useState<TableComment[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/tables/${tableId}/comments`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { comments?: TableComment[] };
      setComments(data.comments ?? []);
    } catch {
      /* keep whatever we had */
    }
  }, [tableId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const post = async () => {
    const clean = body.trim();
    if (!clean || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tables/${tableId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: clean }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message || "Could not post that.");
        return;
      }
      setBody("");
      await refetch();
    } catch {
      setError("Could not post that.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <LabelXS className="text-alchm-fg-dim">Resonance</LabelXS>

      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-alchm-fg-mute">
          No memories added yet.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-white/5">
          {comments.map((comment) => (
            <li key={comment.id} className="py-3">
              <div className="flex items-baseline justify-between gap-2">
                <LabelXS
                  className={
                    hostId && comment.authorId === hostId
                      ? "text-alchm-copper-bright"
                      : "text-alchm-violet-bright"
                  }
                >
                  {comment.authorName || "A guest"}
                </LabelXS>
                <span className="shrink-0 text-[10px] font-mono text-alchm-fg-mute">
                  {new Date(comment.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-alchm-fg">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

      {canComment && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={body}
            maxLength={1000}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void post();
            }}
            placeholder="Add a memory..."
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-alchm-fg placeholder:text-alchm-fg-mute focus:border-alchm-violet focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void post()}
            disabled={posting || !body.trim()}
            className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm text-alchm-fg-dim transition-colors hover:text-alchm-fg disabled:opacity-40"
          >
            {posting ? "…" : "Post"}
          </button>
        </div>
      )}
    </GlassPanel>
  );
}

export default CommentList;
