"use client";

/**
 * CommentThread — expandable comment panel under a feed card. Lazy-fetches on
 * first expand, keyset "View earlier" paging, and renders each comment with a
 * 28px avatar (kit sigil fallback), the author name (violet — copper when the
 * author is the event actor, design-spec §3.4), the body (escaped by React,
 * with http(s) links linkified rel="…ugc"), a relative timestamp, and an
 * overflow menu (Delete own / Report).
 */

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { CommentComposer } from "@/components/feed/CommentComposer";
import { ReportCommentDialog } from "@/components/feed/ReportCommentDialog";
import { AvatarCircle } from "@/components/tables/ui";
import type { Element } from "@/components/tables/ui";
import type { FeedComment } from "@/services/feedCommentsDatabaseService";

const ELEMENTS = new Set(["Fire", "Water", "Earth", "Air"]);
function toElement(raw: string | null): Element {
  return raw && ELEMENTS.has(raw) ? (raw as Element) : "Air";
}

function relativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86_400)}d`;
}

/** Split a body into text + http(s) link tokens. React escapes the text. */
const URL_RE = /(https?:\/\/[^\s<]+)/g;
function renderBody(body: string): Array<string | JSX.Element> {
  const parts = body.split(URL_RE);
  return parts.map((part, i) =>
    URL_RE.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        className="text-purple-300 underline underline-offset-2 hover:text-purple-200 break-all"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export interface CommentThreadProps {
  eventId: string;
  open: boolean;
  onCountChange?: (count: number) => void;
}

export function CommentThread({ eventId, open, onCountChange }: CommentThreadProps): JSX.Element | null {
  const { data: session } = useSession();
  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [comments, setComments] = useState<FeedComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const load = useCallback(
    async (before?: string | null) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ eventId, limit: "30" });
        if (before) qs.set("before", before);
        const res = await fetch(`/api/feed/comments?${qs.toString()}`);
        const json = (await res.json()) as {
          success?: boolean;
          comments?: FeedComment[];
          nextCursor?: string | null;
        };
        if (json.success && json.comments) {
          // Older pages prepend (the service returns each page ascending).
          setComments((prev) => (before ? [...json.comments!, ...prev] : json.comments!));
          setNextCursor(json.nextCursor ?? null);
        }
      } catch {
        /* silent — an empty thread is a valid state */
      } finally {
        setLoading(false);
      }
    },
    [eventId],
  );

  // Lazy-fetch on first expand.
  useEffect(() => {
    if (open && !fetchedRef.current) {
      fetchedRef.current = true;
      void load();
    }
  }, [open, load]);

  const handlePosted = useCallback(
    (comment: FeedComment) => {
      setComments((prev) => {
        const next = [...prev, comment];
        onCountChange?.(next.length);
        return next;
      });
    },
    [onCountChange],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setMenuFor(null);
      try {
        const res = await fetch(`/api/feed/comments/${id}`, { method: "DELETE" });
        if (res.ok) {
          setComments((prev) => {
            const next = prev.filter((c) => c.id !== id);
            onCountChange?.(next.length);
            return next;
          });
        }
      } catch {
        /* silent */
      }
    },
    [onCountChange],
  );

  if (!open) return null;

  return (
    <div className="mt-3 border-t border-white/8 pt-3">
      {nextCursor && (
        <button
          type="button"
          onClick={() => void load(nextCursor)}
          disabled={loading}
          className="mb-2 text-[11px] font-bold uppercase tracking-widest text-purple-300/70 hover:text-purple-200 disabled:opacity-50"
        >
          {loading ? "Loading…" : "View earlier"}
        </button>
      )}

      {comments.length === 0 && !loading ? (
        <p className="mb-3 text-xs text-white/35">No memories yet — be the first.</p>
      ) : (
        <ul className="mb-3 space-y-3">
          {comments.map((c) => {
            const canDelete = isAdmin || (viewerId !== null && viewerId === c.authorId);
            return (
              <li key={c.id} className="flex items-start gap-2.5">
                <AvatarCircle
                  name={c.authorName}
                  src={c.authorImage ?? undefined}
                  element={toElement(c.authorElement)}
                  size={28}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/85 break-words">
                    <span
                      className={`mr-1.5 text-[11px] font-bold uppercase tracking-wide ${
                        c.isEventActor ? "text-amber-300/90" : "text-purple-300"
                      }`}
                    >
                      {c.authorName}
                    </span>
                    <span className="text-white/80">{renderBody(c.body)}</span>
                  </p>
                  <span className="text-[10px] text-white/30 font-mono">{relativeTime(c.createdAt)} ago</span>
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMenuFor(menuFor === c.id ? null : c.id)}
                    aria-label="Comment actions"
                    className="rounded-full px-1.5 text-white/40 hover:text-white/80"
                  >
                    ⋯
                  </button>
                  {menuFor === c.id && (
                    <div className="absolute right-0 top-6 z-10 w-28 overflow-hidden rounded-lg border border-white/10 bg-[#141019] shadow-xl">
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void handleDelete(c.id)}
                          className="block w-full px-3 py-2 text-left text-xs text-rose-300 hover:bg-white/5"
                        >
                          Delete
                        </button>
                      )}
                      {!canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuFor(null);
                            setReportId(c.id);
                          }}
                          className="block w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5"
                        >
                          Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CommentComposer eventId={eventId} onPosted={handlePosted} />

      {reportId && (
        <ReportCommentDialog commentId={reportId} onClose={() => setReportId(null)} />
      )}
    </div>
  );
}

export default CommentThread;
